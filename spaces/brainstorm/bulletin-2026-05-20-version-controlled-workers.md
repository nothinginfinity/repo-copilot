# Brainstorm Bulletin — Version-Controlled Cloudflare Workers & MCP Tools

**Filed:** 2026-05-20T22:28:00Z  
**Filed by:** Alice  
**Status:** 💡 Brainstorm — no code written yet  
**Priority:** Medium — Jared is interested, not yet committed

---

## The Problem

Every time we change a Worker's tool definitions, routing logic, or handler behavior, we have to:
1. Edit code locally (or in Quick Edit — which causes repo drift)
2. Redeploy to Cloudflare
3. Wait for propagation

For frequently-evolving MCP tools, this is friction. We want the same flow Jared built for Perplexity Spaces harnesses: **push to GitHub → live immediately**, no platform redeploy.

---

## The Core Pattern — Fetch-at-Runtime

Split the Worker into two layers:

```
┌─────────────────────────────────────────────────────┐
│  HARNESS (deployed to Cloudflare once)              │
│  - Auth / Cloudflare Access check                   │
│  - Fetch tools.json from GitHub raw URL             │
│  - Route tool calls to handlers                     │
│  - Error handling, CORS, /health route              │
└─────────────────────────────────────────────────────┘
            ↓ fetches at request time
┌─────────────────────────────────────────────────────┐
│  PAYLOAD (lives in GitHub, version controlled)      │
│  tools.json — tool name, description, inputSchema   │
│  handlers.js (optional) — tool logic                │
└─────────────────────────────────────────────────────┘
```

Update `tools.json` in GitHub → Worker picks it up on the next request. No Cloudflare dashboard touch needed.

---

## Two Variants

### Variant A: Config-driven tool schemas (safe, recommended)

- Worker fetches `tools.json` at request time (or on a short cache TTL)
- `tools.json` contains tool names, descriptions, inputSchemas
- Handler logic stays in the Worker
- **Best for:** Updating tool descriptions, adding new tool entries, changing input validation rules

```json
// tools.json in GitHub
[
  {
    "name": "db_execute",
    "description": "...",
    "inputSchema": { ... }
  }
]
```

```js
// Worker harness
const TOOLS_URL = 'https://raw.githubusercontent.com/nothinginfinity/parallel-internet-sites/main/workers/context-links-mcp/tools.json';

async function getTools(env) {
  // Check cache first
  const cached = await caches.default.match(TOOLS_URL);
  if (cached) return cached.json();
  
  const res = await fetch(TOOLS_URL);
  const clone = res.clone();
  // Cache for 60 seconds
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'max-age=60');
  await caches.default.put(TOOLS_URL, new Response(clone.body, { headers }));
  return res.json();
}
```

### Variant B: Remote handler fetch (powerful, use carefully)

- Worker fetches and evaluates handler logic from GitHub
- Allows full tool behavior to be updated without any Worker deploy
- **Risks:** eval() is dangerous; must be locked to trusted URLs only
- **Safer alternative:** Use a module worker pattern with dynamic imports

---

## The Harness Analogy

| Perplexity Spaces | Cloudflare Workers |
|---|---|
| Space instructions (the thin boot) | Worker harness (auth + routing) |
| `G-000-alice-boot.md` (versioned payload) | `tools.json` (versioned payload) |
| Push gist → Alice picks it up on next boot | Push `tools.json` → Worker picks it up on next request |
| No Perplexity redeploy needed | No Cloudflare redeploy needed |

Jared built this pattern for agents. We're applying the same pattern to infrastructure.

---

## Open Questions for Bob

1. **Latency** — What's the realistic latency of `fetch('https://raw.githubusercontent.com/...')` inside a Cloudflare Worker? Edge → GitHub raw CDN round-trip by region.

2. **Caching strategies** — Which is best for low-traffic MCP servers where 60s stale is acceptable?
   - Cloudflare Cache API with short TTL
   - `waitUntil` stale-while-revalidate
   - Cloudflare KV as cache layer
   - In-memory module-level variable (warm for Worker isolate lifetime)

3. **Security** — For Variant B (remote handler fetch), how do we lock to trusted GitHub raw URLs only? Safer eval-free approach?

4. **Prior art** — Does this pattern have a name in the Cloudflare ecosystem? Any official examples?

---

## Candidate Workers to Refactor

| Worker | Current state | Good candidate? |
|---|---|---|
| `context-links-mcp` | 9 tools, monolithic `index.js` | ✅ Yes — tool schemas change often |
| `afo-mcp` / gateway MCP | 11 tools, monolithic | ✅ Yes — same reasons |
| `visibility-snapshot` (AFO form) | Mostly static routes | 🟡 Lower priority |

---

## Decision Gate

Before building: Jared needs to decide if the latency tradeoff is acceptable (Bob's research needed). If caching brings it to <10ms overhead, it's a clear win. If raw GitHub fetch adds 200ms to every MCP call, we may want KV as the intermediary instead.

**Next step:** Wait for Bob's research, then decide on Variant A for `context-links-mcp` as the first implementation.
