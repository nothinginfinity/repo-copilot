# Alice Handoff — AFO Site Architecture Confirmed
**Date:** 2026-05-15  
**Session:** Evening — architecture discovery + roadmap review  
**Repo:** `nothinginfinity/parallel-internet-sites`  
**Status:** 🔴 Blocked — `/start` page not yet wired. Go-live cannot happen without it.

---

## What Was Confirmed This Session

### Architecture (critical — was previously unclear)
- `agentfeedoptimization.com` is served by a **Cloudflare Worker** named `afo-site`
- Worker URL: `afo-site.jaredtechfit.workers.dev`
- Custom domain: `agentfeedoptimization.com` (DNS routed through Cloudflare)
- There is **no separate Cloudflare Pages project** for the AFO website
- There is **no separate repo** for the AFO website HTML
- The Worker source lives in `nothinginfinity/parallel-internet-sites`
- The Worker serves the homepage HTML directly from its own handler
- The `start.html` template in this repo IS the `/start` page — it is not yet wired as a route

### What the live homepage currently shows
- Hero: "Make your website readable to AI."
- Sections: What AFO Does → The Problem → The AFO Package → TrueBuild case study → CTA
- **TrueBuild is still presented as a real case study** — NOT yet marked as demo/sample data
- **The CTA "Find out your AI Visibility Score" has no working button/link** — `/start` does not exist as a live route
- 146 unique visitors recorded in the last 24 hours (14 May – 15 May) per Cloudflare analytics

### Strategy decisions (from brainstorm session + roadmap)
- AFO = Customer #1 / dogfood launch target
- TrueBuild = demo/sample data only unless they opt in
- Free CTA = **AFO Visibility Snapshot** (not a full audit)
- Full audit = manual / paid / call-gated
- CTA destination URL = `agentfeedoptimization.com/start?source=snapshot-results`
- Form lives at `/start` — no separate page, Worker handles the route

---

## Current Build State

### ✅ Complete (10/10 commits)
| Commit | What | Status |
|--------|------|--------|
| 1 | `docs/afo-funnel-roadmap-v1.md` — strategy spec | ✅ |
| 2 | `docs/migration-v2.sql` — D1 schema migration plan | ✅ |
| 3 | `workers/afo-site/start.html` — form UI template | ✅ |
| 4 | `workers/afo-site/snapshot-endpoint.js` — POST /api/visibility-snapshot | ✅ |
| 5 | `workers/afo-site/prompt-generator.js` — 5 ideal visibility prompts | ✅ |
| 6 | `workers/afo-site/results-page.js` — score ring + check rows + prompt cards | ✅ |
| 7 | `workers/afo-site/rate-limit.js` — D1-backed rate limiting | ✅ |
| 8 | `docs/product-boundary.md` — free vs paid tier definitions | ✅ |
| 9 | `docs/qa-checklist.md` — manual QA checklist | ✅ |
| 10 | `docs/launch-readiness.md` — go-live gate | ✅ |

### 🔴 Not Yet Done (blocking go-live)
1. **Wire `/start` route in the Worker** — `start.html` exists as a template but is not a live route in the Worker handler
2. **Inject `{{TURNSTILE_SITE_KEY}}`** into `start.html` at serve time using the `TURNSTILE_SITE_KEY` secret
3. **Wire CTA URL** in `results-page.js` → `agentfeedoptimization.com/start?source=snapshot-results`
4. **Unreachable-site error screen** in `results-page.js` — score=0 shows dedicated error, not all-red results
5. **Apply `docs/migration-v2.sql`** to production D1 database
6. **Run `docs/qa-checklist.md`** — all items must be ✅
7. **Mark TrueBuild as demo** in homepage copy
8. **AFO self-test gate** — run agentfeedoptimization.com through the snapshot before public launch

---

## Open Questions (Brainstorm answers needed)
1. "Book a Free Strategy Call" button URL on results page — what calendar/booking link?
2. Snapshot confirmation email to user — yes/no? (deferred post-launch per brain)
3. Score = 0 / unreachable site — dedicated error screen confirmed, but what copy?
4. AFO self-test: run the snapshot on agentfeedoptimization.com before launch — who runs it, Jared or Alice?

---

## Next Actions for New Instance

**Read in order:**
1. `spaces/gists/G-000-alice-boot.md`
2. `spaces/gists/brain.json`
3. `spaces/alice/inbox.md`
4. This file: `spaces/alice/handoff-2026-05-15-afo-site-architecture.md`
5. `workers/afo-site/index.js` — understand current Worker route structure
6. `workers/afo-site/start.html` — confirm template vars
7. `workers/afo-site/results-page.js` — confirm CTA URL placeholder

**First commit to execute:**
Wire `/start` route in Worker + inject Turnstile key + wire CTA URL + add unreachable-site error screen.
All in one safe commit. Zero changes to `POST /api/audit-signup`.
