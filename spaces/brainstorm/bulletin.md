# Brainstorm Bulletin Board
_last-updated: 2026-05-12 | managed-by: alice_

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
id: BLT-014
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md | nothinginfinity/agent-feed-optimization:jobs/_template/job.json | nothinginfinity/agent-feed-optimization:jobs/README.md | nothinginfinity/repo-copilot:spaces/generator/outbox.md | nothinginfinity/repo-copilot:spaces/alice/mail.md
subject: Session recap + project analysis request — what’s where, what’s next, path to live testing
body: >
  SESSION RECAP — 2026-05-12 evening:

  1. BLT-012 decisions accepted (Q1–Q5 locked).
     G-001 v1.1 build plan routed to alice-ops + alice-review.

  2. alice-ops delivered job folder scaffold to agent-feed-optimization:
     jobs/README.md, jobs/_template/job.json, README-review.md,
     README-install.md. Committed in one bundle.

  3. alice-review completed REV-G001-001 through REV-G001-004.
     Findings: G-001 gist still at v0.1 (17-field intake schema not
     pushed), job.json missing 5 fields, 2 naming inconsistencies.

  4. BLT-013 naming decisions locked by Jared:
     Q1: deliver BOTH agent-policy.json (canonical) + policy.md
         (explanatory).
     Q2: deliver BOTH context-cookie.json (client payload) +
         context-cookie.md (explanatory). context-cookie.schema.json
         stays in repo as spec only — never in client ZIP.
     Canonical delivery ZIP is now 10 files.

  5. alice-ops patch tasks queued (inbox-ops.md):
     5 job.json fixes + naming corrections to README-review.md and
     jobs/README.md. Not yet executed — awaiting next alice-ops session.

  OPEN ITEM — still not done:
     G-001 gist is still v0.1. The 17-field intake schema has not been
     pushed to agent-feed-optimization:gists/G-001-afo-agent-identity.md.
     This is a prerequisite before G-001 can function as a draft writer.

  ---

  ANALYSIS REQUEST FROM JARED:

  Jared wants a structured analysis this session. Key questions:

  A. WHAT’S WHERE — clarify the repo split:
     - What belongs in repo-copilot vs agent-feed-optimization?
     - Is the current split clean or should anything move?
     - Where do client job folders live long-term? In
       agent-feed-optimization, or a separate client-jobs repo?
       (This was BLT-012 open question Q-B — still unresolved.)

  B. PROJECT STATE — honest assessment:
     - What is actually built and working end-to-end?
     - What is scaffolded but not yet wired together?
     - What is still missing before G-001 can run a real job on a
       real client website without Jared doing manual assembly?

  C. PATH TO LIVE TESTING:
     - What is the minimum build needed to test on a real website?
     - Which real websites are candidates? (TrueBuild is the obvious
       first — but what else?)
     - What does a successful live test look like? What would we
       measure, and what would ‘pass’ mean?

  D. RECOMMENDED NEXT BUILD:
     - Given everything above, what should alice-ops and alice-review
       work on next?
     - Is the G-001 gist v1.1 update the right first move, or is
       there something more valuable to unblock first?

  Load the ref files above as needed. Start with your honest read
  of where the project stands before making recommendations.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-013
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/repo-copilot:spaces/alice/mail.md | nothinginfinity/agent-feed-optimization:jobs/_template/README-review.md
subject: Two delivery package naming decisions deferred — Jared needs to think it over
body: >
  Acknowledged 2026-05-12. Jared decided:
  Q1: Option C — deliver both agent-policy.json (canonical) + policy.md (explanatory).
  Q2: Option C refined — deliver context-cookie.json (client payload) +
  context-cookie.md (explanatory). context-cookie.schema.json stays in repo
  as spec only, never in ZIP.
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
  Acknowledged 2026-05-12. Brainstorm accepted all Q1-Q5 decisions.
  Assessment: G-001 first live output proves generator produces useful
  client-facing delivery material. Next upgrade is orchestration, not
  generation quality. Build order confirmed. Tasks assigned this session.
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
