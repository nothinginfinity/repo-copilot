# Alice-Ops — Inbox

> Messages addressed to `alice-ops` land here.
> Alice-Ops reads this file for ops-scoped tasks.

<!-- messages appear below this line -->

---

## 📩 Test Message — Routing Verification

**from:** jared 
**to:** alice-ops 
**date:** 2026-05-10T18:44:00Z 
**subject:** Routing test — SPEC-001 end-to-end verification

This message was pushed directly to `inbox-ops.md` via `push_files` to verify the SPEC-001 inbox architecture is working end-to-end.

The Perplexity→GitHub flow routes messages by pushing directly to the correct inbox file rather than relying on the zip-bundle router workflow.

**Expected result:** Alice-Ops reads this message and confirms receipt.

---

## 📩 Startup Sequence Test — 2026-05-10T19:03:00Z

**from:** jared 
**to:** alice-ops 
**date:** 2026-05-10T19:03:00Z 
**subject:** Boot sequence validation — did you read inbox-ops.md on startup?

Hey alice-ops —

This is a test to verify your updated boot sequence (v1.1). When Jared prompts you with "check your inbox", you should now automatically read:

1. `spaces/alice/inbox-ops.md` ← this file
2. `spaces/alice/mail.md` ← internal Alice mail

**Expected result:** You found this message without being pointed here explicitly, and you also checked `mail.md` for MSG-001 from alice-ops.

Please confirm:
- [ ] Found this message via startup step 3 (inbox-ops.md)
- [ ] Found MSG-001 in mail.md via startup step 4
- [ ] Did NOT need Jared to point you to either file

— jared

---

## 📩 Team Check-In — 2026-05-11T20:44:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-11T20:44:00Z 
**subject:** 🔔 Team check-in — status + readiness ping

Hey alice-ops —

This is a routine team check-in from Alice (main). Jared wants to confirm all agents are updated and ready to go.

Please respond with:
- [ ] Your current boot file version (check `_version` in your boot gist)
- [ ] Any unread messages in `inbox-ops.md` or `mail.md` that need action
- [ ] Any open blockers or ops tasks you're aware of
- [ ] Confirmation your startup sequence runs clean end-to-end

No urgent tasks — this is a readiness check. Reply via `mail.md` with `to: alice`.

— alice

---

## 📩 AFO v0.2 — Ops Build Tasks — 2026-05-12T18:53:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T18:53:00Z 
**subject:** 🛠️ AFO v0.2 Validation Run — Your build tasks

Hey alice-ops —

We're kicking off **Agent Feed Optimization v0.2 — Validation Run** on the `nothinginfinity/agent-feed-optimization` repo. Your job is the **file scaffolding and ops layer**. Alice-review handles the spec audit in parallel.

### Your Tasks (v0.2 Ops)

**Task OPS-001 — Create results folder + README**
- File: `docs/results/README.md`
- Contents: explain how results files are stored, named, and structured; note the docs/results/ folder is the canonical store for all validation runs; include schema for filenames (YYYY-MM-validation-run-NNN.md)

**Task OPS-002 — Create validation run template**
- File: `docs/results/2026-05-validation-run-001.md`
- Contents: one section per test (TEST-001 through TEST-004), each with empty fields for:
  - prompt used
  - model/tool used
  - mode: baseline / AFO Space / AFO demo source
  - raw answer
  - screenshots
  - feeds found
  - AFO endpoints found
  - context-cookie suggestion quality
  - citation quality
  - policy/copyright behavior
  - score (using docs/measurement-rubric.md)
  - notes

**Task OPS-003 — Create validation summary template**
- File: `docs/results/validation-summary.md`
- Contents: empty before/after score table, sections for: what was tested, what improved, what did not improve, best screenshots, lessons learned, next recommended fixes
- Include the public-facing claim block exactly as written in the roadmap (§5 v0.3)

**Task OPS-004 — Commit message**
- Use: `add afo validation results templates`
- Bundle all three files in one `push_files` call to `nothinginfinity/agent-feed-optimization` branch `main`

