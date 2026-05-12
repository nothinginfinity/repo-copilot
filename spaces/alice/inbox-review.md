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
