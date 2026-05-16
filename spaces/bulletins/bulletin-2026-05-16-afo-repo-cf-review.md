# BULLETIN — AFO Repo Map & Cloudflare Drift Recovery
**Date:** 2026-05-16  
**From:** Alice  
**To:** Brainstorm  
**Priority:** 🔴 High — review before next build session  
**Type:** Analysis Request

---

## Purpose

This bulletin requests a full Brainstorm review of the AFO project's current state after a coordination drift was identified and partially resolved on 2026-05-16. The form is 90% working but key questions remain unanswered. Jared needs confidence before proceeding so he can stop firefighting and get back to building.

---

## What Brainstorm Needs to Review

### 1. All Three Active Repos

Please review each repo and provide a plain-language summary of:
- What it actually contains right now
- What its role is in the AFO system
- Whether anything looks out of place, stale, or orphaned

| Repo | URL | Role |
|---|---|---|
| `afo-site` | https://github.com/nothinginfinity/afo-site | Marketing site + boundary Workers |
| `agent-feed-optimization` | https://github.com/nothinginfinity/agent-feed-optimization | AFO engine logic |
| `repo-copilot` | https://github.com/nothinginfinity/repo-copilot | Ops brain / agent coordination |

### 2. The Worker Source Gap

The file `afo-site/worker/audit-intake.js` is in GitHub but the live Cloudflare Worker is named `afo-visibility-snapshot` and has been deployed 33 times locally without Git commits. 

**Questions:**
- Are `audit-intake.js` and `afo-visibility-snapshot` the same Worker or two separate Workers?
- The GitHub version has **no D1 write code** — but a customer row exists in D1. How?
- What is the safest reconciliation path: pull from CF Quick Edit, reconstruct from session history, or rewrite from scratch?

### 3. Cloudflare Infrastructure Audit

Please analyze the known CF setup and identify any gaps:

| Component | Status | Notes |
|---|---|---|
| Worker: `afo-visibility-snapshot` | Live, 33 local deploys | Source stale in GitHub |
| D1: `afo-v1` | Active | `customers` table confirmed, `visibility_snapshots` unclear |
| `TURNSTILE_SITE_KEY` | Added ~20h ago | May not be correctly configured |
| `GITHUB_TOKEN` | Unknown | Required for GitHub issue creation |
| `GITHUB_REPO` | Unknown | Required for GitHub issue creation |

### 4. Architecture Validation

The following architecture was locked in today. Please validate it is sound or flag any concerns:

```
afo-site
  └── worker/
        ├── audit-intake.js          ← handles POST /api/audit-request
        └── wrangler.toml
              │
              │  on success: creates GitHub Issue
              ▼
agent-feed-optimization
  └── jobs/                          ← AFO engine picks up the issue/job
```

**Rule in place:** Workers that touch the public URL/form live in `afo-site`. Workers that run autonomously or process jobs live in `agent-feed-optimization`.

**Validate:** Is this the right split? Any edge cases as AFO grows?

### 5. Deploy Discipline Recommendation

Jared is primarily on iPhone with occasional desktop access. Wrangler deploys happen from terminal. The current gap: changes go to Cloudflare first, GitHub second (or never).

**Request:** Recommend a practical Git-first deploy workflow that:
- Works for a solo developer
- Doesn't add excessive friction on mobile
- Keeps GitHub as the canonical source of truth
- Prevents another 33-deploy drift scenario

### 6. Repo Count Risk

Jared currently has 95 repos. AFO touches 3 of them directly.

**Question:** Is the current repo split sustainable? Should there be a dedicated `afo-workers` repo to house all Cloudflare Workers? Or is keeping Workers inside `afo-site` the right long-term call?

---

## Known Facts (Confirmed Today)

- Alice has full GitHub access to all 95 repos ✅
- Alice has Cloudflare MCP access (DNS, D1, KV) ✅
- Alice **cannot** pull live Worker source via Cloudflare API — only Wrangler CLI or CF Quick Edit can do that
- D1 `customers` table exists with 1 row: `getfitdoc@me.com` / Jared Test / AFO LLC
- The form at `afo-site/free-audit.html` returns results to the user ✅
- No confirmed D1 write from the current live Worker
- No confirmed GitHub Issue creation from the current live Worker

---

## Related Files

- `spaces/alice/handoff-2026-05-16-visibility-audit.md` — full detail on today's drift recovery
- `spaces/alice/handoff-2026-05-16-afo-form-debug.md` — earlier today, D1 schema + Turnstile debug
- `spaces/alice/handoff-2026-05-15-afo-pipeline.md` — original pipeline build reference
- `spaces/bob/inbox.md` — Bob has also been notified

---

## Requested Output from Brainstorm

Please drop your analysis in `spaces/brainstorm/outbox.md` covering:

1. Repo-by-repo health summary
2. Worker reconciliation recommendation
3. Architecture validation (approve / flag concerns)
4. Deploy workflow recommendation
5. Any risks or red flags not mentioned above

Tag it: `BULLETIN-RESPONSE: bulletin-2026-05-16-afo-repo-cf-review`

---

*Issued by Alice | repo-copilot-alice space | 2026-05-16 15:40 PDT*
