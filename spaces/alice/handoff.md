# Alice Handoff — Session State

**Last updated:** 2026-05-20T22:52:00Z  
**Updated by:** Alice (Perplexity, Sonnet 4.6)  
**Session type:** Claude mcp-prax activation + KV mailbox build

---

## 🔥 MAJOR MILESTONE THIS SESSION

**Claude now has a working inbox.** He built it himself using mcp-prax. No GitHub access required. Claude boots by calling `getKVValue("inbox")` — reads messages instantly from Cloudflare KV. Alice mirrors inbox writes to KV so Claude always has access.

---

## What happened this session

### 1. Claude connected to mcp-prax (13 tools)
Full Cloudflare control plane live. Claude can build/deploy/fix/delete any Worker, D1, KV, Access app by prompt.

### 2. All agent boot files synced

| File | Version | Key change |
|------|---------|------------|
| `G-000-alice-boot.md` | v2.5 | Team roster — Claude = full infra |
| `G-001-brainstorm-readonly.md` | v1.5 | Team roster + mcp-prax tools for Bob |
| `G-002-claude-boot.md` | v2.1 | KV mailbox — startup rewritten, no GitHub needed |

### 3. Claude built his own KV mailbox (mcp-prax v1.4.0)

Claude executed all 7 steps in one shot:
- Created `claude-mailbox` KV namespace (ID: `e85cf11f27c24fceb19bcbb2099ffd10`)
- Read mcp-prax source, added KV binding (`CLAUDE_MAILBOX`)
- Added 3 new tools: `getKVValue`, `putKVValue`, `listKVKeys`
- Deployed mcp-prax v1.4.0
- Seeded inbox with MSG-001
- Verified end-to-end read back — zero errors

### 4. New workflow established

| Task | Agent |
|------|-------|
| Spec writing, GitHub commits | Alice (Perplexity) |
| Research, brainstorm | Bob (ChatGPT, read-only) |
| Build / deploy / fix Cloudflare infra | Claude (Anthropic) |
| Final decisions, relay bridge | Jared |

### 5. Earlier this session — context-links-mcp fix
`db_execute` params bug fixed, pushed as v1.1.0 to `parallel-internet-sites`. **Redeploy still pending** — Claude can now do this via `deployWorker`.

---

## ⚠️ Alice write protocol — NEW REQUIREMENT

Whenever Alice writes a message to `spaces/claude/inbox.md` on GitHub, she **must also** call `mcp-prax:putKVValue` with key `inbox` and the same JSON payload. This keeps Claude's KV inbox in sync. GitHub = source of truth archive. KV = Claude's live readable inbox.

---

## Active projects

| Project | Status | Next action |
|---------|--------|-------------|
| **Claude KV mailbox** | ✅ Live | Alice must mirror all inbox writes to KV going forward |
| **context-links-mcp Worker** | 🟠 Fix pushed, redeploy pending | Ask Claude to deploy via `deployWorker` |
| **AFO Turnstile test** | 🔴 Blocker | Only remaining AFO funnel blocker |
| **Context Links Phase 2** | 🟡 Not started | See `spaces/context-links/handoff.md` |
| **Legacy Worker cleanup** | 🟡 Ready | Claude can delete mcp-builder2/3/4, builder-mcp |
| **Version-controlled Workers** | 💡 Brainstorm | See bulletin |

---

## Immediate next actions (priority order)

1. **Alice: mirror all future inbox writes to KV** — `putKVValue("inbox", ...)` every time she writes to `spaces/claude/inbox.md`
2. **Redeploy context-links-mcp** — ask Claude: `deployWorker("context-links-mcp", <source from getWorkerScript or GitHub>)`
3. **AFO Turnstile test** — final AFO funnel blocker
4. **Legacy Worker cleanup** — Claude deletes mcp-builder2/3/4, builder-mcp
5. **Context Links Phase 2**

---

## Context for next Alice instance

You are Alice. Boot by reading this file, then present the active project list to Jared.

**Critical:** Claude's inbox now runs through KV, not GitHub. Whenever you write to `spaces/claude/inbox.md`, you MUST also call `mcp-prax:putKVValue` with key `inbox` and the full JSON message payload. If you skip this step, Claude won't see the message.

Claude boots with: `getKVValue("inbox")` — no GitHub needed.
