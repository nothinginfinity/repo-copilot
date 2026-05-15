# Brainstorm Bulletin Board
_last-updated: 2026-05-15 | managed-by: alice_

---

## Overview

This file is the **read-only messaging surface for the Brainstorm agent** (ChatGPT / G-001). Alice and other agents write here to surface context, flag decisions, and queue thinking prompts. The brainstorm agent reads this on boot and uses it to orient the session.

**Write rules (for Alice/Bob/Charlie):**
- Append new entries at the top under the relevant section
- Never delete entries — mark them `status: acknowledged` instead
- Keep entries short — this is a bulletin, not a spec
- Use `ref:` to point to related files using **full repo paths** — never bare filenames, never inline descriptions
- Format: YAML-style frontmatter block (see Message Format Reference below)

**Read rules (for Brainstorm agent):**
- Read this file as boot step 9
- Scan for `status: unread` entries — these are fresh context
- Prioritize `priority: blocking` > `high` > `normal` > `low`
- Flag all `status: unread` entries in your boot summary, sorted by priority
- Use `ref:` paths to lazy-load the files most relevant to the discussion
- After discussing an entry, note it verbally as acknowledged (you cannot write back — tell Jared to ask Alice to mark it)

---

## 📥 Incoming — For Brainstorm Review

```yaml
id: BLT-020
from: alice
date: 2026-05-15
status: unread
priority: high
ref: nothinginfinity/repo-copilot:spaces/alice/handoff-2026-05-15-afo-snapshot.md | nothinginfinity/parallel-internet-sites:workers/audit-signup/visibility-snapshot.js | nothinginfinity/parallel-internet-sites:workers/audit-signup/docs/afo-funnel-roadmap-v1.md | nothinginfinity/parallel-internet-sites:workers/audit-signup/docs/migration-v2.sql | nothinginfinity/parallel-internet-sites:workers/audit-signup/docs/launch-readiness.md | nothinginfinity/parallel-internet-sites:workers/audit-signup/docs/product-boundary.md
subject: AFO Visibility Snapshot — 10-commit build complete, 5 open questions for Brainstorm
body: >
  WHAT WAS BUILT (today, 2026-05-15):
  Strategy correction: AFO is Customer #1. TrueBuild = demo only.
  Free CTA renamed from "Start Free Audit" to "Get Your Free AFO Visibility Snapshot."
  Full audit is manual/paid/call-gated. No LLM calls in free flow.

  10 commits shipped to nothinginfinity/parallel-internet-sites:
  1. Strategy spec (afo-funnel-roadmap-v1.md)
  2. D1 migration SQL — additive, existing tables untouched
  3. Form field + copy spec
  4. POST /api/visibility-snapshot route stub
  5. Prompt generator — 5 Ideal Visibility Prompts, deterministic
  6. GET /results results page — score ring, check rows, prompt cards
  7. D1-backed rate limiting (IP/email/domain, no KV)
  8. 10 cheap website checks + 0–100 scoring (4 bands)
  9. Manual QA checklist
  10. Launch readiness gate + product boundary doc

  POST /api/audit-signup is UNCHANGED. Zero regression risk.

  OPEN QUESTIONS FOR BRAINSTORM:
  Q1: What URL for the "Book a Free Strategy Call" CTA on the results page?
  Q2: Should snapshot submission send a confirmation email to the user before launch?
  Q3: Will the snapshot form live on agentfeedoptimization.com or a separate landing page?
  Q4: Score = 0 (unreachable site) — show all-red results page or dedicated error screen?
  Q5: Should we run agentfeedoptimization.com through the snapshot first and fix any
      gaps before going public? (Strongly recommended.)

  REQUIRED BEFORE GO-LIVE:
  - Apply migration-v2.sql to production D1
  - Run qa-checklist.md (all items green)
  - Wire AFO website form to Worker URL + add new fields
  - Confirm Turnstile live key
  - Jared signs off on launch-readiness.md
```

---

```yaml
id: BLT-019
from: alice
date: 2026-05-14
status: unread
priority: blocking
ref: nothinginfinity/repo-copilot:spaces/alice/handoff.md | nothinginfinity/parallel-internet-sites:.github/workflows/deploy-audit-signup.yml | nothinginfinity/parallel-internet-sites:workers/audit-signup/wrangler.toml
subject: afo-audit-signup Worker deploy blocked — Cloudflare auth error code 10000
body: >
  13 failed GitHub Actions runs deploying the afo-audit-signup Cloudflare Worker.
  Three bugs fixed (missing package.json, [[routes]] block, --log-level flag).
  Current blocker: Authentication error [code: 10000] on Cloudflare API.

  Current auth setup: apiToken (Global API Key) + apiEmail + accountId in wrangler-action@v3.
  Suspected cause: apiEmail field conflicting with scoped token auth OR Global API Key
  value not correctly saved in GitHub Secrets.

  RECOMMENDED FIX:
  1. Create fresh scoped token: Workers Scripts (Edit) + D1 (Edit) + Account Settings (Read),
     all at Account scope.
  2. Update CLOUDFLARE_API_TOKEN secret with new value.
  3. Remove apiEmail from workflow (only for Global Key).
  4. Re-run workflow.

  Full debug state in handoff.md. Worker code and D1 config are correct — auth only.
```

---

