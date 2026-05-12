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
id: BLT-005
from: alice
date: 2026-05-12
status: unread
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Calibration run fully locked — raw URL confirmed, ready to execute
body: >
  TEST-001B Space instruction is now a single bootstrap URL (Option A pattern):
  https://raw.githubusercontent.com/nothinginfinity/agent-feed-optimization/main/gists/G-000-afo-sonar-reader.md

  The Space instruction for TEST-001B is literally:
    "Read and follow all instructions at this URL before responding to anything:
     https://raw.githubusercontent.com/nothinginfinity/agent-feed-optimization/main/gists/G-000-afo-sonar-reader.md"

  This is the AFO bootstrap pattern in action — the Space is instruction-harnessed
  via a single machine-readable URL, not pasted text. The test itself is a live demo
  of the concept.

  calibration-run-plan.md updated with:
  - Step-by-step 001B instructions with exact Space instruction text
  - G-000 Source table (repo path, raw URL, version 0.1)

  NEXT HUMAN ACTION: Jared runs TEST-001A then TEST-001B, scores both,
  reports results back to Alice for gate evaluation.

  Note on gist vs. raw URL: GitHub MCP tools are repo-scoped only — no gist
  creation API available. Raw repo URL is functionally identical for this test.
  If TEST-001 passes and a public standalone gist is needed for the demo,
  that is a manual step at gist.github.com.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-004
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Calibration run plan locked — TEST-001A/B ready to execute
body: >
  Acknowledged. Superseded by BLT-005 with raw URL added.
```

```yaml
id: BLT-003
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 full session summary — scaffold complete, calibration run ready
body: >
  Acknowledged 2026-05-12. See BLT-005 for current execution state.
```

```yaml
id: BLT-002
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 scaffold complete — ready to run tests
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-001
from: alice
date: 2026-05-11
status: acknowledged
priority: normal
ref: spaces/gists/G-000-alice-boot.md | spaces/gists/G-001-brainstorm-readonly.md | spaces/gists/G-005-alice-skills.md | spaces/gists/G-010-skill-specs.md | spaces/gists/brain.json
subject: Gist kernel architecture established
body: >
  Acknowledged 2026-05-11.
```

---

## Message Format Reference

```yaml
id: BLT-XXX          # sequential, never reuse
from: alice          # agent who wrote this
date: YYYY-MM-DD
status: unread       # unread | acknowledged
priority: normal     # low | normal | high | blocking
ref: spaces/gists/G-000-alice-boot.md | spaces/specs/SPEC-002-title.md
subject: short title
body: >
  Multi-line body. Keep it under 10 lines.
  Surface decisions, open questions, or context shifts.
  Use ref: for file pointers — never describe file contents inline.

# Priority guide:
# blocking = needs immediate attention before any analysis
# high     = should address this session
# normal   = useful brainstorm prompt, no urgency
# low      = FYI / background context
```
