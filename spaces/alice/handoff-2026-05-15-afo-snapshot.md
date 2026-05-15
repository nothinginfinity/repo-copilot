# Handoff — AFO Visibility Snapshot Build
**Date:** 2026-05-15  
**Session:** AFO funnel strategy + 10-commit implementation  
**Repo:** `nothinginfinity/parallel-internet-sites`  
**Branch:** `main`  
**Status:** ✅ All 10 commits complete — ready for Jared review and QA

---

## What Was Decided (Strategy)

This session started with a full strategy correction from Jared + Brainstorm:

- **AFO is Customer #1.** TrueBuild is demo/sample data only unless they opt in.
- **Free CTA is NOT a full audit.** It is a lightweight **AFO Visibility Snapshot** — a self-test tool that shows whether a business appears in LLM chat for ideal prompts.
- **Full audits are manual, paid, or call-gated.** No automated audit fulfillment in any free flow.
- **No LLM API calls in the free flow.** All checks are cheap HTTP fetches only.

---

## What Was Built — 10 Commits

### Commit 1 — Roadmap/Spec
**File:** `docs/afo-funnel-roadmap-v1.md`  
Full strategy spec defining the AFO funnel, free vs paid boundary, implementation sequence, and product decisions. The source of truth for this build.

### Commit 2 — D1 Migration Plan
**File:** `docs/migration-v2.sql`  
Additive SQL migration. Adds `visibility_snapshots` table and new columns to `customers`. Does NOT touch existing `audit_requests`, `customers`, or `coupon_redemptions` tables. Must be applied to production D1 before deploy.

### Commit 3 — UI Copy + Form Fields
**File:** `docs/snapshot-form-spec.md`  
Updated public form CTA copy ("Get Your Free AFO Visibility Snapshot") and new required fields: `business_category`, `city_or_service_area`, `top_services`. Optional: `ideal_customer`, `requested_full_audit` checkbox.

### Commit 4 — `/api/visibility-snapshot` Route Stub
**File:** `workers/audit-signup/visibility-snapshot.js` (stub)  
New endpoint registered in `index.js`. Validation, Turnstile, rate limiting, field collection. Website check step was a stub at this point.

### Commit 5 — Prompt Generator
**File:** `workers/audit-signup/prompt-generator.js`  
5 deterministic Ideal Visibility Prompt templates: category discovery, problem/solution, local/service-area, service comparison, direct brand accuracy. No LLM calls — pure string interpolation from form fields.

### Commit 6 — Results Page
**File:** `workers/audit-signup/results-page.js`  
`GET /results` route. Renders: animated SVG score ring, color-coded score band, 10 check rows (✅/❌), 5 prompt cards with copy-to-clipboard, platform badges (ChatGPT, Gemini, Claude, Perplexity), CTA section. Works from query params in demo/preview mode today; production will receive `snapshot_id` from `/api/visibility-snapshot`.

### Commit 7 — Rate Limiting
**File:** `workers/audit-signup/rate-limit.js`  
D1-backed rate limiting — no KV namespace needed. Three independent counters per request:
- IP: 3 snapshots / 24h  
- Email: 2 snapshots / 24h  
- Domain: 1 snapshot / 24h  
Lazy expiry (prune on each check). Fails open if D1 is down.

### Commit 8 — Cheap Website Checks + Scoring
**File:** `workers/audit-signup/website-checker.js`  
10 checks, one homepage fetch, five HEAD calls. Scores 0–100:

| Check | Points |
|---|---|
| reachable | 15 |
| llms.txt | 15 |
| json_ld | 12 |
| agent-context.json | 12 |
| title_present | 10 |
| meta_description | 10 |
| robots_txt | 8 |
| sitemap.xml | 8 |
| sitemap-agent.xml | 8 |
| contact_detectable | 2 |

Bands: 🔴 0–29 Not AI-Visible · 🟠 30–54 Partially · 🟡 55–79 Mostly · 🟢 80–100 AI-Ready

### Commit 9 — Manual QA Checklist
**File:** `workers/audit-signup/docs/qa-checklist.md`  
10-section checklist with copy-paste `curl` commands. Covers: regression (audit-signup), snapshot happy path, validation errors, rate limiting, website checks, results page, GitHub issue, CORS, prompt quality.

### Commit 10 — Launch Readiness + Product Boundary
**Files:** `workers/audit-signup/docs/launch-readiness.md`, `workers/audit-signup/docs/product-boundary.md`  
- Launch gate: 10 sections, every item must be ✅ before CTA goes live  
- Product boundary: tier definitions, 5 hard enforcement rules, `audit_status` state machine documented

---

## What Was NOT Changed

- `POST /api/audit-signup` — **zero changes.** Existing intake handler is untouched.
- `wrangler.toml` — no new bindings added (rate limiting uses existing `DB`)
- `D1 schema` — existing tables untouched; migration is additive only

---

## Files in `workers/audit-signup/` After This Build

```
workers/audit-signup/
├── index.js                   ← router (audit-signup + visibility-snapshot + results)
├── visibility-snapshot.js     ← NEW: POST /api/visibility-snapshot handler
├── website-checker.js         ← NEW: 10 cheap checks + scoring
├── rate-limit.js              ← NEW: D1-backed rate limiting
├── prompt-generator.js        ← NEW: 5 Ideal Visibility Prompt templates
├── results-page.js            ← NEW: GET /results HTML renderer
├── wrangler.toml              ← unchanged
└── docs/
    ├── afo-funnel-roadmap-v1.md  ← NEW: strategy spec
    ├── migration-v2.sql          ← NEW: D1 migration (apply before deploy)
    ├── snapshot-form-spec.md     ← NEW: form fields + copy
    ├── qa-checklist.md           ← NEW: manual QA
    ├── launch-readiness.md       ← NEW: launch gate
    └── product-boundary.md       ← NEW: free vs paid rules
```

---

## Before Going Live — Required Steps

1. **Apply D1 migration** — run `docs/migration-v2.sql` against production `afo-v1` database
2. **Run QA checklist** — `docs/qa-checklist.md`, all items ✅
3. **Wire AFO website form** — point public form to Worker URL, add new fields
4. **Confirm Turnstile** — live site key, not dev SKIP mode
5. **Sign off launch readiness** — `docs/launch-readiness.md` fully checked
6. **Jared approves** — then Alice flips CTA live

---

## Open Questions for Brainstorm Review

1. **Results page CTA URL** — `results-page.js` has a hardcoded booking/contact URL placeholder. What URL should the "Book a Free Strategy Call" button link to?
2. **Snapshot confirmation email** — the snapshot endpoint saves to D1 but does not yet send a confirmation email to the user. Should this be added before launch or post-launch?
3. **Form host** — Will the snapshot form live on `agentfeedoptimization.com` directly, or on a separate landing page?
4. **Score display strategy** — Should a score of 0 (unreachable site) show an error message instead of the results page?
5. **AFO self-test** — Run `agentfeedoptimization.com` through the snapshot first. It should score high on AFO signals. If it doesn’t, fix the AFO site before launching the tool publicly.
