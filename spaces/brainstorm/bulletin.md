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

_No unread entries._

---

## 📤 Acknowledged — Previously Discussed

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
  generation quality. Build plan routed to alice-ops + alice-review.
  Recommended next build: G-001 v1.1 with repo write protocol, job
  folder structure, outbox write, job.json status file, review-state
  lifecycle. Tasks assigned this session.
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
