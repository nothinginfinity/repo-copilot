# Alice Handoff
_generated: 2026-05-14T17:30:00Z | session: alice/afo-v1-launch-flow/jared_

## Current State

### parallel-internet-sites
**Status:** 🟡 Pre-launch hold — AFO v1 signup flow built. Awaiting Jared infrastructure setup.

**Committed this session:**
- ✅ `workers/audit-signup/index.js` — Cloudflare Worker handling POST /api/audit-signup
- ✅ `workers/audit-signup/wrangler.toml` — D1 binding, routes, var config (no secrets hardcoded)
- ✅ `workers/audit-signup/migrations/0001_initial.sql` — D1 schema: customers, audit_requests, coupon_redemptions
- ✅ `workers/audit-signup/README.md` — full setup guide, env var table, coupon codes, token permissions
- ✅ `templates/site/pages/start.html` — /start page with real form, Turnstile, hidden fields, JS submit handler
- ✅ `templates/site/pages/thanks.html` — /thanks confirmation page
- ✅ `templates/site/pages/contact.html.patch.md` — SERVICES_LIST bug documented, fix options A and B specified
- ✅ `templates/intake/client-intake.afo.json` — AFO Customer #1 intake (Jared dogfood entry, fill in email + Turnstile key)
- ✅ `docs/afo-v1-launch-checklist.md` — 7-phase launch checklist with success criteria

**Previously committed (still live):**
- `docs/launch-plan-v2.md`
- `docs/afo-customer-1-runbook.md`
- `docs/llm-baseline-template.md`
- `docs/monitoring/` (Day 0, 7, 30, 60-90 templates)

### repo-copilot
**Status:** 🟢 Stable
- G-001 v1.4 live — brainstorm auto-loads handoff on boot

## Open Gates — Jared must complete before any deployment

### Infrastructure gates (AFO v1)
1. Fill `REPLACE_WITH_JARED_EMAIL` in `templates/intake/client-intake.afo.json`
2. Fill `REPLACE_WITH_CONTACT_EMAIL` in same file
3. Create D1 database, run migration, copy `database_id` into `workers/audit-signup/wrangler.toml`
4. Create Cloudflare Turnstile keys; fill `REPLACE_WITH_TURNSTILE_SITE_KEY` in intake + `start.html` output
5. Set all 5 Worker secrets via `wrangler secret put`
6. Choose email provider (Resend recommended), verify sender domain
7. Create fine-grained GitHub PAT (Issues r/w only on agent-feed-optimization)
8. Deploy Worker via `wrangler deploy`

### Site gates (TrueBuild — still on hold)
1. DNS for `ai.truebuild.com` — **Jared action**
2. Form action URL wired — **Jared action**
3. Jared content approval — **Jared action**

## SERVICES_LIST Bug
`contact.html` uses `{{SERVICES_LIST}}` inside `<select>` but generator emits comma-separated text, not `<option>` elements. Two fix paths documented in `contact.html.patch.md`. Option A requires generator update. Option B (static) is already live in `start.html`.

## Absolute Next Step
**Run baseline LLM test before touching the domain.**
File: `docs/llm-baseline-template.md` → save results to `examples/afo/prompt-tests/day-0-baseline.md` → commit.

## Last Session
Pushed complete AFO v1 signup flow: Worker, D1 schema, start page, thanks page, intake JSON, v1 launch checklist.
