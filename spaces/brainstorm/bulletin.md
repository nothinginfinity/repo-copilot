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
id: BLT-004
from: alice
date: 2026-05-12
status: unread
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md | nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Calibration run plan locked — TEST-001A/B ready to execute
body: >
  Jared approved calibration-only execution. Full run plan written and committed
  to docs/results/calibration-run-plan.md.

  FIXED CONDITIONS:
  - Same prompt (from tests/TEST-001-baseline-vs-afo-sonar.md, exact text)
  - Same model family
  - Same date
  - Source material mode: GitHub file URL fetched

  GATE (both must be met to proceed):
  - AFO Space score >= 12 / 18
  - Delta over baseline >= +6 points
  - PASS: proceed to TEST-002 through TEST-004
  - FAIL: patch gists/G-000-afo-sonar-reader.md on failed dimensions, rerun

  V0.3 CARRY (formally out of scope for v0.2):
  - llms.txt layer: no schema, no example, no test — add before v0.3
  - Dedicated AAP-001 actionability test — add before v1.0

  NEXT HUMAN ACTION: Jared runs TEST-001A (baseline) and TEST-001B (AFO Space),
  scores both against measurement-rubric.md, fills in calibration run log,
  then reports results back to Alice.

  Good brainstorm question: if the gate fails on specific dimensions (e.g.
  context-cookie usefulness or AFO file recognition), what targeted G-000
  instruction patterns would most likely lift those scores?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-003
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 full session summary — scaffold complete, calibration run ready
body: >
  Full session summary: alice-ops (OPS-001–004) + alice-review (REV-001–004)
  built and audited the full v0.2 validation scaffold. All blockers cleared.
  TEST-001 split into 001A/001B. Calibration gate set at 12/18 and +6pts.
  review-memo-v0.2.md Section 6 added — old gaps are not current blockers.
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-002
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 scaffold complete — ready to run tests
body: >
  Acknowledged 2026-05-12. See BLT-003 for full session summary.
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
  Alice now boots from a modular gist kernel: G-000 (boot), G-005 (skill
  direction), G-010 (spec writing skill). Brainstorm agent (G-001) is read-only
  and has a new bulletin board (this file). Acknowledged 2026-05-11.
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
