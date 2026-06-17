const VERSION = "0.1.0";
const WORKER_NAME = "afo-cf-universal-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const SPEC_CANDIDATE_URLS = [
  "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
  "https://raw.githubusercontent.com/cloudflare/api-schemas/master/openapi.json",
  "https://raw.githubusercontent.com/cloudflare/api-schemas/production/openapi.json"
];

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const INDEX_KEY = "index";
const META_KEY = "meta";

const TOOLS = [
  {
    name: "api_status",
    description: "Health check. Returns binding presence and spec index status (built, endpoint count, age).",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "build_spec_index",
    description: "Fetches the full Cloudflare OpenAPI spec from cloudflare/api-schemas and builds a compact searchable index (method, path, summary, tags, params) stored in KV. Run once before first use, and re-run later to refresh. Takes ~5-20s.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "list_tags",
    description: "List all Cloudflare API product tags available in the index (e.g. Workers, KV, R2, D1, DNS) with endpoint counts. Useful to discover what's available before searching.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search_endpoints",
    description: "Search the indexed Cloudflare API for matching endpoints. Returns method, path, summary, and parameters needed to call each one with call_endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords to match against path, summary, operationId, and tags, e.g. 'create vectorize index' or 'list workers scripts'" },
        tag: { type: "string", description: "Optional exact-ish product tag filter, e.g. 'Workers KV', 'R2', 'D1', 'Vectorize'" },
        method: { type: "string", description: "Optional HTTP method filter: GET, POST, PUT, PATCH, DELETE" },
        limit: { type: "number", description: "Max results to return, default 20, max 50" }
      },
      required: ["query"]
    }
  },
  {
    name: "call_endpoint",
    description: "Call any Cloudflare API v4 endpoint directly. Path is relative to https://api.cloudflare.com/client/v4 (e.g. '/accounts/{account_id}/workers/scripts'). {account_id} is auto-filled from the bound CF_ACCOUNT_ID if left in the path. Use path_params for other placeholders.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PUT, PATCH, DELETE" },
        path: { type: "string", description: "Endpoint path with any {placeholder} segments, e.g. '/accounts/{account_id}/workers/scripts/{script_name}'" },
        path_params: { type: "object", description: "Values to substitute for {placeholder} segments in path, e.g. {\"script_name\": \"my-worker\"}" },
        query: { type: "object", description: "Query string parameters as key/value pairs" },
        body: { type: "object", description: "JSON request body, for POST/PUT/PATCH" }
      },
      required: ["method", "path"]
    }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, result) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

async function fetchSpec() {
  let lastErr = null;
  for (const url of SPEC_CANDIDATE_URLS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "afo-cf-universal-mcp" } });
      if (res.ok) {
        const text = await res.text();
        return JSON.parse(text);
      }
      lastErr = new Error(`${url} -> HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Could not fetch openapi.json from any candidate URL. Last error: ${lastErr && lastErr.message}`);
}

function buildIndex(spec) {
  const items = [];
  const paths = spec.paths || {};
  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== "object") continue;
    for (const m of HTTP_METHODS) {
      const op = methods[m];
      if (!op || typeof op !== "object") continue;
      const params = Array.isArray(op.parameters)
        ? op.parameters
            .filter(p => p && typeof p.name === "string")
            .map(p => ({ name: p.name, in: p.in, required: Boolean(p.required) }))
        : [];
      items.push({
        method: m.toUpperCase(),
        path,
        operationId: op.operationId || "",
        summary: op.summary || op.description?.slice(0, 140) || "",
        tags: Array.isArray(op.tags) ? op.tags : [],
        params,
        hasBody: Boolean(op.requestBody)
      });
    }
  }
  return items;
}

