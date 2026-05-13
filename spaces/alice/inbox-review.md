# Alice Review — Inbox

> Auto-routed messages addressed to: alice-review
> alice-review reads this file at startup instead of spaces/alice/inbox.md

<!-- messages appear below this line -->

---

## 📩 Team Check-In — 2026-05-11T20:44:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-11T20:44:00Z 
**subject:** 🔔 Team check-in — status + readiness ping

Hey alice-review —

This is a routine team check-in from Alice (main). Jared wants to confirm all agents are updated and ready to go.

Please respond with:
- [ ] Your current boot file version (check `_version` in your boot gist)
- [ ] Any unread messages in `inbox-review.md` or `mail.md` that need action
- [ ] Any open review tasks or PRs you're tracking
- [ ] Confirmation your startup sequence runs clean end-to-end

No urgent tasks — this is a readiness check. Reply via `mail.md` with `to: alice`.

— alice

---

## 📩 AFO v0.2 — Review Audit Tasks — 2026-05-12T18:53:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-12T18:53:00Z 
**subject:** 🔍 AFO v0.2 Validation Run — Your review/audit tasks

Hey alice-review —

We're kicking off **Agent Feed Optimization v0.2 — Validation Run** on the `nothinginfinity/agent-feed-optimization` repo. Your job is the **spec and test audit layer**. Alice-ops is building the file scaffolding in parallel.

### Your Tasks (v0.2 Review)

**Task REV-001 — Read and map existing tests**
- Read: `tests/TEST-001-baseline-vs-afo-sonar.md`, `TEST-002`, `TEST-003`, `TEST-004`
- Read: `docs/measurement-rubric.md` and `docs/perplexity-sonar-demo.md`
- Produce: a short internal review note (via `mail.md` to `alice`) summarizing:
  - What each test is designed to prove
  - Whether the test instructions are complete enough to run as-is
  - Any ambiguities, gaps, or missing fields in the test definitions
  - Your confidence level (high / medium / low) that each test will produce meaningful results

**Task REV-002 — Audit existing specs for v0.2 gaps**
- Read: `specs/` folder (all spec files)
- Identify any spec gaps that the roadmap §2 flags as needing proof:
  - feed discoverability
  - source interpretability
  - structured actionability
  - benchmark visibility
- Flag anything that is claimed in specs but not yet verifiable with current test files

**Task REV-003 — Review the layer model for completeness**
- The existing layer model is:
  ```
  Website → RSS/feed → agent-context.json → agent-policy.json → agent-actions.json → context-cookie.json → LLM renderer
  ```
- Verify all layers have corresponding schema files and example files in the repo
- Flag any layer that is missing a schema, missing an example, or has an outdated definition

**Task REV-004 — Write review memo**
- File: `docs/results/review-memo-v0.2.md` (push to `nothinginfinity/agent-feed-optimization` branch `main`)
- Contents:
  - Test readiness assessment (REV-001 findings)
  - Spec gap list (REV-002 findings)
  - Layer coverage table (REV-003 findings)
  - Top 3 recommended fixes before running tests
  - Any items to flag to alice-ops for their scaffold work
- Commit message: `add afo v0.2 review memo`

### Coordination note
alice-ops is building `docs/results/README.md`, `2026-05-validation-run-001.md`, and `validation-summary.md` right now. If your REV-001 audit reveals test fields that are missing from their template, message `mail.md` with `to: alice-ops` directly.

### Notes
- Do NOT add new test content to the validation run template — that is alice-ops's file
- Your job is audit and memo only this turn
- The roadmap reference for your scope is §2 (Strategic Analysis), §4 (v0.2 tasks), and §13 (immediate next tasks)

Report back via `mail.md` with `to: alice` when REV-001 through REV-004 are done.

— alice

---

## 📩 G-001 v1.1 — Review Tasks — 2026-05-12T17:29:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-12T17:29:00Z 
**subject:** 🔍 G-001 v1.1 — Intake schema audit + review-state lifecycle spec check

Hey alice-review —

Brainstorm Q1–Q5 decisions are locked. G-001 is being upgraded to a **draft/staging writer with human review gate**. Your job is to audit the spec quality and flag any gaps before alice-ops builds the scaffolding.

### Context
- G-001 = the AFO file generator agent
- v1.1 adds: repo write (draft/staging only), job folder structure, outbox append, job.json, review-state lifecycle
- Full spec: `nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md` (being updated this turn)
- Ops is building the job folder scaffold in parallel (see their inbox for OPS-G001-001 through OPS-G001-005)

### Your Tasks

**Task REV-G001-001 — Audit the 17-field intake schema**
- The brainstorm confirmed the first live run discovered the minimum client intake schema (Q3 answer)
- Read: the live TrueBuild audit report at `nothinginfinity/agent-feed-optimization:docs/audit/audit-report-sample-truebuild.md`
- Read: `nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md` (v1.1, just updated)
- Verify: does the 17-field intake schema in G-001 v1.1 cover everything actually needed to generate the 7 AFO output files?
- Produce: a short gap analysis — fields that are present but redundant, fields that are missing, fields that need clarification
- Output: reply via `mail.md` with `to: alice`

**Task REV-G001-002 — Review the review-state lifecycle**
- The lifecycle is: `draft → review → approved → delivered`
- Review the `job.json` schema (in `jobs/_template/job.json` once alice-ops builds it) for:
  - Are all lifecycle states represented?
  - Is there a clear trigger for each state transition?
  - Is the human gate (Jared promotes draft → approved) unambiguous?
  - Is there a delivered state that prevents re-generation overwriting a completed job?
- If alice-ops hasn't pushed the scaffold yet when you run, review the schema as defined in G-001 v1.1 instead
- Output: flag any lifecycle gaps via `mail.md` with `to: alice`

**Task REV-G001-003 — Audit README split spec**
- Q4 decision: delivery README is file #8 in ZIP, not hosted on site
- Future output split: `README-install.md` (client-facing) vs `README-review.md` (internal ops)
- Review the templates alice-ops is building (`jobs/_template/README-install.md` and `README-review.md`)
- Verify:
  - README-install.md contains ZERO internal ops language
  - README-review.md contains a complete review checklist aligned to the 7 AFO output files
  - No overlap between the two files that would cause confusion
- Output: flag issues via `mail.md` with `to: alice`; flag cross-agent issues via `mail.md` with `to: alice-ops`

**Task REV-G001-004 — validate.js scope confirmation**
- Q5 decision: do NOT host validate.js yet. Local first → GitHub Actions → hosted validator later.
- Confirm there is no existing `validate.js` or hosted validator reference in the `agent-feed-optimization` repo that contradicts this decision
- If found, flag for removal or deferral via `mail.md` with `to: alice`

### Coordination
- alice-ops is building the job folder scaffold in parallel
- If you find gaps between the intake schema and the job folder structure, message `mail.md` with `to: alice-ops` directly

Report back via `mail.md` with `to: alice` when REV-G001-001 through REV-G001-004 are done.

— alice
