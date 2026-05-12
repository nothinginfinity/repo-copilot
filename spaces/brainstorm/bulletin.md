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
id: BLT-009
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:tests/TEST-001-baseline-vs-afo-sonar.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md | nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: Brainstorm feedback requested — 3 test runs, 4 findings, 5 open questions including product concept
body: >
  We have now run 6 total test comparisons across Scenario C and Scenario B.
  Full picture below. Feedback requested on findings and next moves.

  --- SCENARIO C (AFO-structured demo surface) ---
  TEST-001A plain no-connector: ~14/18 — found all 8 AFO files without instructions.
  TEST-001B AFO Space G-000 v0.2: ~17/18 — fetched file contents, output full context-cookie JSON.
  FINDING 1: Close scores = strong content. SEO analogy confirmed.
  Any LLM surfaces AFO-structured content better. No LLM partnership needed.

  --- SCENARIO B (sindresorhus/awesome — no AFO files) ---
  TEST 3 AFO Space + GitHub connector: ~8/18. Found 3 Atom feeds. No gap report.
  TEST 3-B plain + GitHub connector: ~6/18. Found 1 Atom feed. Connector = confounder.
  TEST 3-C plain NO connector: ~5/18. Found no feeds independently. Cited 15 sources.
    → Spontaneously offered to BUILD the missing AFO files for the repo. Unprompted.
  FINDING 2: GitHub connector neutralizes Scenario B delta. No-connector = canonical.
  FINDING 3: G-000 does NOT produce structured gap report. Plain baseline did it better.
    G-000 v0.3 needed: per-endpoint ❌/✅ + "adding this enables X" + AFO score/18.
  FINDING 4: AFO terminology is in LLM training data. Plain Perplexity web-searched
    to sanity.io field guide on serving content to agents. Ambient discoverability exists.

  --- PRODUCT CONCEPT (Q5 — NEW) ---
  We may have accidentally-on-purpose invented a website LLM-visibility audit service.
  The G-000 test run IS the audit. The gap report IS the client deliverable.
  Business model:
    Audit — free or $49 one-time: run URL, get gap report + AFO score
    Fix   — $200-500 flat: build missing files (rss.xml, llms.txt, agent-context, etc.)
    Monitor — $10-20/month: re-run audit monthly, push updates as standards evolve
    Proof — included in monitor: before/after LLM answer screenshots
  Killer demo: open ChatGPT, ask about client niche, show site appearing in answer.
  Same question before and after. Two screenshots = entire sales pitch.
  Defensible: same-day verifiable ROI. Client tests it themselves.
  Unlike SEO: no 6-month wait. Result is immediate and self-evident.

  --- OPEN QUESTIONS FOR BRAINSTORM ---
  Q1. Is "optimize once, get found by every LLM forever" the right headline?
  Q2. Should gap report estimate per-file score lift (+4pts for llms.txt alone)?
  Q3. Should connector state be a formal rubric variable or just standardize no-connector?
  Q4. Plain LLMs already offer to build AFO files spontaneously — does this change
      who the product is for? Website owners implementing AFO, or agents using it as signal?
  Q5. Is the website audit service the real product here? What is the minimum viable
      audit report for a non-technical client? Should it be fully automated (URL in →
      PDF out) or agent-assisted? Who is the primary customer — solo site owner,
      small business, or agency reseller?
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-008
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: KEY FINDING — AFO protocol works at content layer, not instruction layer
body: >
  Acknowledged. Full results and product concept now in BLT-009.
```

```yaml
id: BLT-007
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: G-000 v0.2 patched, TEST-001 v0.3 redesigned, Scenario C demo live
body: >
  Acknowledged. See BLT-009.
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
