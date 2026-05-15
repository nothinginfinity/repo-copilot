# Handoff: AFO Signup Pipeline — 2026-05-15

**Session:** Friday May 15, 2026 — ~9am to 1:26pm PDT  
**Participants:** Jared + Alice  
**Repo:** `nothinginfinity/parallel-internet-sites`  
**Worker:** `afo-audit-signup` → `https://afo-audit-signup.jaredtechfit.workers.dev`

---

## What Was Built

A production Cloudflare Worker (`workers/audit-signup/index.js`) that handles the full AFO dogfood signup pipeline:

1. **Validates** incoming POST fields (name, email, business_name, website_url)
2. **Verifies** Turnstile token (currently bypassable with `SKIP` for testing)
3. **Writes to D1 database** — `customers`, `audit_requests`, `coupon_redemptions` tables
4. **Sends emails via Resend** — confirmation to customer + admin notification
5. **Creates a GitHub issue** in `nothinginfinity/agent-feed-optimization` labelled `audit-request` + `dogfood-v1`

---

## Infrastructure

| Resource | Name / Value |
|---|---|
| **Worker** | `afo-audit-signup` |
| **Live URL** | `https://afo-audit-signup.jaredtechfit.workers.dev` |
| **Test UI** | `https://afo-audit-signup.jaredtechfit.workers.dev/test` |
| **Health check** | `https://afo-audit-signup.jaredtechfit.workers.dev/api/health` |
| **D1 Database** | Bound as `DB` in wrangler.toml |
| **GitHub issues repo** | `nothinginfinity/agent-feed-optimization` |
| **Email provider** | Resend |
| **Sending domain** | `agentfeedoptimization.com` (verified ✅) |
| **Deploy workflow** | `.github/workflows/deploy-audit-signup.yml` |

---

## Secrets (GitHub Repository Secrets)

| Secret Name | Purpose |
|---|---|
| `GIT_HUBTOKEN_AFO` | GitHub PAT — creates issues in agent-feed-optimization repo |
| `EMAIL_PROVIDER` | Set to `resend` |
| `EMAIL_API_KEY` | Resend API key |
| `EMAIL_FROM` | `hello@agentfeedoptimization.com` |
| `ADMIN_EMAIL` | Jared's admin email for notifications |
| `CLOUDFLARE_ACCOUNT_ID` | CF account (set ~20hrs ago) |
| `CLOUDFLARE_API_TOKEN` | Scoped CF token (Workers + D1 permissions) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret (bypass active during testing) |

---

## Bugs Fixed This Session

| Bug | Root Cause | Fix |
|---|---|---|
| Worker deploy failing | `apiEmail` in workflow conflicted with token-only auth | Removed `apiEmail` from deploy workflow |
| GitHub issue creation returning JSON parse error | GitHub returned plain-text 403, not JSON | Added `raw_response` fallback before JSON.parse |
| GitHub 403 on all requests | Missing `User-Agent` header (GitHub REST API requirement) | Added `User-Agent: afo-audit-worker/1.0` to all GH fetch calls via shared `GH_HEADERS()` helper |
| Customer email 403 from Resend | `EMAIL_FROM` was `onboarding@resend.dev` (sandbox only) | Verified `agentfeedoptimization.com` in Resend → updated `EMAIL_FROM` secret |

---

## Final Test Result (1:18pm PDT)

```json
{
  "ok": true,
  "audit_request_id": "7e6ca6bb-35a0-4b4f-b7ac-783c0a84ac00",
  "plan": "founder_free",
  "_debug": {
    "email": {
      "provider": "resend",
      "confirmation": { "ok": true },
      "admin": { "ok": true }
    },
    "github": {
      "ok": true,
      "issue_number": 4,
      "url": "https://github.com/nothinginfinity/agent-feed-optimization/issues/4"
    }
  }
}
```

---

## What's NOT Done Yet (Next Phase)

### 1. Wire the signup form
The landing page form on `agentfeedoptimization.com` needs to POST to:
```
https://afo-audit-signup.jaredtechfit.workers.dev/api/audit-signup
```
Fields required: `name`, `email`, `business_name`, `website_url`, `coupon_code` (optional), `cf_turnstile_response`.

### 2. Enable Turnstile
Currently the worker accepts `cf_turnstile_response: 'SKIP'`. Before public launch, `TURNSTILE_SECRET` must be set to the real secret and the frontend must include a real Turnstile widget.

### 3. Alice job intake flow
When a GitHub issue lands in `agent-feed-optimization` with label `audit-request`, Alice needs a defined process to:
- Read the issue
- Create `jobs/YYYY-MM-DD-{slug}/job.json`
- Assign to Jared for approval

### 4. Strip `_debug` from production responses
The `_debug` block exposes internal IDs and provider details. Should be removed or gated behind an admin flag before public traffic hits the endpoint.

### 5. Custom domain for the Worker
Currently live at `*.jaredtechfit.workers.dev`. Should eventually move to `api.agentfeedoptimization.com` or similar.

---

## Valid Coupon Codes

| Code | Plan |
|---|---|
| `AFO-FOUNDER` | `founder_free` |
| `AFO-DOGFOOD` | `founder_free` |

No coupon → `audit_only_v1` plan.

---

*Handoff written by Alice — 2026-05-15 13:26 PDT*
