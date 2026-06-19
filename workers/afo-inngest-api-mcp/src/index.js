// afo-inngest-api-mcp
// MCP server exposing Inngest's Event API + REST management API as tools.
//
// Bindings required:
//   INNGEST_EVENT_KEY     (secret)      - Inngest dashboard > Manage > Event Keys
//   INNGEST_SIGNING_KEY   (secret)      - Inngest dashboard > Manage > Signing Key
//   INNGEST_BASE_URL      (plain_text, optional) - override for self-hosted Inngest mgmt API, default https://api.inngest.com
//   INNGEST_EVENT_BASE_URL(plain_text, optional) - override for self-hosted event ingest, default https://inn.gs
//
// Note on scope: Inngest functions (and their steps/delays/retries) are defined in your
// deployed application code, not creatable via this or any external API call. The only
// way to *trigger* a run from outside your codebase is sending an event. Everything else
// here is read/cancel/observe on runs that your code already defined.

const PROD_API_BASE = "https://api.inngest.com";
const PROD_EVENT_BASE = "https://inn.gs";

const TOOLS = [
  {
    name: "inngest_api_status",
    description:
      "Health check. Confirms the worker is reachable and reports which Inngest credentials (event key, signing key) are configured.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "send_event",
    description:
      "Send one event to Inngest to trigger any function(s) subscribed to it. This is the only way to start an Inngest workflow run from outside your code -- functions themselves, with their steps/delays, are defined in your deployed application, not created via this API. Returns the event id, which you can pass to list_event_runs to see what it triggered.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Event name, e.g. 'deploy/requested' or 'demo/site.cloned'" },
        data: { type: "object", description: "Arbitrary JSON payload for the event" },
        user: { type: "object", description: "Optional user-identifying data (encrypted at rest by Inngest)" },
        id: { type: "string", description: "Optional idempotency key -- duplicate ids are ignored" },
        ts: { type: "number", description: "Optional epoch-ms timestamp. If in the future, triggered runs are scheduled to start then." },
      },
      required: ["name"],
    },
  },
  {
    name: "list_event_runs",
    description:
      "List all function runs that a given event triggered, including each run's status and output. Use the event id returned from send_event.",
    inputSchema: {
      type: "object",
      properties: { event_id: { type: "string", description: "The Inngest event id" } },
      required: ["event_id"],
    },
  },
  {
    name: "bulk_cancel",
    description:
      "Cancel function runs in bulk by app_id + function_id over a time range, optionally filtered by a CEL-style 'if' expression against event data. For cancelling one specific run, use the call tool against /v1/runs/{run_id}/cancel instead.",
    inputSchema: {
      type: "object",
      properties: {
        app_id: { type: "string" },
        function_id: { type: "string" },
        started_after: { type: "string", description: "ISO 8601 timestamp" },
        started_before: { type: "string", description: "ISO 8601 timestamp" },
        if: { type: "string", description: "Optional expression, e.g. \"event.data.userId == 'abc'\"" },
      },
      required: ["app_id", "function_id", "started_after", "started_before"],
    },
  },
  {
    name: "call",
    description:
      "Call any other api.inngest.com/v1 endpoint directly, authenticated with the signing key. Known useful paths: GET /v1/runs/{run_id} (single run status/output), POST /v1/runs/{run_id}/cancel (cancel one run), GET /v1/events/{event_id} (event detail). Escape hatch for anything not covered by the named tools above.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "GET, POST, PUT, PATCH, or DELETE" },
        path: { type: "string", description: "Path starting with /v1/..." },
        body: { type: "object" },
        query: { type: "object" },
      },
      required: ["method", "path"],
    },
  },
];

function jsonRpcResult(id, result) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "content-type": "application/json" },
  });
}

function jsonRpcError(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    headers: { "content-type": "application/json" },
  });
}

async function inngestApiFetch(env, method, path, { body, query } = {}) {
  if (!env.INNGEST_SIGNING_KEY) {
    throw new Error("INNGEST_SIGNING_KEY is not configured on this worker");
  }
  const base = env.INNGEST_BASE_URL || PROD_API_BASE;
  const url = new URL(base + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${env.INNGEST_SIGNING_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: res.status, data: parsed };
}

async function callTool(name, args, env) {
  switch (name) {
    case "inngest_api_status": {
      return {
        ok: true,
        event_key_configured: Boolean(env.INNGEST_EVENT_KEY),
        signing_key_configured: Boolean(env.INNGEST_SIGNING_KEY),
        api_base: env.INNGEST_BASE_URL || PROD_API_BASE,
        event_base: env.INNGEST_EVENT_BASE_URL || PROD_EVENT_BASE,
      };
    }
    case "send_event": {
      if (!env.INNGEST_EVENT_KEY) {
        throw new Error("INNGEST_EVENT_KEY is not configured on this worker");
      }
      const eventBase = env.INNGEST_EVENT_BASE_URL || PROD_EVENT_BASE;
      const url = `${eventBase}/e/${env.INNGEST_EVENT_KEY}`;
      const payload = {
        name: args.name,
        data: args.data || {},
        ...(args.user ? { user: args.user } : {}),
        ...(args.id ? { id: args.id } : {}),
        ...(args.ts ? { ts: args.ts } : {}),
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
      return { status: res.status, data: parsed };
    }
    case "list_event_runs": {
      if (!args.event_id) throw new Error("event_id is required");
      return await inngestApiFetch(env, "GET", `/v1/events/${args.event_id}/runs`);
    }
    case "bulk_cancel": {
      return await inngestApiFetch(env, "POST", "/v1/cancellations", {
        body: {
          app_id: args.app_id,
          function_id: args.function_id,
          started_after: args.started_after,
          started_before: args.started_before,
          ...(args.if ? { if: args.if } : {}),
        },
      });
    }
    case "call": {
      if (!args.method || !args.path) throw new Error("method and path are required");
      return await inngestApiFetch(env, args.method, args.path, { body: args.body, query: args.query });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("afo-inngest-api-mcp is running", { status: 200 });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let msg;
    try {
      msg = await request.json();
    } catch {
      return jsonRpcError(null, -32700, "Parse error");
    }

    const { id, method, params } = msg;

    try {
      if (method === "initialize") {
        return jsonRpcResult(id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "afo-inngest-api-mcp", version: "1.0.0" },
        });
      }
      if (method === "notifications/initialized") {
        return new Response(null, { status: 202 });
      }
      if (method === "tools/list") {
        return jsonRpcResult(id, { tools: TOOLS });
      }
      if (method === "tools/call") {
        const { name, arguments: args } = params;
        const result = await callTool(name, args || {}, env);
        return jsonRpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        });
      }
      return jsonRpcError(id, -32601, `Method not found: ${method}`);
    } catch (err) {
      return jsonRpcResult(id, {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      });
    }
  },
};
