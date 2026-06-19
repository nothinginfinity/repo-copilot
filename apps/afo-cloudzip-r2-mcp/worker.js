const VERSION = "0.1.0";
const WORKER_NAME = "afo-cloudzip-r2-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

const MAX_RESPONSE_CHARS = 30000;
const INLINE_TEXT_CAP = 60000;
const INLINE_BASE64_CAP = 50000;

const TOOLS = [
  {
    name: "cloudzip_status",
    description: "Health check. Shows binding presence for R2 S3-API credentials.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "r2_list",
    description: "List objects in an R2 bucket via the S3-compatible API, optionally filtered by prefix. Paginate with continuation_token from a prior call's next_token.",
    inputSchema: {
      type: "object",
      properties: {
        bucket: { type: "string", description: "Defaults to DEFAULT_BUCKET if omitted" },
        prefix: { type: "string" },
        max_keys: { type: "number", description: "Default 100, max 1000" },
        continuation_token: { type: "string" }
      },
      required: []
    }
  },
  {
    name: "r2_get",
    description: "Get an R2 object directly. Text/JSON content under ~60KB is inlined. Larger or binary content returns metadata plus a presigned URL you can fetch directly instead.",
    inputSchema: {
      type: "object",
      properties: {
        bucket: { type: "string" },
        key: { type: "string" },
        force_base64: { type: "boolean", description: "Force base64 inlining even for binary content, up to ~50KB" }
      },
      required: ["key"]
    }
  },
  {
    name: "r2_put",
    description: "Write an object to R2 directly. content is a string; set encoding to 'base64' for binary data, otherwise it's written as-is (text/JSON/etc).",
    inputSchema: {
      type: "object",
      properties: {
        bucket: { type: "string" },
        key: { type: "string" },
        content: { type: "string" },
        encoding: { type: "string", description: "'text' (default) or 'base64'" },
        content_type: { type: "string", description: "Defaults to application/octet-stream" }
      },
      required: ["key", "content"]
    }
  },
  {
    name: "r2_delete",
    description: "Delete an object from R2.",
    inputSchema: {
      type: "object",
      properties: { bucket: { type: "string" }, key: { type: "string" } },
      required: ["key"]
    }
  },
  {
    name: "r2_head",
    description: "Get an object's metadata (size, content-type, etag, last-modified) without fetching its body.",
    inputSchema: {
      type: "object",
      properties: { bucket: { type: "string" }, key: { type: "string" } },
      required: ["key"]
    }
  },
  {
    name: "r2_presign",
    description: "Generate a presigned URL for an R2 object, usable directly via curl/browser without any credentials. Use this for large files instead of inlining content.",
    inputSchema: {
      type: "object",
      properties: {
        bucket: { type: "string" },
        key: { type: "string" },
        method: { type: "string", description: "'GET' (default) or 'PUT'" },
        expires_seconds: { type: "number", description: "Default 3600, max 604800 (7 days)" }
      },
      required: ["key"]
    }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, text) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

function truncate(str) {
  if (str.length <= MAX_RESPONSE_CHARS) return str;
  return str.slice(0, MAX_RESPONSE_CHARS) + `\n...[truncated, ${str.length} total chars]`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, opts, maxRetries = 3) {
  let res;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    res = await fetch(url, opts);
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === maxRetries) return res;
    const retryAfterHeader = res.headers.get("retry-after");
    let delayMs = retryAfterHeader ? parseFloat(retryAfterHeader) * 1000 : 1000 * Math.pow(2, attempt);
    if (!Number.isFinite(delayMs)) delayMs = 2000;
    await sleep(Math.min(delayMs, 15000));
  }
  return res;
}

// =================== SigV4 primitives ===================

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(hash);
}

