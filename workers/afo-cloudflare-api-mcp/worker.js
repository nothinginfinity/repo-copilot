const VERSION = "0.1.0";
const WORKER_NAME = "afo-cloudflare-api-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

const SPEC_URL = "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json";
const SPEC_KEY = "cf-openapi-spec/index.json";
const MAX_RESPONSE_CHARS = 30000;

const TOOLS = [
  {
    name: "cf_api_status",
    description: "Health check. Shows binding presence and whether the spec index has been seeded.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search",
    description: "Search the Cloudflare OpenAPI spec for endpoints across the entire Cloudflare API (Workers, KV, R2, D1, Vectorize, DNS, Zones, Firewall, Access, Stream, Images, AI Gateway, and more). Filter by free-text query (matches path, summary, tags) and/or an exact product tag. Returns method, path, tags, and summary for each match so you can then call the endpoint with the call tool.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text to match against path, summary, or tags, e.g. 'vectorize index' or 'dns record'" },
        tag: { type: "string", description: "Exact product tag to filter by, e.g. 'workers', 'r2', 'd1', 'dns', 'zones'" },
        limit: { type: "number", description: "Max results to return, default 30" }
      },
      required: []
    }
  },
  {
    name: "call",
    description: "Call any Cloudflare API v4 endpoint directly, authenticated with the account's API token. Use search first to find the right method and path. Path should look like /accounts/{account_id}/workers/scripts or /zones/{zone_id}/dns_records or /graphql, exactly as returned by search. The literal substring {account_id} in path is auto-replaced with the account_id argument or the default account. Query params and JSON body are optional.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PUT, PATCH, or DELETE" },
        path: { type: "string", description: "API path, e.g. /accounts/{account_id}/workers/scripts/my-worker" },
        query: { type: "object", description: "Query string parameters as key-value pairs" },
        body: { type: "object", description: "JSON request body for POST/PUT/PATCH" },
        account_id: { type: "string", description: "Override the account id substituted for {account_id} in path" }
      },
      required: ["method", "path"]
    }
  },
  {
    name: "seed_spec",
    description: "Fetch the latest Cloudflare OpenAPI spec from GitHub (cloudflare/api-schemas) and rebuild the search index in R2. Run once after first deploy, and again any time you want to pick up new Cloudflare API endpoints.",
    inputSchema: { type: "object", properties: {}, required: [] }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, text) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

function truncate(str) {
  if (str.length <= MAX_RESPONSE_CHARS) return str;
  return str.slice(0, MAX_RESPONSE_CHARS) +
    `\n...[truncated, ${str.length} total chars. Narrow the query, request fewer fields, or use pagination params like per_page/page/cursor.]`;
}

async function buildIndex(env) {
  const res = await fetch(SPEC_URL, { headers: { "User-Agent": "afo-cloudflare-api-mcp" } });
  if (!res.ok) throw new Error(`Spec fetch failed: HTTP ${res.status}`);
  const spec = await res.json();
  const index = [];
  const tagSet = new Set();
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      const tags = op.tags || [];
      tags.forEach(t => tagSet.add(t));
      index.push({
        method: method.toUpperCase(),
        path,
        tags,
        summary: op.summary || op.description || "",
        operationId: op.operationId || ""
      });
    }
  }
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  await env.SPEC.put(SPEC_KEY, JSON.stringify(index));
  return { ok: true, endpoint_count: index.length, tag_count: tagSet.size, tags: Array.from(tagSet).sort() };
}

async function loadIndex(env) {
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  const obj = await env.SPEC.get(SPEC_KEY);
  if (!obj) throw new Error("Spec index not seeded yet. Run seed_spec first.");
  return JSON.parse(await obj.text());
}

async function cfApi(env, method, path, query, body, accountIdOverride) {
  if (!env.CF_API_TOKEN) throw new Error("CF_API_TOKEN binding missing");
  const aid = accountIdOverride || env.CF_ACCOUNT_ID || "";
  let resolvedPath = path.replaceAll("{account_id}", aid);
  let url = `https://api.cloudflare.com/client/v4${resolvedPath}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) qs.set(k, String(v));
    url += `?${qs.toString()}`;
  }
  const m = (method || "GET").toUpperCase();
  const opts = { method: m, headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, "Content-Type": "application/json" } };
  if (body !== undefined && !["GET", "HEAD"].includes(m)) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed };
}

async function dispatch(name, args, env) {
  if (name === "cf_api_status") {
    let seeded = false, count = null;
    try { const idx = await loadIndex(env); seeded = true; count = idx.length; } catch {}
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: { CF_API_TOKEN: Boolean(env.CF_API_TOKEN), CF_ACCOUNT_ID: Boolean(env.CF_ACCOUNT_ID), SPEC: Boolean(env.SPEC) },
      spec_seeded: seeded,
      indexed_endpoints: count,
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "seed_spec") return await buildIndex(env);

  if (name === "search") {
    const index = await loadIndex(env);
    const q = (args.query || "").toLowerCase();
    const tag = (args.tag || "").toLowerCase();
    const limit = args.limit || 30;
    let results = index;
    if (tag) results = results.filter(e => e.tags.some(t => t.toLowerCase() === tag));
    if (q) results = results.filter(e =>
      e.path.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
    return { total_matches: results.length, results: results.slice(0, limit) };
  }

  if (name === "call") {
    const { method, path, query, body, account_id } = args;
    if (!method || !path) throw new Error("method and path are required");
    const r = await cfApi(env, method, path, query, body, account_id);
    return { status: r.status, data: r.data };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health") return j({ status: "ok", worker: WORKER_NAME, version: VERSION });
    if (url.pathname === "/admin/seed") {
      try { return j(await buildIndex(env)); } catch (e) { return j({ error: e.message }, 500); }
    }
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
