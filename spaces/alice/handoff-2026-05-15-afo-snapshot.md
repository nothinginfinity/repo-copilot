# Handoff — AFO Visibility Snapshot Build
**Date:** 2026-05-15  
**Session:** AFO funnel strategy + 10-commit implementation + Brainstorm Q&A  
**Repo:** `nothinginfinity/parallel-internet-sites`  
**Branch:** `main`  
**Status:** ✅ All 10 commits complete. All 5 open questions resolved. Ready for implementation.

---

## What Was Decided (Strategy)

- **AFO is Customer #1.** TrueBuild is demo/sample data only unless they opt in.
- **Free CTA is NOT a full audit.** It is a lightweight **AFO Visibility Snapshot** — a self-test tool that shows whether a business appears in LLM chat for ideal prompts.
- **Full audits are manual, paid, or call-gated.** No automated audit fulfillment in any free flow.
- **No LLM API calls in the free flow.** All checks are cheap HTTP fetches only.

---

## Brainstorm Decisions — All 5 Questions Resolved

### Q1 ✔️ CTA URL
**Decision:** Use `https://agentfeedoptimization.com/start?source=snapshot-results`  
**Note:** If `/start` does not exist yet, create it as the dedicated free snapshot / strategy-call landing route.

### Q2 ✔️ Confirmation Email
**Decision:** Post-launch. Do not block v1 on confirmation email.  
**Rationale:** Validate snapshot funnel, D1 storage, Turnstile, rate limiting, results page, and CTA conversion first.

### Q3 ✔️ Form Host
**Decision:** Host the form directly on `agentfeedoptimization.com/start`.  
**Rationale:** No separate landing page for v1.

### Q4 ✔️ Score = 0 (Unreachable Site)
**Decision:** Show a dedicated **unreachable-site error screen**, not a normal all-red results page.  
**Behavior:** Store `score=0` internally. Show "we could not reach your site" message + retry button + strategy-call CTA.

### Q5 ✔️ AFO Self-Test
**Decision:** **Required before public launch.** Run `agentfeedoptimization.com` through the snapshot and fix any missing AFO signals before flipping the CTA live.

---

## What Was Built — 10 Commits

### Commit 1 — Roadmap/Spec
**File:** `docs/afo-funnel-roadmap-v1.md`  
Full strategy spec. Source of truth for this build.

### Commit 2 — D1 Migration Plan
**File:** `docs/migration-v2.sql`  
Additive SQL. Adds `visibility_snapshots` table + new columns to `customers`. Existing tables untouched.

### Commit 3 — UI Copy + Form Fields
**File:** `docs/snapshot-form-spec.md`  
CTA copy + required fields: `business_category`, `city_or_service_area`, `top_services`. Optional: `ideal_customer`, `requested_full_audit`.

### Commit 4 — `/api/visibility-snapshot` Route Stub
**File:** `workers/audit-signup/visibility-snapshot.js`  
Validation, Turnstile, rate limiting, field collection.

### Commit 5 — Prompt Generator
**File:** `workers/audit-signup/prompt-generator.js`  
5 deterministic Ideal Visibility Prompts. No LLM calls.

### Commit 6 — Results Page
**File:** `workers/audit-signup/results-page.js`  
`GET /results`: animated SVG score ring, 10 check rows, 5 prompt cards, copy-to-clipboard, platform badges, CTA.  
**CTA URL resolved:** `https://agentfeedoptimization.com/start?source=snapshot-results`  
**Unreachable-site screen:** dedicated error view (score=0), not all-red results.

### Commit 7 — Rate Limiting
**File:** `workers/audit-signup/rate-limit.js`  
D1-backed. IP: 3/24h · Email: 2/24h · Domain: 1/24h. Fails open.

### Commit 8 — Cheap Website Checks + Scoring
**File:** `workers/audit-signup/website-checker.js`  
10 checks, 0–100 score, 4 bands:

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
10-section checklist with curl commands.

### Commit 10 — Launch Readiness + Product Boundary
**Files:** `workers/audit-signup/docs/launch-readiness.md`, `workers/audit-signup/docs/product-boundary.md`

---

## What Was NOT Changed

- `POST /api/audit-signup` — **zero changes.**
- `wrangler.toml` — no new bindings
- Existing D1 tables — migration is additive only

---

## Files in `workers/audit-signup/` After This Build

```
workers/audit-signup/
├── index.js
├── visibility-snapshot.js
├── website-checker.js
├── rate-limit.js
├── prompt-generator.js
├── results-page.js
├── wrangler.toml
└── docs/
    ├── afo-funnel-roadmap-v1.md
    ├── migration-v2.sql
    ├── snapshot-form-spec.md
    ├── qa-checklist.md
    ├── launch-readiness.md
    └── product-boundary.md
```

---

## Before Going Live — Required Steps

1. **Apply D1 migration** — `docs/migration-v2.sql` against production `afo-v1` DB
2. **Update `results-page.js`** — wire CTA to `https://agentfeedoptimization.com/start?source=snapshot-results`
3. **Update `results-page.js`** — add unreachable-site error screen (score=0 path)
4. **Build `/start` page** on `agentfeedoptimization.com` if it does not exist
5. **Run QA checklist** — `docs/qa-checklist.md`, all items ✅
6. **AFO self-test** — run `agentfeedoptimization.com` through snapshot, fix any gaps
7. **Confirm Turnstile live key**
8. **Sign off launch readiness** — Jared approves `docs/launch-readiness.md`
9. **Flip CTA live**

---

## Deferred to Post-Launch

- Snapshot confirmation email to user
- Admin dashboard for snapshot results
- Automated AFO signal monitoring
