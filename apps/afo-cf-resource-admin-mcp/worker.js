const VERSION = "0.1.0";
const WORKER_NAME = "afo-cf-resource-admin-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const TOOLS = [
  {
    name: "resource_admin_status",
    description: "Health check. Returns binding presence for CF_ACCOUNT_ID and CF_API_TOKEN.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "create_kv_namespace",
    description: "Create a Cloudflare KV namespace by name. Returns the namespace id needed for wrangler.toml.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "KV namespace name, e.g. afo-demo-kv" }
      },
      required: ["title"]
    }
  },
  {
    name: "list_kv_namespaces",
    description: "List all KV namespaces in the account.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "create_r2_bucket",
    description: "Create a Cloudflare R2 bucket by name. Returns confirmation needed for wrangler.toml.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "R2 bucket name, e.g. afo-demo-assets" },
        location_hint: { type: "string", description: "Optional location hint: wnam, enam, weur, eeur, apac" }
      },
      required: ["name"]
    }
  },
  {
    name: "list_r2_buckets",
    description: "List all R2 buckets in the account.",
    inputSchema: { type: "object", properties: {}, required: [] }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, result) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

async function cfReq(env, method, path, body) {
  if (!env.CF_ACCOUNT_ID) throw new Error("CF_ACCOUNT_ID binding missing");
  if (!env.CF_API_TOKEN) throw new Error("CF_API_TOKEN binding missing");
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json"
    }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok || json.success === false) {
    throw new Error(`CF API ${res.status}: ${JSON.stringify(json.errors || text).slice(0, 400)}`);
  }
  return json.result !== undefined ? json.result : json;
}

async function dispatch(name, args, env) {
  if (name === "resource_admin_status") {
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        CF_ACCOUNT_ID: Boolean(env.CF_ACCOUNT_ID),
        CF_API_TOKEN: Boolean(env.CF_API_TOKEN)
      },
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "create_kv_namespace") {
    const { title } = args;
    if (!title) throw new Error("title is required");
    const result = await cfReq(env, "POST", "/storage/kv/namespaces", { title });
    return {
      ok: true,
      id: result.id,
      title: result.title,
      wrangler_toml_snippet: `[[kv_namespaces]]\nbinding = "KV"\nid = "${result.id}"`
    };
  }

  if (name === "list_kv_namespaces") {
    const result = await cfReq(env, "GET", "/storage/kv/namespaces?per_page=100");
    const items = Array.isArray(result) ? result : (result.namespaces || result.result || []);
    return { count: items.length, namespaces: items.map(ns => ({ id: ns.id, title: ns.title })) };
  }

  if (name === "create_r2_bucket") {
    const { name: bucketName, location_hint } = args;
    if (!bucketName) throw new Error("name is required");
    const body = { name: bucketName };
    if (location_hint) body.locationHint = location_hint;
    await cfReq(env, "POST", "/r2/buckets", body);
    return {
      ok: true,
      name: bucketName,
      wrangler_toml_snippet: `[[r2_buckets]]\nbinding = "R2"\nbucket_name = "${bucketName}"`
    };
  }

  if (name === "list_r2_buckets") {
    const result = await cfReq(env, "GET", "/r2/buckets");
    const items = Array.isArray(result) ? result : (result.buckets || result.result || []);
    return { count: items.length, buckets: items.map(b => ({ name: b.name, creation_date: b.creation_date })) };
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
