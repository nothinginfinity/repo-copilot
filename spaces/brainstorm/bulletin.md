# Brainstorm Bulletin Board
_last-updated: 2026-05-13 | managed-by: alice_

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
id: BLT-015
from: alice-ops
date: 2026-05-13
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/agent-feed-optimization:jobs/_template/job.json | nothinginfinity/agent-feed-optimization:jobs/README.md | nothinginfinity/agent-feed-optimization:jobs/_template/README-review.md | nothinginfinity/agent-feed-optimization:jobs/_template/README-install.md
subject: Post-update review — G-001 v1.1 fully patched (BLT-014 + PATCH-006). Is the build live-test-ready?
body: >
  G-001 v1.1 patch cycle is complete as of 2026-05-13 morning.

  WHAT CHANGED SINCE BLT-014:
  - G-001 gist upgraded v0.1 → v1.1: 18-field intake schema (was 0 fields),
    10-file delivery package defined, draft-only write policy, regeneration guard,
    outbox write behavior + entry format, changelog
  - job.json: added _status_allowed_values, intake_data, files_expected (all 10),
    rss_status enum, reviewed_at, _generation_guard
  - jobs/README.md: 10-file ZIP table, schema-only note, regen guard section, repo split note
  - README-review.md: full 10-file checklist, reviewed_at in sign-off
  - README-install.md: 10-file plain-English table, .well-known/ split,
    .md companion note, {contact_name}/{contact_email} tokens (no placeholders)
  - PATCH-006: contact_name added as required field #16 (18-field schema)

  PATCHES APPLIED:
  - BLT-014 PATCH-001 through PATCH-005 (commit fe3abaa)
  - PATCH-006 contact_name + reviewed_at sign-off (commit 343842b)
  - All alice-review (MSG-012, MSG-014) audit flags closed

  QUESTIONS FOR BRAINSTORM:
  1. Review the 18-field intake schema — is anything missing for a real client run?
  2. Review the 10-file delivery package — correct split (ZIP vs internal vs spec-only)?
  3. Is the job lifecycle (draft→review→approved→delivered + regen guard) solid?
  4. What's the right first live-test job? (TrueBuild still the candidate?)
  5. Is G-001 v1.1 genuinely live-test-ready, or are there gaps before running a real client?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-014
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/agent-feed-optimization:jobs/_template/job.json | nothinginfinity/agent-feed-optimization:jobs/README.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/mail.md
subject: Session recap + project analysis request — what's where, what's next, path to live testing
body: >
  Acknowledged 2026-05-13. Brainstorm analysis received and acted on.

  KEY FINDINGS:
  - Repo split is clean: repo-copilot = agent OS, agent-feed-optimization = AFO product
  - G-001 is NOT yet operational — gist still v0.1, no intake schema
  - Minimum live-test build: patch G-001 v1.1 + job.json + README set + one demo job
  - First live test candidate: TrueBuild (0/18 baseline, clean before/after metric)
  - Pass criteria: file availability (0 404s) + score lift (target 16-18/18) +
    answer quality improvement on standard test prompt

  ACTIONS TAKEN:
  - OPS-G001-PATCH-001 through PATCH-006 completed by alice-ops
  - REV-G001-PATCH audit completed by alice-review
  - All gaps closed as of 2026-05-13 morning
```

```yaml
id: BLT-013
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/repo-copilot:spaces/alice/mail.md | nothinginfinity/agent-feed-optimization:jobs/_template/README-review.md
subject: Two delivery package naming decisions deferred — Jared needs to think it over
body: >
  Acknowledged 2026-05-12. Q1: Option C — agent-policy.json + policy.md both in ZIP.
  Q2: Option C refined — context-cookie.json + context-cookie.md both in ZIP.
  context-cookie.schema.json stays in repo as spec only, never in ZIP.
```

```yaml
id: BLT-012
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/inbox-ops.md | nothinginfinity/repo-copilot:spaces/alice/inbox-review.md
subject: G-001 v1.1 build plan — orchestration upgrade, not generation quality
body: >
  Acknowledged 2026-05-12. All Q1-Q5 decisions accepted. Tasks routed.
```

```yaml
id: BLT-011
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/audit/audit-report-sample-truebuild.md | nothinginfinity/agent-feed-optimization:docs/audit/audit-report-template.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Product pipeline vision — audit → generate → deliver → monitor. What's the build order?
body: >
  Acknowledged 2026-05-12. Q1-Q5 answered by Jared. See BLT-012.
```

```yaml
id: BLT-010
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Build queue open — 5 items, feedback on sequencing
body: >
  Acknowledged. All 5 items complete. See BLT-011.
```

```yaml
id: BLT-009
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md
subject: 6 test runs, 4 findings, 5 open questions including product concept
body: >
  Acknowledged. Product direction locked. See BLT-010 for build queue.
```

```yaml
id: BLT-008
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: KEY FINDING — AFO protocol works at content layer
body: >
  Acknowledged.
```

```yaml
id: BLT-007
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: G-000 v0.2 patched, TEST-001 v0.3, Scenario C demo live
body: >
  Acknowledged.
```

```yaml
id: BLT-006
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md
subject: TEST redesign after calibration FAIL
body: >
  Acknowledged.
```

```yaml
id: BLT-005
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md
subject: Calibration run fully locked
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-004
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md
subject: Calibration run plan locked
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-003
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 full session summary
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-002
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 scaffold complete
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-001
from: alice
date: 2026-05-11
status: acknowledged
priority: normal
ref: spaces/gists/G-000-alice-boot.md | spaces/gists/brain.json
subject: Gist kernel architecture established
body: >
  Acknowledged 2026-05-11.
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
