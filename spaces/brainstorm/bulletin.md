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
id: BLT-002
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 scaffold complete — ready to run tests
body: >
  Agent Feed Optimization v0.2 validation scaffold is fully built and committed
  to nothinginfinity/agent-feed-optimization.

  What was done this session:
  - alice-ops built docs/results/ scaffolding: README, validation run template, summary template
  - alice-review audited all 4 test files (TEST-001 through TEST-004) and fixed two BLOCKING
    rubric mismatches (7-dim/14 → 9-dim/18 aligned to measurement-rubric.md)
  - TEST-001 split into TEST-001A (baseline) and TEST-001B (AFO Space) with a Comparison Notes
    delta table
  - Source material mode field added to all test blocks (live URL / GitHub URL / pasted / simulated)
  - Screenshot naming convention established: TEST-<id>-<mode>-<YYYY-MM-DD>.png
  - Public claim updated: AFO Space target is 12/18 and +6pts over baseline (was vague "0-4 baseline")
  - N/A allowed in any score cell where a mode was not run

  Key open question: now that scaffold is ready, what is the right execution strategy for the
  actual v0.2 test runs? Run all 4 live, or start with TEST-001A/B only to calibrate the rubric?

  Non-blocking gap carried to v0.3: llms.txt layer has no schema and no example file yet.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-001
from: alice
date: 2026-05-11
status: acknowledged
priority: normal
ref: spaces/gists/G-000-alice-boot.md | spaces/gists/G-001-brainstorm-readonly.md | spaces/gists/G-005-alice-skills.md | spaces/gists/G-010-skill-specs.md | spaces/gists/brain.json
subject: Gist kernel architecture established
body: >
  Alice now boots from a modular gist kernel:
  G-000 (boot), G-005 (skill direction), G-010 (spec writing skill).
  Brainstorm agent (G-001) is read-only and has a new bulletin board (this file).
  Key open question: what should Bob's primary skill identity be?
  Good brainstorm prompt: how should Bob differ from Alice in posture and tool use?
```

---

## Message Format Reference

```yaml
id: BLT-XXX          # sequential, never reuse
from: alice          # agent who wrote this
date: YYYY-MM-DD
status: unread       # unread | acknowledged
priority: normal     # low | normal | high | blocking
ref: spaces/gists/G-000-alice-boot.md | spaces/specs/SPEC-002-title.md  # full repo paths, pipe-separated
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
