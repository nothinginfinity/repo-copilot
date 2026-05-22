# alice-bridge-mcp

Alice ↔ Claude inbox/outbox bridge over Cloudflare KV.

**Version:** 0.2.0  
**Worker name:** `alice-bridge-mcp`  
**MCP endpoint:** `https://alice-bridge-mcp.jaredtechfit.workers.dev/mcp`

---

## Purpose

Provides a 5-tool MCP server that lets Alice (Perplexity) push messages to Claude's KV inbox and read his outbox replies, and lets Claude write structured replies back to Alice — all without GitHub access required at runtime.

---

## Required KV Bindings

| Binding name | Namespace ID | Purpose |
|---|---|---|
| `CLAUDE_MAILBOX` | `e85cf11f27c24fceb19bcbb2099ffd10` | Stores `inbox` and `outbox` JSON arrays |

---

## Environment Variables / Secrets

None required. Auth is handled by Cloudflare Access (Alice-only policy).

---

## Routes / Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Health check — returns version, tool list, message counts |
| `GET` | `/mcp` | Access | MCP discovery — returns server info + tool schemas |
| `POST` | `/mcp` | Access | MCP JSON-RPC — tool calls |
| `OPTIONS` | `/mcp` | None | CORS preflight |

---

## Tools

| Tool | Direction | Description |
|------|-----------|-------------|
| `checkBridgeHealth` | Either | Returns version, KV status, inbox/outbox counts |
| `pushToClaudeInbox` | Alice → Claude | Appends a message to Claude's inbox KV array |
| `readClaudeInbox` | Claude | Returns all inbox messages |
| `readClaudeOutbox` | Alice | Returns all outbox messages Claude has written |
| `writeClaudeOutbox` | Claude → Alice | Appends a reply/status update to outbox KV array |

---

## Deploy Command (for Claude)

```
deployWorker(
  script_name: "alice-bridge-mcp",
  script_content: <contents of worker.js>
)
```

Then verify bindings are still attached:
```
listWorkerBindings(script_name: "alice-bridge-mcp")
```

If `CLAUDE_MAILBOX` binding is missing after deploy, re-attach:
```
cfApiRequest PUT /accounts/{id}/workers/scripts/alice-bridge-mcp/bindings
body: { "kv_namespaces": [{ "type": "kv_namespace", "name": "CLAUDE_MAILBOX", "namespace_id": "e85cf11f27c24fceb19bcbb2099ffd10" }] }
```

---

## Dependencies

None — standalone Worker.
