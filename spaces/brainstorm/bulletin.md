# Brainstorm Bulletin Board
_last-updated: 2026-05-14 | managed-by: alice_

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
id: BLT-016
from: alice
date: 2026-05-14
status: unread
priority: high
ref: nothinginfinity/repo-copilot:spaces/alice/handoff.md | nothinginfinity/parallel-internet-sites:docs/deployment-pack-v1.md | nothinginfinity/parallel-internet-sites:examples/truebuild/pages/comparisons.md
subject: Full project state handoff — parallel-internet-sites pre-launch hold, 3 gates open
body: >
  Jared requested a brainstorm review of current project state as of 2026-05-14.

  CURRENT STATE — parallel-internet-sites:
  - Status: 🟡 Pre-launch hold. Technically complete. Waiting on Jared action only.
  - All 5 phases complete.
  - Deployment Pack v1 live at docs/deployment-pack-v1.md.
  - comparisons.md claim audit complete — EDIT-1 and EDIT-2 applied, page cleared for launch.
  - ai.nothinginfinity.com (AFO demo): no open tasks, DNS pending only.
  - ai.truebuild.com: 3 hard gates blocking (all Jared action required):
      Gate 1: ai.truebuild.com DNS — create and point
      Gate 2: Form action URL wired into contact.html
      Gate 3: Jared content approval on all rendered pages

  CURRENT STATE — repo-copilot:
  - Status: 🟢 Stable. Phase 3 complete. No open tasks.
  - Inbox architecture live. Handoff system live (G-000 v1.9, G-005 v1.3).

  OPEN QUESTIONS FOR BRAINSTORM:
  Q1: Given that all 3 gates are Jared actions (DNS, form URL, content approval) —
      is there any prep work Alice or sub-agents should be doing in parallel
      while Jared closes those gates?
  Q2: Is the Deployment Pack v1 the right abstraction for future clients,
      or should Alice begin scaffolding a Phase 6 automation layer now?
  Q3: Are there any risks or blind spots in the current pre-launch state
      that Alice hasn't surfaced yet?
  Q4: What is the recommended sequencing once Jared closes the gates —
      deploy nothinginfinity demo first, TrueBuild first, or simultaneously?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-015
from: alice
date: 2026-05-13
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:jobs/truebuild-2026-05-13/job.json | nothinginfinity/agent-feed-optimization:jobs/truebuild-2026-05-13/README-review.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md
subject: First AFO delivery complete — TrueBuild approved, ZIP reviewed, ready for next steps
body: >
  MILESTONE: G-001 v1.1 first controlled demo job is done.

  WHAT HAPPENED THIS SESSION:
  - BLT-014 analysis was received and fully actioned
  - alice-ops ran PATCH-001 through PATCH-006 on agent-feed-optimization
  - alice-review ran full post-patch audit — all clear
  - G-001 generated the TrueBuild demo job (10 files, job ID: truebuild-2026-05-13)
  - Full review ran against all 4 checklist sections — zero flags
  - job.json promoted to status: approved (2026-05-13T09:33:00Z)
  - Client ZIP prepared and reviewed by Jared on his phone
  - Jared's verdict: "It's incredible. Very solid product and it makes sense."

  CURRENT STATE:
  - job.json status: approved (not yet delivered)
  - Files are NOT yet installed on info.truebuild.com
  - outbox.md has its first live entry
  - G-001 v1.1 is fully operational

  OPEN QUESTIONS FOR BRAINSTORM:
  Q1: What is the recommended next step — install TrueBuild files now, or do a second
      demo job first to validate the generator is repeatable before any live install?
  Q2: Is TrueBuild the right first live install, or should we use a test domain first?
  Q3: What does the "deliver" workflow look like end-to-end — who installs, how do we
      confirm 0-to-score-lift, and how do we document the before/after proof?
  Q4: Now that G-001 v1.1 is working, what is the next product layer — G-002 (monitor),
      the audit-to-generate pipeline, or pricing/packaging for real clients?
  Q5: The ZIP is 8.7KB for 10 files. Should we add a cover page or one-pager to the
      package to make it feel more like a premium deliverable at handoff?
```

---

```yaml
id: BLT-014
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/agent-feed-optimization:jobs/_template/job.json | nothinginfinity/agent-feed-optimization:jobs/README.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/mail.md
subject: Session recap + project analysis request — what's where, what's next, path to live testing
body: >
  Acknowledged 2026-05-13. All patches complete, demo job generated and approved.
  See BLT-015.
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
