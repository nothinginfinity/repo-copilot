# Claude Session Log
> Append new entries at the top. Most recent session first.
> New Claude: read the TOP entry only — that's the current state of the world.

---

## SESSION-2026-05-23

**Date:** 2026-05-23
**Duration:** Full day session
**Status:** Complete ✅

### What Was Built

**MCP Servers deployed and connected to Claude.ai:**
- `context-links-mcp` v1.4.0 — 9 tools, D1-backed, correct JSON-RPC shapes
- `github-mcp` v1.1.0 — 6 tools, read/write GitHub autonomously (no URL sharing needed)
- `cloudflare-tools-mcp` v1.1.0 — 6 tools, DNS management + Worker source reader

**APIs and UIs:**
- `context-links-api` v1.2.0 — REST API at context-links-api.agentfeedoptimization.com
- `afo-tools` v1.0.0 — Tool Catalogue API at tools.agentfeedoptimization.com
- `afo-tools-ui` v1.0.0 — Workshop UI at workshop.agentfeedoptimization.com

**Tool Catalogue:**
- 22 tools catalogued across 6 categories
- 5 bundles including "Full Session Belt" and "Mobile MCP Factory"
- `/generate-mcp` endpoint generates deployable Worker source from any bundle

**Documentation committed to GitHub:**
- `spaces/claude/MOBILE-MCP-PLAYBOOK.md` — full mobile MCP deployment guide
- `spaces/claude/boot.md` — updated with deep links, token rotation, inbox read step, session log
- `spaces/claude/log.md` — this file, created

**Legacy cleanup:**
- Deleted: mcp-builder2, mcp-builder3, mcp-builder4, builder-mcp, muddy-violet-c44f

### Critical Discovery — JSON-RPC Response Shapes

The #1 reason MCP connectors fail in Claude.ai:

```javascript
// WRONG — using same wrapper for everything
function ok(id, result) {
  return Response.json({ jsonrpc:'2.0', id, result: { content: [...] } }); // ❌ for initialize/tools/list
}

// CORRECT — three separate helpers
function rpc(id, result) { ... }        // initialize, tools/list, ping → bare result
function toolResult(id, result) { ... } // tools/call only → content-wrapped
function rpcErr(id, code, msg) { ... }  // all errors
```

### Current Infra State

| Worker | URL | Status |
|--------|-----|--------|
| mcp-prax | mcp-prax.jaredtechfit.workers.dev/mcp | ✅ v1.5.0 |
| afo-mcp | afo-mcp.jaredtechfit.workers.dev/mcp | ✅ Live |
| context-links-mcp | context-links-mcp.agentfeedoptimization.com/mcp | ✅ v1.4.0 — needs D1 binding re-added after any redeploy |
| context-links-api | context-links-api.agentfeedoptimization.com | ✅ v1.2.0 — needs D1 binding re-added after any redeploy |
| github-mcp | github-mcp.agentfeedoptimization.com/mcp | ✅ v1.1.0 — GITHUB_TOKEN stored as secret |
| cloudflare-tools-mcp | cloudflare-tools-mcp.agentfeedoptimization.com/mcp | ✅ v1.1.0 — CF_API_TOKEN + CF_DNS_TOKEN stored as secrets |
| afo-tools | tools.agentfeedoptimization.com | ✅ v1.0.0 — needs D1 binding re-added after any redeploy |
| afo-tools-ui | workshop.agentfeedoptimization.com | ✅ v1.0.0 — no binding needed |
| ai-message-bus | messages.agentfeedoptimization.com | ✅ Live |
| alice-bridge-mcp | alice-bridge-mcp.jaredtechfit.workers.dev/mcp | ⚠️ BROKEN — see MSG-004 in inbox |

### Open Issues / Next Priorities

1. **alice-bridge-mcp broken** — MSG-004 in inbox has full diagnostic steps. Alice wrote the corrected source. Run diagnostic first, then deploy from `workers/alice-bridge-mcp/worker.js` in repo.
2. **AFO Turnstile test** — pending, not started
3. **context-links frontend** — Alice's CLAUDE-TODO.md has Phase 5 (Link Creation UI) and Phase 6 (Analytics Dashboard) remaining
4. **Legacy Workers to review** — afo-mcp2, alice-to-claude-bridge, test-deploy-limits (check before deleting)
5. **Tool Catalogue UI** — workshop.agentfeedoptimization.com is live but could use search improvements

### Tokens

| Secret | Worker | Notes |
|--------|--------|-------|
| GITHUB_TOKEN | github-mcp | ghp_... stored as Worker secret. Rotate at https://github.com/settings/tokens |
| CF_API_TOKEN | cloudflare-tools-mcp | Account-scoped Workers token |
| CF_DNS_TOKEN | cloudflare-tools-mcp | Zone-scoped DNS:Edit token for agentfeedoptimization.com |

---
