# Brainstorm Bulletin — AFO Source Recovery

**Date:** 2026-05-18  
**Author:** Alice  
**For review by:** Bob, Jared  
**Priority:** 🔴 High — infrastructure gap identified

---

## Summary

During a routine session check, we confirmed that the live AFO Visibility Snapshot Worker (`agentfeedoptimization.com`) is operational, but its source code in GitHub was **empty**. The Worker had been edited via Cloudflare's Quick Edit console without a corresponding git commit. This is a **source-of-truth drift** scenario.

The full source was recovered from commit `e2df086` in `nothinginfinity/parallel-internet-sites` and pushed back to `main`. The repo now reflects the live Worker.

---

## What Was Recovered

**File:** `workers/visibility-snapshot/index.js`  
**Recovered from commit:** `e2df086` (blob SHA `9a2ea75`)

### Worker architecture (what's in the file)

**Routes:**
| Method | Path | Function |
|---|---|---|
| `GET` | `/` or `/start` | Serves intake form HTML, injects `TURNSTILE_SITE_KEY` |
| `GET` | `/results` | Serves results page, reads `?d=` base64url JSON param |
| `POST` | `/api/visibility-snapshot` | Runs 10-signal visibility check, scores, generates prompts |
| `OPTIONS` | any | CORS preflight 204 |

**Two inlined HTML pages:**
- `START_HTML` — intake form with Cloudflare Turnstile CAPTCHA. Collects: name, email, business name, website URL, category, city/service area, top services, ideal customer, optional full-audit checkbox.
- `RESULTS_HTML` — animated score ring (0–100), 10-point checklist (pass/fail), 3 visibility prompts with copy buttons, platform links (ChatGPT, Gemini, Claude, Perplexity), ideal response example, CTA card.

**`handleSnapshot()` POST handler:**
- Field validation + URL normalization
- Cloudflare Turnstile server-side verification
- Domain-based rate limiting via D1 (`SNAPSHOT_RATE_LIMIT_WINDOW_HOURS`, `SNAPSHOT_MAX_PER_DOMAIN`)
- 10-signal visibility scoring
- Grade calculation (A/B/C/D with color: green/yellow/orange/red)
- Prompt generation (3 prompts per business)
- D1 lead persistence
- MailChannels email notification to `NOTIFY_EMAIL`

**Env vars required:**
```
TURNSTILE_SITE_KEY
TURNSTILE_SECRET
DB                          (D1 binding)
NOTIFY_EMAIL
NOTIFY_FROM
SNAPSHOT_RATE_LIMIT_WINDOW_HOURS
SNAPSHOT_MAX_PER_DOMAIN
```

**Booking URL hardcoded:** `https://cal.com/jared-edwards-gscxmo`

---

## Risk Assessment

| Risk | Severity | Current status |
|---|---|---|
| Quick Edit drift (Worker ≠ repo) | 🔴 High | **Resolved for now** — source pushed. No pipeline prevents recurrence. |
| No deploy pipeline | 🔴 High | **Open.** No GitHub Action deploys `main` to Cloudflare. |
| D1 schema not in repo | 🟡 Unknown | **Unverified.** `schema.sql` existence in repo not confirmed. |
| No PR protection on `main` | 🟡 Medium | **Open.** Direct pushes to `main` currently allowed. |

---

## Recommended Actions

### Immediate (this week)
1. **Deploy pipeline** — Create `.github/workflows/deploy-afo-worker.yml` using `cloudflare/wrangler-action`. Trigger: push to `main` affecting `workers/visibility-snapshot/**`. This makes `main` the single source of truth and eliminates Quick Edit drift.

2. **Verify D1 schema** — Confirm `workers/visibility-snapshot/schema.sql` exists and matches the live D1 database. If not, export the live schema and commit it.

3. **`wrangler.toml`** — Confirm `workers/visibility-snapshot/wrangler.toml` exists with correct `[[d1_databases]]` binding and `name = "afo-visibility-snapshot"`.

### Near-term
4. **Branch protection** — Enable `Require a pull request before merging` on `main` in `nothinginfinity/parallel-internet-sites`. This prevents hot edits without review.

5. **Worker versioning** — Add a `version` constant to `index.js` (e.g. `const VERSION = '1.0.1'`) and expose it at `GET /health` → `{ version, ok: true }`. Makes it easy to confirm what's deployed.

---

## Session Documentation Trail

| File | Location | Status |
|---|---|---|
| `index.js` | `parallel-internet-sites/workers/visibility-snapshot/` | ✅ Pushed |
| `handoff.md` | `repo-copilot/spaces/alice/` | ✅ Updated |
| `mail.md` (Bob thread) | `repo-copilot/spaces/alice/` | ✅ Written |
| This bulletin | `repo-copilot/spaces/brainstorm/` | ✅ Written |
| `brain.json` | `repo-copilot/spaces/gists/` | ✅ Updated |

---

*Alice — 2026-05-18 — repo-copilot team*
