# Alice Handoff — Visibility Audit & Repo/CF Map
**Date:** 2026-05-16  
**Session:** Afternoon — drift recovery + architecture lock-in  
**Status:** 🟡 Documented — ready for Brainstorm review

---

## What Happened (The Drift)

Over the past 24h, the Worker (`afo-visibility-snapshot`) was deployed **33 times via Wrangler CLI** directly from Jared's local machine. Each deploy pushed to Cloudflare but was **never committed to GitHub**. Alice lost sync between what was in GitHub vs what was actually running live in Cloudflare. This caused cascading confusion about which code was canonical.

**Relief:** The Worker source DOES exist in GitHub at `nothinginfinity/afo-site/worker/audit-intake.js`. However it may be stale vs the live deployed version.

---

## Confirmed Repo Map

| Repo | Purpose | Language |
|---|---|---|
| `nothinginfinity/afo-site` | Marketing site + boundary Workers | HTML / JS |
| `nothinginfinity/agent-feed-optimization` | AFO engine logic, RSS, context packets | JavaScript |
| `nothinginfinity/repo-copilot` | Alice brain — instructions, memory, inbox | Markdown |

### Architecture Decision (locked in today)

```
afo-site
  └── worker/audit-intake.js       ← intake boundary (lives here ✅)
        │
        │  Creates GitHub Issue (hand-off signal)
        ▼
agent-feed-optimization
  └── jobs/                        ← AFO engine picks up here
```

**Rule:** If it touches the public URL or the form → `afo-site`.  
**Rule:** If it runs autonomously / processes a job → `agent-feed-optimization`.

---

## What `worker/audit-intake.js` Actually Does

Read from GitHub SHA `2eb0e77e8cad5edfed64383a0d3c341b8e9cd986`. Responsibilities:

1. CORS preflight
2. Method guard (POST only)
3. JSON body parsing
4. Honeypot check (`website_confirm` field)
5. Validation (url, name, email)
6. Optional IP rate limiting via `RATE_LIMIT_KV`
7. Builds record with generated `afo-{ts}-{rand}` ID
8. **GitHub handoff** — creates Issue OR triggers `workflow_dispatch`
9. Returns `{ ok: true, request_id }` to client

### What it does NOT do (in GitHub version)
- ❌ No D1 write
- ❌ No email send
- ❌ No Turnstile verification

> Note: The earlier handoff (`handoff-2026-05-16-afo-form-debug.md`) says D1 schema is confirmed and Turnstile key was added. This means the **live Cloudflare Worker is ahead of the GitHub version** — it has D1 writes and Turnstile that aren't in the repo yet.

---

## Cloudflare Infrastructure

### Workers
| Worker Name | Source File | Notes |
|---|---|---|
| `afo-visibility-snapshot` | Live in CF, stale in GitHub | 33 local-only deploys |

### D1 Database (`afo-v1`)
Per earlier handoff, both tables exist:
- `customers` ✅
- `visibility_snapshots` ✅

One confirmed customer row: `getfitdoc@me.com` / Jared Test / AFO LLC (patched per earlier session).

### Environment Variables (Workers → Settings)
| Variable | Status |
|---|---|
| `TURNSTILE_SITE_KEY` | Added ~20h ago per deploy history — MAY not be correctly set |
| `GITHUB_TOKEN` | Unknown |
| `GITHUB_REPO` | Unknown |

---

## Alice's Access Map (Confirmed)

| System | Access | Notes |
|---|---|---|
| GitHub `nothinginfinity` | ✅ Full (95 repos) | Read/write/push/PR |
| Cloudflare DNS | ✅ Full via MCP | |
| Cloudflare D1 | ✅ Full via MCP | Can run SQL |
| Cloudflare KV | ✅ Full via MCP | |
| Cloudflare Worker **source** | ⚠️ Cannot pull live code via API | GitHub must be source of truth |

---

## Critical Rule Going Forward

> **All Worker changes go to GitHub FIRST, then `wrangler deploy`.  
> No more local-only deploys. GitHub is the source of truth.**

---

## Immediate Next Steps

1. **Reconcile** — Jared pulls current live Worker code from CF Quick Edit and pastes into `worker/audit-intake.js` in GitHub (or Alice rewrites from scratch with all known features)
2. **Verify** `TURNSTILE_SITE_KEY` is correctly set in Worker variables
3. **Verify** `GITHUB_TOKEN` is set
4. **Test** form end-to-end → D1 rows → GitHub issue created
5. **Update inbox** when confirmed working

---

## Related Files
- `spaces/alice/handoff-2026-05-16-afo-form-debug.md` — earlier today, D1 schema + Turnstile debug
- `spaces/alice/handoff-2026-05-15-afo-pipeline.md` — pipeline build reference
- `nothinginfinity/afo-site/worker/audit-intake.js` — Worker source (may be stale)

---
*Written by Alice | repo-copilot space | 2026-05-16 15:33 PDT*
