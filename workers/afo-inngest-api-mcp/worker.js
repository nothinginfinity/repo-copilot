const VERSION = "0.1.0";
const WORKER_NAME = "afo-inngest-api-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

const SPEC_URL = "https://api-docs.inngest.com/api-specs/v2.json";
const API_BASE = "https://api.inngest.com/v2";
const EVENT_BASE = "https://inn.gs/e";
const MAX_RESPONSE_CHARS = 30000;

const TOOLS = [
  {
    name: "inngest_api_status",
    description: "Health check. Shows binding presence for INNGEST_API_KEY (v2 management API) and INNGEST_EVENT_KEY (classic Event API).",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search",
    description: "List/search Inngest's v2 management API endpoints (Account, Apps, Functions, Runs, Environments, Keys, Webhooks, Partner API). Fetches the live spec each call, so it's always current. Filter by free-text query and/or exact tag.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text to match against path, summary, or tags, e.g. 'invoke' or 'environments'" },
        tag: { type: "string", description: "Exact tag, e.g. 'Functions', 'Runs', 'Apps', 'Environments', 'Keys', 'Webhooks', 'Account'" },
        limit: { type: "number", description: "Max results, default 50" }
      },
      required: []
    }
  },
  {
    name: "call",
    description: "Call any Inngest v2 management API endpoint directly, authenticated with INNGEST_API_KEY. Use search first to find the right method and path. Literal {appId}, {functionId}, {runId}, {eventId}, {id} in path are auto-substituted from matching args.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PATCH, PUT, or DELETE" },
        path: { type: "string", description: "API path relative to /v2, e.g. /apps/{appId}/functions" },
        appId: { type: "string" },
        functionId: { type: "string" },
        runId: { type: "string" },
        eventId: { type: "string" },
        id: { type: "string" },
        query: { type: "object", description: "Query string parameters" },
        body: { type: "object", description: "JSON request body for POST/PATCH/PUT" },
        env: { type: "string", description: "Sets the X-Inngest-Env header for endpoints that need it" }
      },
      required: ["method", "path"]
    }
  },
  {
    name: "send_event",
    description: "Send one or more events to Inngest via the classic Event API, authenticated with INNGEST_EVENT_KEY. This is the standard way to trigger Inngest functions (functions subscribe to event names). Different base URL and auth from the management API, so this is a dedicated tool rather than something reachable via call.",
    inputSchema: {
      type: "object",
      properties: {
        events: {
          type: "array",
          description: "One or more events to send. Each needs at least a name; data is optional but typical.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Event name, e.g. 'user.signup'" },
              data: { type: "object", description: "Event payload data" },
              user: { type: "object", description: "Optional user identification object" },
              id: { type: "string", description: "Optional idempotency id for deduplication" },
              ts: { type: "number", description: "Optional unix ms timestamp" }
            },
            required: ["name"]
          }
        },
        env: { type: "string", description: "Branch environment name, sets X-Inngest-Env header" }
      },
      required: ["events"]
    }
  },
  {
    name: "invoke_function",
    description: "Directly invoke a specific function (not event-triggered), optionally waiting for the result synchronously.",
    inputSchema: {
      type: "object",
      properties: {
        appId: { type: "string" },
        functionId: { type: "string" },
        data: { type: "object", description: "Input data for the function" },
        idempotencyKey: { type: "string" }
      },
      required: ["appId", "functionId"]
    }
  },
  {
    name: "list_functions",
    description: "List functions configured within an app.",
    inputSchema: {
      type: "object",
      properties: { appId: { type: "string" }, cursor: { type: "string" }, limit: { type: "number" } },
      required: ["appId"]
    }
  },
  {
    name: "get_function_run",
    description: "Get the status/output of a single function run.",
    inputSchema: {
      type: "object",
      properties: { runId: { type: "string" }, includeOutput: { type: "boolean" } },
      required: ["runId"]
    }
  },
  {
    name: "get_event_runs",
    description: "List all function runs that were triggered by a specific event (useful right after send_event to see what fired).",
    inputSchema: {
      type: "object",
      properties: { eventId: { type: "string" }, includeOutput: { type: "boolean" }, limit: { type: "number" } },
      required: ["eventId"]
    }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, text) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