```yaml
id: BLT-018
from: alice
date: 2026-05-14
status: unread
priority: high
ref: nothinginfinity/parallel-internet-sites:workers/audit-signup/index.js | nothinginfinity/parallel-internet-sites:workers/audit-signup/migrations/0001_initial.sql | nothinginfinity/parallel-internet-sites:templates/site/pages/start.html | nothinginfinity/parallel-internet-sites:docs/afo-v1-launch-checklist.md | nothinginfinity/parallel-internet-sites:templates/intake/client-intake.afo.json
subject: AFO v1 real signup flow built — Worker, D1, /start page, checklist all live
body: >
  WHAT WAS BUILT:
  - Cloudflare Worker (workers/audit-signup/index.js): POST /api/audit-signup
    Validates fields, normalizes URL, verifies Turnstile, accepts AFO-FOUNDER / AFO-DOGFOOD
    coupons, upserts customer + audit_request in D1, logs coupon redemption,
    sends confirmation + admin emails (Resend/SendGrid/log), creates GitHub Issue
    in agent-feed-optimization repo.
  - D1 schema (migrations/0001_initial.sql): customers, audit_requests, coupon_redemptions.
  - wrangler.toml: D1 binding + routes. No secrets hardcoded. 5 secrets via wrangler secret put.
  - start.html: Real /start page. Name, email, business, URL, role (opt), coupon (opt),
    consent checkbox, Turnstile widget, JS fetch submit with field-level error display.
  - thanks.html: /thanks confirmation page.
  - contact.html.patch.md: SERVICES_LIST bug documented + 2 fix paths (generator token vs static).
  - templates/intake/client-intake.afo.json: AFO Customer #1 intake. Fill in 3 REPLACE_ values.
  - docs/afo-v1-launch-checklist.md: 7-phase checklist. Phase 4 = baseline (CRITICAL gating step).

  OPEN GATES (Jared):
  1. Fill REPLACE_ values in client-intake.afo.json (email x2, Turnstile site key)
  2. Create D1 + run migration + update wrangler.toml with database_id
  3. Create Turnstile keys
  4. Set 5 wrangler secrets
  5. Create fine-grained GitHub PAT (Issues r/w only)
  6. Run baseline LLM test BEFORE deploying any AFO files

  QUESTIONS FOR NEXT BRAINSTORM SESSION:
  Q1: Should we add a simple admin dashboard (Cloudflare Pages + D1 query) to view
      audit_requests, or is wrangler d1 execute sufficient for v1?
  Q2: The GitHub issue bridge creates issues in agent-feed-optimization. Should Alice
      have a recurring task to sweep new issues and convert approved ones to job.json?
  Q3: contact.html SERVICES_LIST bug — do we fix the generator (Option A) or remove
      the select from the generic template entirely (Option B)?
  Q4: Should /start be a standalone page or replace /pages/contact.html for AFO?
```

---

```yaml
id: BLT-017
from: alice
date: 2026-05-14
status: acknowledged
priority: high
ref: nothinginfinity/parallel-internet-sites:docs/launch-plan-v2.md | nothinginfinity/parallel-internet-sites:docs/afo-customer-1-runbook.md | nothinginfinity/parallel-internet-sites:docs/llm-baseline-template.md | nothinginfinity/parallel-internet-sites:docs/monitoring/day-0-deploy.md
subject: Launch pivot executed — AFO is Customer #1, full runbook + monitoring templates live
body: >
  Acknowledged 2026-05-14. Implementation followed. See BLT-018.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-016
from: alice
date: 2026-05-14
status: acknowledged
priority: high
ref: nothinginfinity/repo-copilot:spaces/alice/handoff.md | nothinginfinity/parallel-internet-sites:docs/deployment-pack-v1.md | nothinginfinity/parallel-internet-sites:examples/truebuild/pages/comparisons.md
subject: Full project state handoff — parallel-internet-sites pre-launch hold, 3 gates open
body: >
  Acknowledged 2026-05-14. Brainstorm session led to AFO-first pivot. See BLT-017.
```

```yaml
id: BLT-015
from: alice
date: 2026-05-13
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:jobs/truebuild-2026-05-13/job.json | nothinginfinity/agent-feed-optimization:jobs/truebuild-2026-05-13/README-review.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md
subject: First AFO delivery complete — TrueBuild approved, ZIP reviewed, ready for next steps
body: >
  Acknowledged 2026-05-13. All patches complete, demo job generated and approved.
  AFO-first pivot applied in BLT-017.
```

```yaml
id: BLT-014
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/agent-feed-optimization:jobs/_template/job.json | nothinginfinity/agent-feed-optimization:jobs/README.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/mail.md
subject: Session recap + project analysis request
body: >
  Acknowledged 2026-05-13.
```

```yaml
id: BLT-013
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/repo-copilot:spaces/alice/mail.md | nothinginfinity/agent-feed-optimization:jobs/_template/README-review.md
subject: Two delivery package naming decisions deferred
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-012
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/inbox-ops.md | nothinginfinity/repo-copilot:spaces/alice/inbox-review.md
subject: G-001 v1.1 build plan
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-011
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/audit/audit-report-sample-truebuild.md | nothinginfinity/agent-feed-optimization:docs/audit/audit-report-template.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Product pipeline vision
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-010
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Build queue open — 5 items
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-009
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md
subject: 6 test runs, 4 findings, 5 open questions
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-008 through BLT-001
from: alice
date: 2026-05-11 to 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: Earlier session entries — all acknowledged
body: >
  All prior BLTs acknowledged. See BLT-009+ for active thread.
```

---

## Message Format Reference

```yaml
id: BLT-XXX
from: alice
date: YYYY-MM-DD
status: unread
priority: normal
ref: owner/repo:path/to/file | owner/repo:path/to/other
subject: short title
body: >
  Multi-line body. Keep it under 10 lines.

# Priority guide:
# blocking = needs immediate attention before any analysis
# high     = should address this session
# normal   = useful brainstorm prompt, no urgency
# low      = FYI / background context
```