async function dispatch(name, args, env) {
  if (name === "api_status") {
    let meta = null;
    try { meta = await env.SPEC_KV.get(META_KEY, { type: "json" }); } catch {}
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        CF_ACCOUNT_ID: Boolean(env.CF_ACCOUNT_ID),
        CF_API_TOKEN: Boolean(env.CF_API_TOKEN),
        SPEC_KV: Boolean(env.SPEC_KV)
      },
      spec_index: meta || { built: false, note: "Run build_spec_index first" },
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "build_spec_index") {
    const spec = await fetchSpec();
    const items = buildIndex(spec);
    if (!items.length) throw new Error("Parsed spec but found zero endpoints; spec shape may have changed.");
    await env.SPEC_KV.put(INDEX_KEY, JSON.stringify(items));
    const tagCounts = {};
    for (const it of items) for (const t of it.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    const meta = { built: true, built_at: new Date().toISOString(), endpoint_count: items.length, tag_count: Object.keys(tagCounts).length };
    await env.SPEC_KV.put(META_KEY, JSON.stringify(meta));
    return meta;
  }

  if (name === "list_tags") {
    const items = await env.SPEC_KV.get(INDEX_KEY, { type: "json" });
    if (!items) throw new Error("Spec index not built yet. Call build_spec_index first.");
    const tagCounts = {};
    for (const it of items) for (const t of it.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
    return { count: tags.length, tags };
  }

  if (name === "search_endpoints") {
    const items = await env.SPEC_KV.get(INDEX_KEY, { type: "json" });
    if (!items) throw new Error("Spec index not built yet. Call build_spec_index first.");
    const { query, tag, method, limit } = args;
    if (!query) throw new Error("query is required");
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const maxResults = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const methodFilter = method ? method.toUpperCase() : null;
    const tagFilter = tag ? tag.toLowerCase() : null;

    const matches = [];
    for (const it of items) {
      if (methodFilter && it.method !== methodFilter) continue;
      if (tagFilter && !it.tags.some(t => t.toLowerCase().includes(tagFilter))) continue;
      const haystack = `${it.path} ${it.summary} ${it.operationId} ${it.tags.join(" ")}`.toLowerCase();
      if (!words.every(w => haystack.includes(w))) continue;
      matches.push(it);
      if (matches.length >= maxResults) break;
    }
    return { count: matches.length, endpoints: matches };
  }

  if (name === "call_endpoint") {
    if (!env.CF_ACCOUNT_ID) throw new Error("CF_ACCOUNT_ID binding missing");
    if (!env.CF_API_TOKEN) throw new Error("CF_API_TOKEN binding missing");
    let { method, path, path_params = {}, query = {}, body } = args;
    if (!method) throw new Error("method is required");
    if (!path) throw new Error("path is required");

    const allParams = { account_id: env.CF_ACCOUNT_ID, ...path_params };
    let resolvedPath = path.replace(/\{([^}]+)\}/g, (full, key) => {
      if (allParams[key] === undefined) throw new Error(`Missing path_params value for {${key}}`);
      return encodeURIComponent(allParams[key]);
    });

    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query || {})) {
      if (v === undefined || v === null) continue;
      qs.append(k, String(v));
    }
    const qsStr = qs.toString();
    const url = `https://api.cloudflare.com/client/v4${resolvedPath}${qsStr ? `?${qsStr}` : ""}`;

    const opts = {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    };
    if (body !== undefined && method.toUpperCase() !== "GET") opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const text = await res.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

    if (!res.ok || json.success === false) {
      throw new Error(`CF API ${res.status} on ${method.toUpperCase()} ${resolvedPath}: ${JSON.stringify(json.errors || json.raw || text).slice(0, 600)}`);
    }
    return {
      ok: true,
      status: res.status,
      result: json.result !== undefined ? json.result : json,
      result_info: json.result_info
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method === "GET") return j({ worker: WORKER_NAME, version: VERSION, status: "ok", tools: TOOLS.map(t => t.name) });
    if (request.method !== "POST") return j({ error: "POST /mcp required" }, 405);
    let p;
    try { p = await request.json(); } catch { return er(null, -32700, "Invalid JSON"); }
    const { id = null, method, params = {} } = p;
    try {
      if (method === "initialize") return rr(id, { protocolVersion: "2024-11-05", serverInfo: { name: WORKER_NAME, version: VERSION }, capabilities: { tools: {} } });
      if (method === "tools/list") return rr(id, { tools: TOOLS });
      if (method === "tools/call") return tr(id, await dispatch(params.name, params.arguments || {}, env));
      return er(id, -32601, `Method not found: ${method}`);
    } catch (e) {
      return er(id, -32603, `Tool error: ${e.message}`);
    }
  }
};