function truncate(str) {
  if (str.length <= MAX_RESPONSE_CHARS) return str;
  return str.slice(0, MAX_RESPONSE_CHARS) + `\n...[truncated, ${str.length} total chars. Narrow the query or use pagination params like limit/cursor.]`;
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

function extractRateLimit(headers) {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-limit");
  if (remaining === null && limit === null) return null;
  return { remaining: remaining !== null ? Number(remaining) : null, limit: limit !== null ? Number(limit) : null };
}

async function fetchSpecIndex() {
  const res = await fetch(SPEC_URL, { headers: { "User-Agent": WORKER_NAME } });
  if (!res.ok) throw new Error(`Spec fetch failed: HTTP ${res.status}`);
  const spec = await res.json();
  const index = [];
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      index.push({
        method: method.toUpperCase(),
        path,
        tags: op.tags || [],
        summary: op.summary || op.description || "",
        operationId: op.operationId || "",
        beta: Boolean(op["x-beta"])
      });
    }
  }
  return index;
}

async function inngestApi(env, method, path, query, body, pathParams, envHeader) {
  if (!env.INNGEST_API_KEY) throw new Error("INNGEST_API_KEY binding missing");
  let resolvedPath = path;
  for (const [k, v] of Object.entries(pathParams || {})) {
    if (v !== undefined && v !== null) resolvedPath = resolvedPath.replaceAll(`{${k}}`, v);
  }
  let url = `${API_BASE}${resolvedPath}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) qs.set(k, String(v));
    url += `${url.includes("?") ? "&" : "?"}${qs.toString()}`;
  }
  const m = (method || "GET").toUpperCase();
  const headers = {
    Authorization: `Bearer ${env.INNGEST_API_KEY}`,
    "Content-Type": "application/json"
  };
  if (envHeader) headers["X-Inngest-Env"] = envHeader;
  const opts = { method: m, headers };
  if (body !== undefined && !["GET", "HEAD"].includes(m)) opts.body = JSON.stringify(body);
  const res = await fetchWithRetry(url, opts);
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed, rate_limit: extractRateLimit(res.headers) };
}

async function sendEvents(env, events, envHeader) {
  if (!env.INNGEST_EVENT_KEY) throw new Error("INNGEST_EVENT_KEY binding missing");
  const url = `${EVENT_BASE}/${env.INNGEST_EVENT_KEY}`;
  const headers = { "Content-Type": "application/json" };
  if (envHeader) headers["x-inngest-env"] = envHeader;
  const body = events.length === 1 ? events[0] : events;
  const res = await fetchWithRetry(url, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed };
}

async function dispatch(name, args, env) {
  if (name === "inngest_api_status") {
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        INNGEST_API_KEY: Boolean(env.INNGEST_API_KEY),
        INNGEST_EVENT_KEY: Boolean(env.INNGEST_EVENT_KEY)
      },
      tools: TOOLS.map(t => t.name),
      notes: "INNGEST_API_KEY authenticates the v2 management API (call/list_functions/get_function_run/etc). INNGEST_EVENT_KEY authenticates send_event, a separate API with a separate secret."
    };
  }

  if (name === "search") {
    const index = await fetchSpecIndex();
    const q = (args.query || "").toLowerCase();
    const tag = (args.tag || "").toLowerCase();
    const limit = args.limit || 50;
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
    const { method, path, query, body, env: envHeader, appId, functionId, runId, eventId, id } = args;
    if (!method || !path) throw new Error("method and path are required");
    const res = await inngestApi(env, method, path, query, body, { appId, functionId, runId, eventId, id }, envHeader);
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "send_event") {
    const { events, env: envHeader } = args;
    if (!Array.isArray(events) || events.length === 0) throw new Error("events array is required");
    const res = await sendEvents(env, events, envHeader);
    return { status: res.status, data: res.data };
  }

  if (name === "invoke_function") {
    const { appId, functionId, data, idempotencyKey } = args;
    if (!appId || !functionId) throw new Error("appId and functionId are required");
    const res = await inngestApi(env, "POST", "/apps/{appId}/functions/{functionId}/invoke", null,
      { data: data || {}, idempotencyKey }, { appId, functionId });
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "list_functions") {
    const { appId, cursor, limit } = args;
    if (!appId) throw new Error("appId is required");
    const query = {}; if (cursor) query.cursor = cursor; if (limit) query.limit = limit;
    const res = await inngestApi(env, "GET", "/apps/{appId}/functions", query, null, { appId });
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "get_function_run") {
    const { runId, includeOutput } = args;
    if (!runId) throw new Error("runId is required");
    const query = includeOutput !== undefined ? { includeOutput } : null;
    const res = await inngestApi(env, "GET", "/runs/{runId}", query, null, { runId });
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "get_event_runs") {
    const { eventId, includeOutput, limit } = args;
    if (!eventId) throw new Error("eventId is required");
    const query = {}; if (includeOutput !== undefined) query.includeOutput = includeOutput; if (limit) query.limit = limit;
    const res = await inngestApi(env, "GET", "/events/{eventId}/runs", query, null, { eventId });
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
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