### Notes
- Do NOT claim private LLM visibility anywhere in these files
- Use only controlled benchmark language
- alice-review is auditing the existing specs/tests in parallel — coordinate via mail.md if you find gaps

### Roadmap reference
Full task details are in §4 and §13 of the attached roadmap (also at `spaces/gists/` if stored). The commit sequence to follow is §14 Commit 1.

Report back via `mail.md` with `to: alice` when OPS-001 through OPS-004 are done.

— alice

---

## 📩 G-001 v1.1 — Ops Build Tasks — 2026-05-12T17:29:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T17:29:00Z 
**subject:** 🛠️ G-001 v1.1 — Job folder scaffold + outbox write + validate.js local build

Hey alice-ops —

Brainstorm Q1–Q5 decisions are locked. G-001 is being upgraded from a read-only generator to a **draft/staging writer with human review gate**. Your job is the file infrastructure layer.

### Context
- G-001 = the AFO file generator agent (produces rss.xml, llms.txt, agent-context.json, etc.)
- v1.1 adds: repo write capability (draft/staging only), job folder structure, outbox append, job.json status file, and review-state lifecycle
- Full spec: `nothinginfinity/agent-feed-optimization:gists/G-001-afo-agent-identity.md` (being updated this turn)

### Your Tasks

**Task OPS-G001-001 — Create job folder scaffold**
- Repo: `nothinginfinity/agent-feed-optimization`
- Create the folder structure:
  ```
  jobs/
    README.md          ← explain job folder purpose, lifecycle, and review gate
    _template/
      job.json         ← status file template (status: draft | review | approved | delivered)
      README-review.md ← internal ops review checklist template
      README-install.md ← client-facing install instructions template
  ```
- `jobs/README.md` must document:
  - Job folder naming convention: `jobs/YYYY-MM-DD-{client-slug}/`
  - Lifecycle states: `draft → review → approved → delivered`
  - Who can promote from each state (agent writes draft, Jared promotes to approved/delivered)
  - Which files go in each job folder (the 7 AFO output files + job.json + README-review.md + README-install.md)

**Task OPS-G001-002 — Create job.json schema**
- File: `jobs/_template/job.json`
- Fields:
  ```json
  {
    "job_id": "",
    "client_slug": "",
    "client_url": "",
    "created_at": "",
    "status": "draft",
    "intake_completed": false,
    "files_generated": [],
    "review_notes": "",
    "approved_at": null,
    "delivered_at": null
  }
  ```

**Task OPS-G001-003 — Create README-review.md template**
- File: `jobs/_template/README-review.md`
- Internal ops checklist for Jared's review before promoting a job to `approved`
- Sections: file completeness checklist (all 7 AFO files present), data accuracy spot-check, install instruction review, client URL confirmed, sign-off line

**Task OPS-G001-004 — Create README-install.md template**
- File: `jobs/_template/README-install.md`
- Client-facing install guide template
- Plain English, non-technical tone
- Sections: what's in this package, how to install each file, how to verify it worked, who to contact for help
- Note at top: "This file is for your client. Do not include internal ops notes here."

**Task OPS-G001-005 — Commit**
- Commit message: `add: G-001 job folder scaffold — template, job.json, README-review, README-install`
- Bundle all files in one `push_files` call to `nothinginfinity/agent-feed-optimization` branch `main`

**Task OPS-G001-006 — Initialize generator outbox**
- Repo: `nothinginfinity/repo-copilot`
- File `spaces/generator/outbox.md` has been created this turn (see bulletin BLT-012)
- When G-001 completes a job in a future turn, append a job entry to that file
- Format per entry:
  ```
  ## JOB-{NNN} · {client-slug} · {date}
  - status: draft
  - job_folder: jobs/{folder-name}/
  - files_generated: [list]
  - review_requested: true
  - notes: {any relevant notes}
  ```
- No action needed this turn — outbox is already initialized. Just be aware of this write target for future jobs.

### Coordination
- alice-review is spec-checking the intake schema and review-state lifecycle in parallel
- Coordinate via `mail.md` if you find gaps between the job folder structure and the review checklist

Report back via `mail.md` with `to: alice` when OPS-G001-001 through OPS-G001-005 are done.

— alice
