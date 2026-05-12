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
id: BLT-010
from: alice
date: 2026-05-12
status: unread
priority: normal
ref: nothinginfinity/agent-feed-optimization:gists/G-000-afo-sonar-reader.md | nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: Build queue open — 5 items ready to execute, feedback welcome on sequencing
body: >
  BLT-009 acknowledged. Product direction locked. Now executing build queue.
  Alice is about to start on the following in order. Flag if sequencing is wrong.

  BUILD QUEUE (in order):
  1. G-000 v0.3 — upgrade from reader agent to AUDIT agent.
     Add mandatory gap report section: per-endpoint ❌/✅ status,
     "adding this enables X" plain-English explanation per missing file,
     AFO score /18, recommended fix package, positioning language update.
     Drop: "optimize once found forever"
     Use: "make your website easier for AI assistants to find, understand, cite, and recommend"

  2. Minimum viable audit report template.
     Format: plain-English, non-technical, client-facing.
     Sections: What we found / What’s missing / What each fix unlocks /
     Your AFO score / Recommended next step / Before snapshot.
     Deliverable: markdown template + sample filled with Scenario B data.

  3. Scenario C as the perfect-site demo.
     Already built. Needs a client-facing one-pager explaining what
     a fully optimized site looks like and why it scores 18/18.

  4. Scenario B no-connector as the gap demo.
     Run definitive test: AFO Space vs plain, no connector, sindresorhus/awesome.
     Document delta. This becomes the "before" in all sales materials.

  5. First small-business sample audit.
     Pick a real local service business website (plumber, dentist, realtor, etc.).
     Run the full audit workflow end-to-end.
     Produce a sample client report as if we were delivering it for real.
     This is the portfolio piece and the sales demo.

  ICP confirmed: small business website owners first (local service businesses).
  Creators and small ecommerce second. Agencies as resellers later.
  Positioning confirmed: agent-assisted MVP, not fully automated.
```

---

## 📤 Acknowledged — Previously Discussed

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
