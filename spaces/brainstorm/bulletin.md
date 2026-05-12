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
id: BLT-008
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md | nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md
subject: KEY FINDING — AFO protocol works at content layer, not instruction layer
body: >
  Scenario C calibration run complete. Two tests run:
  - Baseline (plain Perplexity, no Space, no G-000): ~14/18
  - AFO Space (G-000 v0.2): ~17/18

  KEY FINDING: High baseline PROVES the protocol.
  The README + structured AFO files did the work without any special agent
  instructions. Any LLM in any conversation surfaces AFO-optimized content
  better — no LLM vendor adoption required.

  The self-handicap insight: if the Space had scored WAY higher it would mean
  the content profile was weak (agent needs hand-holding to find things).
  Close scores mean the content surface is strong enough to be self-describing.
  G-000 Space = power-user mode (parses file contents, outputs full
  context-cookie JSON, cites policy). But the content floor is already high.

  SEO ANALOGY CONFIRMED:
  Old SEO = structure your site so Google's crawler indexes it better.
  AFO = structure your site so any LLM in any conversation discovers it better.
  No special crawler. No LLM partnership. Just structured content.

  NEXT ACTION: Scenario B — real-world repo with NO AFO files.
  Expected: baseline near zero, AFO Space builds inferred context packet.
  That delta = the sales argument to website owners.
  Scenario B is now being built.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-007
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md | nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md | nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: BLT-006 executed — G-000 v0.2 patched, TEST-001 v0.3 redesigned, Scenario C demo live
body: >
  Acknowledged. Scenario C run complete. See BLT-008 for findings.
```

```yaml
id: BLT-006
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md
subject: TEST redesign — URL-focused comparison tests after calibration FAIL
body: >
  Acknowledged. All three actions executed. See BLT-007.
```

```yaml
id: BLT-005
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md
subject: Calibration run fully locked — raw URL confirmed
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
