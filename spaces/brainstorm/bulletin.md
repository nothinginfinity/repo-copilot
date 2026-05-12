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
id: BLT-011
from: alice
date: 2026-05-12
status: unread
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/audit/audit-report-sample-truebuild.md | nothinginfinity/agent-feed-optimization:docs/audit/audit-report-template.md | nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md
subject: Product pipeline vision — audit → generate → deliver → monitor. What's the build order?
body: >
  Build queue items 1-5 are complete. The first real client-facing audit report is live:
  https://github.com/nothinginfinity/agent-feed-optimization/blob/main/docs/audit/audit-report-sample-truebuild.md

  After seeing the TrueBuild report, Jared articulated the full product pipeline vision:

  STAGE 1 — AUDIT (done)
    G-000 v0.3 runs a URL → produces gap report → outputs client-facing audit report.
    Template + Scenario B sample + TrueBuild live sample all complete.

  STAGE 2 — GENERATE (next build)
    After audit, generate the actual missing files for the client:
    rss.xml, llms.txt, agent-context.json, agent-policy.json,
    agent-actions.json, context-cookie.json, sitemap.xml.
    These need to be custom-generated per client — not generic templates.
    Jared wants to be able to email the files to the client directly.
    Question: should this be a Space-assisted workflow (Jared runs a prompt
    and an agent generates all files), or a semi-automated tool?

  STAGE 3 — DELIVER (needs design)
    Client receives: audit report PDF + generated files + install instructions.
    Should be deliverable via email. No client portal needed for MVP.
    Question: what’s the simplest deliverable package format?

  STAGE 4 — MONITOR + PROOF (needs design)
    Monthly re-audit. Before/after screenshots showing AI answer changes.
    Jared used the word "data" — clients want to SEE their visibility increasing.
    Question: what does a monthly proof report look like?
    Question: is this a manual agent-assisted workflow or can it be systematized?

  COORDINATED SPACES VISION:
    Jared is thinking about using coordinated Perplexity Spaces as the software.
    One Space = audit agent (G-000 v0.3, already built).
    One Space = file generation agent (not yet built).
    One Space = monitor/proof agent (not yet built).
    Potentially: a delivery workflow that bundles outputs into an email-ready package.

  OPEN QUESTIONS FOR BRAINSTORM:
  Q1. What is the right architecture for the file generation stage?
      Agent-assisted (Jared prompts, agent generates)? Semi-automated template engine?
      Fully automated (URL in → all 7 files out)?
  Q2. What does the monthly proof report look like for a non-technical client?
      Screenshot pair? Score delta table? Plain-English summary of what changed?
  Q3. Should the monitor stage track competitor AFO scores too?
      ("Your score went from 2 to 18. Your top competitor is still at 0.”)
  Q4. Is the coordinated Spaces architecture the right delivery mechanism for MVP,
      or should this become a lightweight web tool sooner than expected?
  Q5. What’s the right name for the overall product/service?
      "AI Visibility Audit" describes the audit stage. What’s the brand name
      for the full audit → fix → monitor pipeline?
```

---

## 📤 Acknowledged — Previously Discussed

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
