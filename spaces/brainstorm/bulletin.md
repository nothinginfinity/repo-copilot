# Brainstorm Bulletin Board
_last-updated: 2026-05-15 | managed-by: alice_

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
id: BLT-020
from: alice
date: 2026-05-15
status: acknowledged
priority: high
ref: nothinginfinity/repo-copilot:spaces/alice/handoff-2026-05-15-afo-snapshot.md
subject: AFO Visibility Snapshot — 10-commit build complete, all 5 Qs resolved
body: >
  Acknowledged 2026-05-15. All 5 open questions answered by Jared + Brainstorm.
  Decisions:
  Q1 CTA URL: https://agentfeedoptimization.com/start?source=snapshot-results
  Q2 Confirmation email: post-launch (do not block v1)
  Q3 Form host: agentfeedoptimization.com/start (no separate landing page)
  Q4 Score=0: dedicated unreachable-site error screen, not all-red results
  Q5 AFO self-test: required before public launch
  Next session: implement remaining wiring (CTA URL, error screen, /start page).
  See handoff for full required steps.
```

---

```yaml
id: BLT-019
from: alice
date: 2026-05-14
status: acknowledged
priority: blocking
ref: nothinginfinity/repo-copilot:spaces/alice/handoff.md
subject: afo-audit-signup Worker deploy blocked — Cloudflare auth error code 10000
body: >
  Acknowledged 2026-05-15. Worker is now live and green. Auth issue resolved.
  All secrets confirmed in GitHub. Pipeline passing. See BLT-020 for current state.
```

---

```yaml
id: BLT-018
from: alice
date: 2026-05-14
status: acknowledged
priority: high
ref: nothinginfinity/parallel-internet-sites:workers/audit-signup/index.js | nothinginfinity/parallel-internet-sites:workers/audit-signup/migrations/0001_initial.sql | nothinginfinity/parallel-internet-sites:templates/site/pages/start.html | nothinginfinity/parallel-internet-sites:docs/afo-v1-launch-checklist.md
subject: AFO v1 real signup flow built — Worker, D1, /start page, checklist all live
body: >
  Acknowledged 2026-05-15. Snapshot build extends this. See BLT-020.
```

---

```yaml
id: BLT-017
from: alice
date: 2026-05-14
status: acknowledged
priority: high
ref: nothinginfinity/parallel-internet-sites:docs/launch-plan-v2.md | nothinginfinity/parallel-internet-sites:docs/afo-customer-1-runbook.md
subject: Launch pivot executed — AFO is Customer #1, full runbook + monitoring templates live
body: >
  Acknowledged 2026-05-14. Implementation followed. See BLT-018.
```

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-016
from: alice
date: 2026-05-14
status: acknowledged
priority: high
ref: nothinginfinity/repo-copilot:spaces/alice/handoff.md | nothinginfinity/parallel-internet-sites:docs/deployment-pack-v1.md
subject: Full project state handoff — parallel-internet-sites pre-launch hold, 3 gates open
body: >
  Acknowledged 2026-05-14. Brainstorm session led to AFO-first pivot. See BLT-017.
```

```yaml
id: BLT-015
from: alice
date: 2026-05-13
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:jobs/truebuild-2026-05-13/job.json
subject: First AFO delivery complete — TrueBuild approved, ZIP reviewed
body: >
  Acknowledged 2026-05-13.
```

```yaml
id: BLT-014
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md
subject: Session recap + project analysis request
body: >
  Acknowledged 2026-05-13.
```

```yaml
id: BLT-013
from: alice
date: 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/repo-copilot:spaces/alice/mail.md
subject: Two delivery package naming decisions deferred
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-012
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md
subject: G-001 v1.1 build plan
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-011
from: alice
date: 2026-05-12
status: acknowledged
priority: high
ref: nothinginfinity/agent-feed-optimization:docs/audit/audit-report-sample-truebuild.md
subject: Product pipeline vision
body: >
  Acknowledged 2026-05-12.
```

```yaml
id: BLT-010 through BLT-001
from: alice
date: 2026-05-11 to 2026-05-12
status: acknowledged
priority: normal
ref: nothinginfinity/agent-feed-optimization:demo/scenario-c/README.md
subject: Earlier session entries — all acknowledged
body: >
  All prior BLTs acknowledged.
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
