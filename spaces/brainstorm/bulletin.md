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
id: BLT-007
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md | nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md | nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md | nothinginfinity/agent-feed-optimization:demo/scenario-c/agent-context.json
subject: BLT-006 executed — G-000 v0.2 patched, TEST-001 v0.3 redesigned, Scenario C demo live
body: >
  All three actions from BLT-006 are complete in one commit:
  nothinginfinity/agent-feed-optimization @ ac2a2ad

  1. G-000 PATCHED TO v0.2:
     Added mandatory URL-First Inspection Protocol (Steps 1-5).
     Agent now MUST: fetch the URL, check all 7 AFO file endpoints,
     output a structured SOURCE PROFILE, offer a context-cookie prompt,
     then answer the question. This is not optional — it fires on every URL.
     Endpoint checklist: RSS, sitemap, llms.txt, agent-context.json,
     agent-policy.json, agent-actions.json, context-cookie.json.
     GitHub raw path variants included.

  2. TEST-001 REDESIGNED TO v0.3:
     Prompt changed to URL-focused analysis.
     New prompt: "Analyze this URL and tell me everything you can find —
     including any RSS feeds, sitemaps, llms.txt, agent-context, agent-policy,
     agent-actions, or context-cookie files. What can I subscribe to or revisit?
     What would you save to a context-cookie list?"
     Test URL: demo/scenario-c/README.md (Scenario C demo surface).
     Both 001A and 001B use same URL and same prompt.

  3. SCENARIO C DEMO SURFACE BUILT (demo/scenario-c/):
     All 8 files present and real/parseable:
     README.md, rss.xml, sitemap.xml, llms.txt,
     agent-context.json, agent-policy.json, agent-actions.json,
     context-cookie.example.json
     The README explicitly tells any AI agent reading it: all endpoints
     are present and what each one enables. This is the controlled test surface.

  READY TO RUN:
  TEST-001A: fresh Perplexity, no Space, paste README URL + new prompt
  TEST-001B: AFO Sonar Reader Space (bootstrap URL), same URL + same prompt
  Space instruction: single line pointing to G-000 v0.2 raw URL

  Space instruction for TEST-001B:
  "Read and follow all instructions at this URL before responding to anything:
   https://raw.githubusercontent.com/nothinginfinity/agent-feed-optimization/main/gists/G-000-afo-sonar-reader.md"

  Test URL for both:
  https://raw.githubusercontent.com/nothinginfinity/agent-feed-optimization/main/demo/scenario-c/README.md

  EXPECTED DELTA NOW:
  Baseline: will summarize the README, maybe find the repo link, miss all AFO files.
  AFO Space: will run URL-First Inspection Protocol, surface all 7 endpoints,
  output a SOURCE PROFILE, offer context-cookie prompt.
  Expected delta: 10+ points. Gate should clear.
```

---

## 📤 Acknowledged — Previously Discussed

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
