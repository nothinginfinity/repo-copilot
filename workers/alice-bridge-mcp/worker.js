// alice-bridge-mcp v0.2.0
// Alice <-> Claude inbox/outbox bridge over Cloudflare KV
// MCP tools: checkBridgeHealth, pushToClaudeInbox, readClaudeInbox, readClaudeOutbox, writeClaudeOutbox

const TOOLS = [
  {
    name: "checkBridgeHealth",
    description: "Check health of the alice-bridge-mcp Worker and KV binding",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "pushToClaudeInbox",
    description: "Push a message into Claude's KV inbox. Used by Alice to deliver tasks.",
    inputSchema: {
      type: "object",
      properties: {
        id:      { type: "string", description: "Message ID e.g. MSG-005" },
        from:    { type: "string", description: "Sender name" },
        subject: { type: "string", description: "Message subject" },
        body:    { type: "string", description: "Message body" },
        date:    { type: "string", description: "ISO timestamp" }
      },
      required: ["id", "from", "subject", "body"]
    }
  },
  {
    name: "readClaudeInbox",
    description: "Read all messages in Claude's KV inbox",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "readClaudeOutbox",
    description: "Read all messages Claude has written to his outbox",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "writeClaudeOutbox",
    description: "Write a reply or status update from Claude to his outbox. Used by Claude to report results back to Alice.",
    inputSchema: {
      type: "object",
      properties: {
        id:      { type: "string", description: "Outbox message ID e.g. OUT-003" },
        re:      { type: "string", description: "Message ID this is replying to e.g. MSG-004" },
        subject: { type: "string", description: "Reply subject" },
        body:    { type: "string", description: "Reply body" },
        date:    { type: "string", description: "ISO timestamp" }
      },
      required: ["id", "subject", "body"]
    }
  }
];

async function handleTool(name, args, env) {
  const kv = env.CLAUDE_MAILBOX;

  if (name === "checkBridgeHealth") {
    let inboxCount = 0, outboxCount = 0;
    try {
      const inbox = await kv.get("inbox", "json");
      inboxCount = Array.isArray(inbox) ? inbox.length : 0;
    } catch (_) {}
    try {
      const outbox = await kv.get("outbox", "json");
      outboxCount = Array.isArray(outbox) ? outbox.length : 0;
    } catch (_) {}
    return {
      status: "ok",
      version: "0.2.0",
      worker: "alice-bridge-mcp",
      kv_binding: "CLAUDE_MAILBOX",
      tools: TOOLS.map(t => t.name),
      inbox_count: inboxCount,
      outbox_count: outboxCount
    };
  }

  if (name === "pushToClaudeInbox") {
    const inbox = (await kv.get("inbox", "json")) || [];
    const msg = {
      id:      args.id || `MSG-${Date.now()}`,
      from:    args.from || "Alice",
      to:      "Claude",
      date:    args.date || new Date().toISOString(),
      status:  "unread",
      subject: args.subject,
      body:    args.body
    };
    // Deduplicate by id
    const exists = inbox.find(m => m.id === msg.id);
    if (!exists) inbox.unshift(msg);
    await kv.put("inbox", JSON.stringify(inbox));
    return { success: true, messageId: msg.id, duplicate: !!exists };
  }

  if (name === "readClaudeInbox") {
    const inbox = (await kv.get("inbox", "json")) || [];
    return { messages: inbox, count: inbox.length };
  }

  if (name === "readClaudeOutbox") {
    const outbox = (await kv.get("outbox", "json")) || [];
    return { messages: outbox, count: outbox.length };
  }

  if (name === "writeClaudeOutbox") {
    const outbox = (await kv.get("outbox", "json")) || [];
    const msg = {
      id:      args.id || `OUT-${Date.now()}`,
      from:    "Claude",
      to:      "Alice",
      re:      args.re || null,
      date:    args.date || new Date().toISOString(),
      subject: args.subject,
      body:    args.body
    };
    const exists = outbox.find(m => m.id === msg.id);
    if (!exists) outbox.unshift(msg);
    await kv.put("outbox", JSON.stringify(outbox));
    return { success: true, messageId: msg.id };
  }

  return { error: `Unknown tool: ${name}` };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check — no auth required
    if (url.pathname === "/health" && request.method === "GET") {
      const health = await handleTool("checkBridgeHealth", {}, env);
      return new Response(JSON.stringify(health), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      // CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Bridge-Token"
          }
        });
      }

      if (request.method === "GET") {
        // MCP discovery
        return new Response(JSON.stringify({
          name: "alice-bridge-mcp",
          version: "0.2.0",
          description: "Alice <-> Claude inbox/outbox bridge",
          tools: TOOLS
        }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }

      if (request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch (_) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const { method, params, id } = body;

        // JSON-RPC method routing
        if (method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0", id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: { tools: {} },
              serverInfo: { name: "alice-bridge-mcp", version: "0.2.0" }
            }
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        if (method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0", id,
            result: { tools: TOOLS }
          }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }

        if (method === "tools/call") {
          const toolName = params?.name;
          const toolArgs = params?.arguments || {};
          try {
            const result = await handleTool(toolName, toolArgs, env);
            return new Response(JSON.stringify({
              jsonrpc: "2.0", id,
              result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }
            }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
          } catch (err) {
            return new Response(JSON.stringify({
              jsonrpc: "2.0", id,
              error: { code: -32603, message: err.message }
            }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
          }
        }

        return new Response(JSON.stringify({
          jsonrpc: "2.0", id,
          error: { code: -32601, message: `Method not found: ${method}` }
        }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("alice-bridge-mcp: not found", { status: 404 });
  }
};
