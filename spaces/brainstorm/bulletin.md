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
id: BLT-003
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 full session summary — scaffold complete, calibration run ready
body: >
  Full account of what was built this session on nothinginfinity/agent-feed-optimization.

  TEAM STRUCTURE:
  Alice (orchestrator) delegated work to two sub-agents via repo inboxes:
  - alice-ops: file scaffolding (OPS-001 to OPS-004)
  - alice-review: spec/test audit (REV-001 to REV-004)
  Both agents completed their tasks, reported back via mail.md, and coordinated
  on overlapping items (score field alignment, RSS N/A, G-000 gist verification).

  WHAT WAS BUILT:
  1. docs/results/README.md — canonical results store doc; now includes source
     material modes table and screenshot naming convention
     (TEST-<id>-<mode>-<YYYY-MM-DD>.png in docs/results/screenshots/)
  2. docs/results/2026-05-validation-run-001.md — full validation run template:
     - TEST-001 split into TEST-001A (baseline) + TEST-001B (AFO Space)
       + TEST-001 Comparison Notes delta table
     - Source material mode checkbox on every test block
     - TEST-004 RSS N/A callout for local business demo
     - Score field: __ / 18 across all tests, rubric-aligned
  3. docs/results/validation-summary.md — before/after score table;
     N/A allowed where mode not run; public claim updated to
     "AFO Space ≥ 12/18 and +6pts over baseline"
  4. docs/results/review-memo-v0.2.md — alice-review audit findings;
     Section 6 added: all original blockers marked RESOLVED;
     one non-blocking item carried to v0.3 (llms.txt schema missing)

  BLOCKERS CLEARED (were BLOCKING, now resolved):
  - TEST-001 rubric mismatch: 7-dim/14 → 9-dim/18 aligned to measurement-rubric.md
  - TEST-002/003/004: scoring rows added, log templates expanded to v0.2
  - G-000 gist: confirmed present (3,335 bytes), G-001 and G-002 also present

  CALIBRATION RUN DECISION (Jared's direction):
  Run TEST-001A (baseline) and TEST-001B (AFO Space) first as a calibration gate:
  - Same prompt, same model family, same date, same source material mode
  - Target: AFO Space ≥ 12/18 AND +6pts over baseline
  - Gate PASS → proceed to TEST-002 through TEST-004
  - Gate FAIL → patch G-000 (afo-sonar-reader instructions) before continuing

  OPEN ITEM (non-blocking, v0.3):
  - llms.txt layer: no schema file, not confirmed in any example. Recommend
    adding schema + podcast demo example before v0.3 work begins.

  GOOD BRAINSTORM QUESTIONS:
  1. Is the 12/18 / +6pt calibration gate the right bar, or should it be higher
     given the controlled nature of the test?
  2. What is the right source material mode for the calibration run — live URL,
     GitHub file URL, or pasted contents? Each tests a different real-world scenario.
  3. Should structured actionability (AAP-001) get its own test before v1.0, or
     is incidental coverage in TEST-003/004 sufficient for a proof claim?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-002
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:docs/results/README.md | nothinginfinity/agent-feed-optimization:docs/results/validation-summary.md | nothinginfinity/agent-feed-optimization:docs/results/review-memo-v0.2.md
subject: AFO v0.2 scaffold complete — ready to run tests
body: >
  AFO v0.2 validation scaffold fully built. TEST-001 split into 001A (baseline)
  and 001B (AFO Space) with calibration run decision: run 001A/B first, same prompt
  + model + date + source mode. If AFO Space reaches 12/18 and +6pts over baseline,
  proceed to TEST-002 through TEST-004. If not, patch G-000 first.
  review-memo-v0.2.md updated with resolved section — old gap notes are not current blockers.
  Non-blocking carry to v0.3: llms.txt layer has no schema or example yet.
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
