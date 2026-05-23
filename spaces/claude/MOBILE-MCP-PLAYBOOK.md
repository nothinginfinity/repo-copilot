# Mobile MCP Playbook
> Author: Claude (Cloudflare infra agent)
> Date: 2026-05-22
> Status: Proven, repeatable — breakthrough workflow

---

## The Core Insight

Claude.ai's MCP connector works with simple JSON-RPC over HTTP POST.
No SSE streaming, no Streamable HTTP, no npm, no build step required.
Same hand-rolled pattern as afo-mcp and mcp-prax — proven working.

---

## The 6 Rules

1. **POST /mcp only** — no GET SSE stream, no HEAD, no session management
2. **Hand-rolled JSON-RPC** — raw ES module JS, deployable via deployWorker()
3. **Custom domain** via Cloudflare Domains tab — workers.dev returns 1042 errors
4. **No Cloudflare Access** on MCP endpoints — even bypass policies cause subtle failures
5. **Remove + re-add** the Claude.ai connector after any failed connection attempt
6. **DB binding always wiped** on deployWorker — dashboard re-add required (multipart bug)

---

## 🚨 CRITICAL: Correct JSON-RPC Response Shapes

This is the most important rule. Getting this wrong causes "Couldn't reach the MCP server."

Different MCP methods require DIFFERENT response shapes.
Using the same wrapper for everything breaks the connection silently.

### Protocol methods — BARE result, NO content wrapper

```javascript
// initialize, tools/list, ping — return result DIRECTLY
function rpc(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result });
}

// CORRECT for initialize:
return rpc(id, {
  protocolVersion: '2024-11-05',
  capabilities: { tools: {} },
  serverInfo: { name: 'my-mcp', version: '1.0.0' }
});

// CORRECT for tools/list:
return rpc(id, { tools: TOOLS });

// CORRECT for ping:
return rpc(id, {});
```

### Tool call results — content-WRAPPED result

```javascript
// tools/call — wrap in content array
function toolResult(id, result) {
  return Response.json({
    jsonrpc: '2.0', id,
    result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  });
}

// CORRECT for tools/call:
return toolResult(id, { your: 'data', here: true });
```

### Error responses — same shape for all methods

```javascript
function rpcErr(id, code, message) {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } });
}
```

### The wrong way (breaks Claude.ai connector)

```javascript
// ❌ WRONG — using content wrapper for initialize/tools/list
function ok(id, result) {
  return Response.json({
    jsonrpc: '2.0', id,
    // This is WRONG for initialize and tools/list
    result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
  });
}
return ok(id, { protocolVersion: '2024-11-05', ... }); // ❌ BREAKS
return ok(id, { tools: TOOLS });                        // ❌ BREAKS
```

---

## Complete Working Template

```javascript
/**
 * my-mcp — MCP Server v1.0.0
 * Mobile MCP Pattern — proven working with Claude.ai
 */

// Three response helpers — use the right one for each method
function rpc(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result });
}
function toolResult(id, result) {
  return Response.json({
    jsonrpc: '2.0', id,
    result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  });
}
function rpcErr(id, code, message) {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TOOLS = [
  {
    name: 'my_tool',
    description: 'What this tool does',
    inputSchema: {
      type: 'object',
      properties: { param: { type: 'string', description: 'A param' } },
      required: ['param']
    }
  }
];

async function tool_my_tool({ param }, env) {
  return { result: param };
}

async function handleMCP(request, env) {
  let body;
  try { body = await request.json(); } catch { return rpcErr(null, -32700, 'Parse error'); }
  const { id, method, params } = body;

  // Protocol methods — bare rpc() response
  if (method === 'initialize') return rpc(id, {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    serverInfo: { name: 'my-mcp', version: '1.0.0' }
  });
  if (method === 'notifications/initialized') return new Response(null, { status: 204 });
  if (method === 'ping') return rpc(id, {});

  // tools/list — bare rpc() response
  if (method === 'tools/list') return rpc(id, { tools: TOOLS });

  // tools/call — content-wrapped toolResult() response
  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params || {};
    try {
      let result;
      switch (name) {
        case 'my_tool': result = await tool_my_tool(args, env); break;
        default: return rpcErr(id, -32601, `Unknown tool: ${name}`);
      }
      return toolResult(id, result);
    } catch (e) {
      return rpcErr(id, -32603, `Tool error: ${e.message}`);
    }
  }

  return rpcErr(id, -32601, `Method not found: ${method}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'my-mcp', version: '1.0.0' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === '/mcp' && request.method === 'POST') {
      const response = await handleMCP(request, env);
      response.headers?.set('Access-Control-Allow-Origin', '*');
      return response;
    }
    return new Response('not found', { status: 404 });
  }
};
```

---

## Deployment Steps

1. `deployWorker(name, source)` via mcp-prax
2. If Worker needs secrets: `cfApiRequest PUT /workers/scripts/{name}/secrets`
3. `cfApiRequest POST /workers/scripts/{name}/subdomain {"enabled":true}`
4. Dashboard: Workers → {name} → Domains → Add Domain → `{name}.agentfeedoptimization.com`
5. Dashboard: Workers → {name} → Bindings → Add D1 (if needed)
6. Verify: `pingEndpoint GET https://{name}.agentfeedoptimization.com/health`
7. Claude.ai: Settings → Connectors → Add → URL
8. If "Couldn't reach": remove connector, wait 5s, re-add

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Couldn't reach" on first add | No issue — cached fail state | Remove + re-add connector |
| "Couldn't reach" persists | Wrong response shape on initialize/tools/list | Use bare `rpc()` not `toolResult()` |
| 403 Forbidden | Cloudflare Access blocking | Delete Access app entirely |
| 1042 Not Found | workers.dev DNS not routing | Add custom domain |
| env.DB undefined | Binding wiped by redeploy | Re-add D1 binding in dashboard |
| Secret missing after redeploy | Secrets wiped by redeploy | Re-PUT secret via cfApiRequest |
