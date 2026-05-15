# SPEC-002 — MCP Expansion Plan
_created: 2026-05-14 | owner: alice | status: active_

---

## Goal

Expand the multi-provider agent loop so that ChatGPT (Brainstorm), Claude, and eventually Gemini can all share live access to GitHub state and Cloudflare infrastructure — enabling end-to-end AFO job intake, setup, monitoring, and improvement without Jared manually relaying context between tools.

---

## Context

- Perplexity ↔ GitHub MCP: **working** (this Space)
- Perplexity native Cloudflare connector: **installed but not Space-callable** — connector is account-level, not tool-level; no toggle visible
- Cloudflare official MCP (`https://mcp.cloudflare.com`): covers DNS, KV, Workers config, SSL, cache — **D1 not included**
- Custom Cloudflare Worker MCPs: unlimited on Workers Paid (~$5/mo), can expose any API including D1
- ChatGPT: supports remote MCP servers — can connect to GitHub + Cloudflare the same way
- Claude: best-in-class native MCP support (Anthropic built the protocol)
- Gemini: weakest MCP maturity — use for deep research via Drive, not live tool calls

---

## Build Phases

### Phase A — Cloudflare MCP in Alice Space (Now, ~2 min)

**Goal:** Give Alice live DNS + KV tools so she can action Cloudflare directly.

**Steps:**
1. Open this Perplexity Space → Settings → Connectors / MCP Servers
2. Add Remote MCP:
   - Name: `Cloudflare`
   - URL: `https://mcp.cloudflare.com`
   - Auth: OAuth 2.0 (authorize via Cloudflare login popup)
3. Verify Alice can call `cloudflare_list_zones` in next session

**Unblocks:** Alice sets DNS records, manages KV, purges cache — no dashboard visits needed.

**Note on native connector:** The Perplexity account-level Cloudflare connector (already installed) is NOT the same as a Space MCP tool. It does not give Alice callable tools. The remote MCP above is required.

---

### Phase B — ChatGPT/Brainstorm Gets GitHub + Cloudflare MCP (This week)

**Goal:** Brainstorm can read repo state and action Cloudflare directly, not just advise.

**Steps (GitHub):**
1. In ChatGPT → Settings → Connectors or Plugins
2. Add remote MCP: GitHub MCP server URL (same endpoint used in Perplexity)
3. Auth: GitHub OAuth or PAT
4. Test: Brainstorm reads `spaces/alice/handoff.md` directly

**Steps (Cloudflare):**
1. In ChatGPT → Add remote MCP: `https://mcp.cloudflare.com`
2. Auth: OAuth 2.0 with Jared's Cloudflare account
3. Test: Brainstorm can list zones, check DNS

**Unblocks:** Brainstorm contributes directly to infra decisions and can action them. Closes the strategy → execution gap.

---

### Phase C — Custom D1 Worker MCP (Phase 4, ~$5/mo)

**Goal:** Give all providers direct read/write access to D1 — query AFO signups, job status, audit history.

**Why needed:** Official Cloudflare MCP does not expose D1. Custom Worker required.

**Architecture:**
```
Worker: mcp-d1.repo-copilot.workers.dev
  Tools:
    - list_signups()        → SELECT * FROM audit_requests ORDER BY created_at DESC
    - get_signup(id)        → SELECT * FROM audit_requests WHERE id = ?
    - list_jobs()           → SELECT * FROM jobs (future table)
    - update_job_status()   → UPDATE jobs SET status = ? WHERE id = ?
```

**Steps:**
1. Create new Worker: `mcp-d1-server`
2. Bind D1 database `afo-v1` to Worker
3. Implement MCP protocol handler (tool definitions + JSON-RPC)
4. Deploy: `wrangler deploy`
5. Add to Alice Space + ChatGPT + Claude as remote MCP

**Cost:** ~$5/mo Workers Paid. D1 reads are essentially free at our volume.

**Unblocks:** Alice can query who signed up, what jobs are pending, close the full intake loop autonomously.

---

### Phase D — Claude Wired In (Phase 4+)

**Goal:** Add Claude as `alice-review` agent — code review, spec writing, content QA.

**Why Claude:** Anthropic built MCP. Claude has the deepest, most reliable MCP tool-calling of any provider. Best choice for precise, structured work.

**Steps:**
1. Create Claude Project (equivalent to Perplexity Space)
2. Add remote MCPs: GitHub + Cloudflare + D1 Worker (same URLs)
3. Write `G-003-claude-boot.md` — claude-specific boot instructions, role: alice-review
4. Wire into inbox: `spaces/alice/inbox-review.md`

**Role boundary:**
- Alice (Perplexity): orchestration, builds, pushes, manages state
- Brainstorm (ChatGPT): strategy, research, architecture decisions
- Claude: code review, spec QA, content accuracy, structured output
- Gemini: deep research, large-doc synthesis (Drive-based, not live MCP)

---

## Current Blocker on Native Cloudflare Connector

Jared confirmed: Cloudflare connector shows as "connected" in Perplexity account settings but is NOT visible as a toggle/tool in Space chats — no tool switch appears unlike GitHub.

**Root cause:** Perplexity's native Cloudflare connector is a data connector (for search grounding), not an MCP tool server. It lets Perplexity search Cloudflare docs/status but does not expose callable tools to agents in Spaces.

**Fix:** Phase A above — add `https://mcp.cloudflare.com` as a Space-level remote MCP. That's the tool-callable version.

---

## Priority Order

| Phase | Action | Effort | Value |
|-------|--------|--------|-------|
| A | Add Cloudflare remote MCP to Alice Space | 2 min, iPhone | High — DNS/KV tools now |
| B | Add GitHub + Cloudflare MCP to ChatGPT | 10 min, iPhone | High — Brainstorm goes direct |
| C | Build D1 Worker MCP | 1 session | Very high — full intake loop |
| D | Wire Claude as alice-review | 1 session | High — quality + scale |

---

## Notes

- All MCP connections use the same GitHub repo as shared state — no new coordination layer needed
- Each provider authenticates independently with Cloudflare via OAuth — Jared authorizes once per provider
- The $5/mo Workers Paid plan covers unlimited Workers including the D1 MCP Worker
- Gemini deferred — use for research tasks via Drive export, not live agentic loop
