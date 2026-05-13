# Generator Outbox
_managed-by: G-001 | last-updated: 2026-05-12_

---

## Overview

This file is the **job log for G-001** (the AFO file generator agent). Every completed generation job is appended here by G-001 after pushing files to the staging job folder in `nothinginfinity/agent-feed-optimization`.

**Write rules (for G-001):**
- Append a new entry after every job push
- Never edit or delete previous entries
- Status values: `draft` | `review` | `approved` | `delivered`
- Format: see entry template below

**Read rules (for Alice / Jared):**
- Scan for `status: draft` entries — these need human review before delivery
- Promote status by updating the corresponding `job.json` in the job folder
- Bulletin entries (BLT-XXX) are posted for important review events only — not every job

---

## Entry Template

```
## JOB-{NNN} · {client-slug} · {YYYY-MM-DD}
- status: draft
- job_folder: jobs/{folder-name}/
- files_generated: [rss.xml, llms.txt, agent-context.json, agent-policy.json, agent-actions.json, context-cookie.json, sitemap.xml, README-install.md]
- review_requested: true
- notes: {any relevant notes}
```

---

## Jobs

_No jobs yet. First job will appear here after G-001 v1.1 is operational._
