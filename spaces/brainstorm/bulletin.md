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
id: BLT-006
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md | nothinginfinity/agent-feed-optimization:docs/results/2026-05-validation-run-001.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: TEST redesign — URL-focused comparison tests after calibration FAIL
body: >
  CALIBRATION RUN RESULT (2026-05-12):
  TEST-001A (baseline) ~5/18 | TEST-001B (AFO Space) ~8/18 | Delta: ~+3pts
  Gate FAILED — required >=12/18 and >=+6pts. Neither condition met.

  AFO Space partially fired: output format structure appeared (subscribe table,
  suggested next prompt) but core AFO behaviors did NOT execute:
  - No raw RSS endpoint URLs surfaced
  - No AFO file searches attempted (no llms.txt, agent-context.json lookup)
  - No context-cookie prompt offered
  G-000 patch is needed. But Jared also identified a deeper test design gap:

  TEST DESIGN PROBLEM:
  TEST-001 was an open web search. Both agents searched the whole web and returned
  similar results. The prompt did not give them a specific URL to analyze, so there
  was no surface for AFO feed discovery behaviors to fire against.
  The delta was noise, not signal.

  NEW TEST DESIGN (Jared's direction):
  The real proof requires giving both agents THE SAME URL and comparing how they
  respond. The delta between AFO Space and baseline on a specific URL is the
  actual product claim: "structure your site like this and AI agents will find
  more about you."

  THREE SCENARIOS PROPOSED:

  A. TWO MIRROR REPOS
     Create two GitHub repos with identical content but different structure:
     one AFO-friendly (has RSS, llms.txt, agent-context.json, sitemap)
     one plain (no AFO files, no feeds)
     Ask both agents: same prompt, each repo URL.
     Shows: "build your site like this and you get found better."
     Setup: medium (two new repos to create)

  B. ONE REAL PUBLIC REPO (fastest)
     Use Jared's biggest existing public GitHub repo right now.
     Ask AFO Space vs baseline: "tell me about this project and what I can
     subscribe to or follow."
     Baseline: scrapes README. AFO Space: hunts for feeds, context files,
     structured endpoints.
     Shows: real-world gap today, zero setup.
     Status: waiting on Jared to identify the repo.

  C. ONE DESIGNED GIST (controlled sandbox)
     A single public gist containing: RSS XML, llms.txt, agent-context.json,
     README, sitemap. Every AFO file format in one place.
     Best for: showing full detection capability in one clean demo.
     Setup: light (one gist, Alice drafts the files)

  RECOMMENDED EXECUTION ORDER:
  1. Scenario B now — zero setup, real world, runs today
  2. Scenario C next — controlled sandbox, ideal AFO site demo
  3. Scenario A last — side-by-side with/without comparison = marketing proof

  OPEN ITEMS:
  - G-000 still needs a patch (mandatory feed search + context-cookie prompt)
  - Jared needs to identify his biggest public repo for Scenario B
  - Scenario C gist files need to be drafted

  GOOD BRAINSTORM QUESTIONS:
  1. What should the prompt be for a URL-focused test? The current TEST-001
     prompt won't work well when you give it a specific repo URL to analyze.
  2. For Scenario A mirror repos, what is the minimal AFO-friendly file set
     that would produce a measurable delta? (RSS alone? Or RSS + llms.txt?)
  3. Is Scenario C (the designed gist) actually a better Phase 1 demo than
     a real repo, because it's fully controlled and can be linked publicly?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-005
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:docs/results/calibration-run-plan.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Calibration run fully locked — raw URL confirmed, ready to execute
body: >
  Acknowledged. Superseded by BLT-006 with calibration results and new test design.
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