async function hmac(keyBytes, message) {
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

function amzDateNow() {
  const iso = new Date().toISOString();
  return iso.replace(/[:\-]|\.\d{3}/g, "");
}

function awsUriEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function canonicalUriFor(bucket, key) {
  const path = "/" + bucket + (key ? "/" + key : "");
  return path.split("/").map(seg => (seg === "" ? "" : awsUriEncode(seg))).join("/");
}

function canonicalQueryString(params) {
  const keys = Object.keys(params || {}).sort();
  return keys.map(k => awsUriEncode(k) + "=" + awsUriEncode(String(params[k]))).join("&");
}

function canonicalHeadersFor(headersObj) {
  const lower = {};
  for (const [k, v] of Object.entries(headersObj)) lower[k.toLowerCase()] = String(v).trim().replace(/\s+/g, " ");
  const sortedKeys = Object.keys(lower).sort();
  const canonical = sortedKeys.map(k => `${k}:${lower[k]}\n`).join("");
  const signedHeaders = sortedKeys.join(";");
  return { canonical, signedHeaders };
}

async function getSigningKey(secretKey, dateStamp, region, service) {
  let key = new TextEncoder().encode("AWS4" + secretKey);
  key = await hmac(key, dateStamp);
  key = await hmac(key, region);
  key = await hmac(key, service);
  key = await hmac(key, "aws4_request");
  return key;
}

function r2Creds(env) {
  const accessKey = env.R2_ACCESS_KEY_ID;
  const secretKey = env.R2_SECRET_ACCESS_KEY;
  const accountId = env.R2_ACCOUNT_ID;
  if (!accessKey || !secretKey || !accountId) {
    throw new Error("R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ACCOUNT_ID bindings are all required");
  }
  return { accessKey, secretKey, accountId, host: `${accountId}.r2.cloudflarestorage.com`, region: "auto", service: "s3" };
}

// Header-signed request: used for actual GET/PUT/DELETE/HEAD/LIST calls
async function r2Request(env, method, bucket, key, queryParams, extraHeaders, body) {
  const { accessKey, secretKey, host, region, service } = r2Creds(env);
  const amzDate = amzDateNow();
  const dateStamp = amzDate.slice(0, 8);

  const payloadBytes = body ? (typeof body === "string" ? new TextEncoder().encode(body) : body) : new Uint8Array(0);
  const payloadHash = await sha256Hex(payloadBytes);

  const headersToSign = Object.assign(
    { host, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate },
    extraHeaders || {}
  );
  const { canonical: canHeaders, signedHeaders } = canonicalHeadersFor(headersToSign);
  const canUri = canonicalUriFor(bucket, key);
  const canQS = canonicalQueryString(queryParams || {});
  const canonicalRequest = [method, canUri, canQS, canHeaders, signedHeaders, payloadHash].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signature = bytesToHex(await hmac(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${host}${canUri}${canQS ? "?" + canQS : ""}`;
  const fetchHeaders = Object.assign({}, extraHeaders, {
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    Authorization: authHeader
  });

  return fetchWithRetry(url, { method, headers: fetchHeaders, body: body || undefined });
}

// Query-string-signed presigned URL (no Authorization header, signature lives in the URL itself)
async function r2PresignUrl(env, method, bucket, key, expiresSeconds) {
  const { accessKey, secretKey, host, region, service } = r2Creds(env);
  const amzDate = amzDateNow();
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const queryParams = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(Math.min(expiresSeconds || 3600, 604800)),
    "X-Amz-SignedHeaders": "host"
  };

  const canUri = canonicalUriFor(bucket, key);
  const canQS = canonicalQueryString(queryParams);
  const canHeaders = `host:${host}\n`;
  const canonicalRequest = [method, canUri, canQS, canHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp, region, service);
  const signature = bytesToHex(await hmac(signingKey, stringToSign));

  return `https://${host}${canUri}?${canQS}&X-Amz-Signature=${signature}`;
}

// =================== XML parsing (ListObjectsV2 response) ===================

function decodeXmlEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function parseListObjectsXml(xml) {
  const contents = [];
  const blocks = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) || [];
  for (const block of blocks) {
    const key = (block.match(/<Key>([\s\S]*?)<\/Key>/) || [])[1];
    const size = (block.match(/<Size>([\s\S]*?)<\/Size>/) || [])[1];
    const lastModified = (block.match(/<LastModified>([\s\S]*?)<\/LastModified>/) || [])[1];
    const etag = (block.match(/<ETag>([\s\S]*?)<\/ETag>/) || [])[1];
    contents.push({
      key: key ? decodeXmlEntities(key) : null,
      size: size ? Number(size) : null,
      last_modified: lastModified || null,
      etag: etag || null
    });
  }
  const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
  const nextToken = (xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1] || null;
  const keyCountMatch = (xml.match(/<KeyCount>([\s\S]*?)<\/KeyCount>/) || [])[1];
  return { contents, is_truncated: isTruncated, next_token: nextToken, key_count: keyCountMatch ? Number(keyCountMatch) : contents.length };
}

function looksLikeText(contentType) {
  if (!contentType) return false;
  return /^text\/|application\/(json|xml|javascript|x-yaml|yaml)/.test(contentType);
}

// =================== Dispatch ===================

async function dispatch(name, args, env) {
  const bucket = args.bucket || env.DEFAULT_BUCKET;
  if (!bucket && name !== "cloudzip_status") throw new Error("bucket is required (no DEFAULT_BUCKET set)");

  if (name === "cloudzip_status") {
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        R2_ACCESS_KEY_ID: Boolean(env.R2_ACCESS_KEY_ID),
        R2_SECRET_ACCESS_KEY: Boolean(env.R2_SECRET_ACCESS_KEY),
        R2_ACCOUNT_ID: Boolean(env.R2_ACCOUNT_ID),
        DEFAULT_BUCKET: env.DEFAULT_BUCKET || null
      },
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "r2_list") {
    const queryParams = { "list-type": "2", "max-keys": Math.min(args.max_keys || 100, 1000) };
    if (args.prefix) queryParams.prefix = args.prefix;
    if (args.continuation_token) queryParams["continuation-token"] = args.continuation_token;
    const res = await r2Request(env, "GET", bucket, null, queryParams, {});
    const xml = await res.text();
    if (!res.ok) throw new Error(`R2 list failed: HTTP ${res.status} - ${xml.slice(0, 400)}`);
    return Object.assign({ bucket, prefix: args.prefix || null }, parseListObjectsXml(xml));
  }

  if (name === "r2_get") {
    const { key } = args;
    if (!key) throw new Error("key is required");
    const res = await r2Request(env, "GET", bucket, key, null, {});
    if (res.status === 404) return { found: false, bucket, key };
    if (!res.ok) { const t = await res.text(); throw new Error(`R2 get failed: HTTP ${res.status} - ${t.slice(0, 400)}`); }
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentLength = Number(res.headers.get("content-length") || 0);
    const etag = res.headers.get("etag");
    const presigned = await r2PresignUrl(env, "GET", bucket, key, 3600);

    if (looksLikeText(contentType) && contentLength <= INLINE_TEXT_CAP) {
      const text = await res.text();
      return { found: true, bucket, key, content_type: contentType, size: contentLength, etag, encoding: "text", content: text, presigned_url: presigned };
    }
    if (args.force_base64 && contentLength <= INLINE_BASE64_CAP) {
      const buf = await res.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return { found: true, bucket, key, content_type: contentType, size: contentLength, etag, encoding: "base64", content: b64, presigned_url: presigned };
    }
    return { found: true, bucket, key, content_type: contentType, size: contentLength, etag, encoding: "none", note: "Content not inlined (binary or too large) - use presigned_url to fetch it directly, or pass force_base64:true for small binaries.", presigned_url: presigned };
  }

  if (name === "r2_put") {
    const { key, content, content_type } = args;
    if (!key || content === undefined) throw new Error("key and content are required");
    const encoding = args.encoding || "text";
    let bodyBytes;
    if (encoding === "base64") {
      const bin = atob(content);
      bodyBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bodyBytes[i] = bin.charCodeAt(i);
    } else {
      bodyBytes = new TextEncoder().encode(content);
    }
    const ct = content_type || (encoding === "base64" ? "application/octet-stream" : "text/plain; charset=utf-8");
    const res = await r2Request(env, "PUT", bucket, key, null, { "content-type": ct }, bodyBytes);
    if (!res.ok) { const t = await res.text(); throw new Error(`R2 put failed: HTTP ${res.status} - ${t.slice(0, 400)}`); }
    return { ok: true, bucket, key, size: bodyBytes.length, content_type: ct, etag: res.headers.get("etag") };
  }

  if (name === "r2_delete") {
    const { key } = args;
    if (!key) throw new Error("key is required");
    const res = await r2Request(env, "DELETE", bucket, key, null, {});
    if (!res.ok && res.status !== 404) { const t = await res.text(); throw new Error(`R2 delete failed: HTTP ${res.status} - ${t.slice(0, 400)}`); }
    return { ok: true, bucket, key };
  }

  if (name === "r2_head") {
    const { key } = args;
    if (!key) throw new Error("key is required");
    const res = await r2Request(env, "HEAD", bucket, key, null, {});
    if (res.status === 404) return { found: false, bucket, key };
    if (!res.ok) throw new Error(`R2 head failed: HTTP ${res.status}`);
    return {
      found: true, bucket, key,
      size: Number(res.headers.get("content-length") || 0),
      content_type: res.headers.get("content-type"),
      etag: res.headers.get("etag"),
      last_modified: res.headers.get("last-modified")
    };
  }

  if (name === "r2_presign") {
    const { key, method, expires_seconds } = args;
    if (!key) throw new Error("key is required");
    const url = await r2PresignUrl(env, (method || "GET").toUpperCase(), bucket, key, expires_seconds);
    return { bucket, key, method: (method || "GET").toUpperCase(), expires_seconds: Math.min(expires_seconds || 3600, 604800), url };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health") return j({ status: "ok", worker: WORKER_NAME, version: VERSION });
    if (request.method !== "POST") return j({ error: "POST /mcp required" }, 404);
    let body;
    try { body = await request.json(); } catch { return er(null, -32700, "Parse error"); }
    const { id = null, method, params = {} } = body;
    try {
      if (method === "initialize") {
        return rr(id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: WORKER_NAME, version: VERSION } });
      }
      if (method === "notifications/initialized") return new Response(null, { status: 204, headers: CORS });
      if (method === "ping") return rr(id, {});
      if (method === "tools/list") return rr(id, { tools: TOOLS });
      if (method === "tools/call") {
        let result;
        try {
          result = await dispatch(params?.name, params?.arguments || {}, env);
        } catch (e) {
          return tr(id, `Error: ${e.message}`);
        }
        return tr(id, truncate(JSON.stringify(result, null, 2)));
      }
      return er(id, -32601, `Method not found: ${method}`);
    } catch (e) {
      return er(id, -32603, `Tool error: ${e.message}`);
    }
  }
};
