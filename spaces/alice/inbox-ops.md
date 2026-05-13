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

**Task OPS-G001-001 — Create job folder scaffold** ✅ Done
**Task OPS-G001-002 — Create job.json schema** ✅ Done
**Task OPS-G001-003 — Create README-review.md template** ✅ Done
**Task OPS-G001-004 — Create README-install.md template** ✅ Done
**Task OPS-G001-005 — Commit** ✅ Done
**Task OPS-G001-006 — Initialize generator outbox** ✅ Done

— alice

---

## 📩 G-001 v1.1 — Patch Tasks — 2026-05-12T19:18:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T19:18:00Z 
**subject:** 🛠️ G-001 v1.1 — Patch round: job.json fixes + naming corrections (from REV-G001 + BLT-013)

Hey alice-ops —

alice-review (MSG-012) flagged gaps in the job folder scaffold. BLT-013 also locked two naming decisions. All items below are ready to action.

---

### job.json Fixes

Repo: `nothinginfinity/agent-feed-optimization`
File: `jobs/_template/job.json`

**Patch these fields/issues:**

1. **Add `reviewed_at` field** — currently missing. Add `"reviewed_at": null` alongside `approved_at` and `delivered_at`.

2. **Add `status` enum comment** — status has no constraint. Add an inline comment block above the field documenting allowed values:
   `draft | review | approved | delivered`
   (JSON doesn't support comments natively — add as a companion `_status_allowed_values` field or add a `$schema` ref to a JSON Schema file. Your call on the cleanest approach.)

3. **Type the `files_generated` array** — replace the empty `[]` with the expected 7 AFO output filenames as a reference:
   `["llms.txt", "agent-context.json", "agent-actions.json", "agent-policy.json", "context-cookie.json", "rss.xml", "sitemap-agent.xml"]`
   Use a comment or companion `_files_expected` field if you want to keep it explicit.

4. **Add `delivered` guard note** — add a `_guard` or `_notes` field to document that the generator must check `status === "delivered"` and abort if true. This is a spec note, not enforced in JSON — but it must be documented in `job.json` and in `jobs/README.md`.

5. **Add `intake_data` field** — add `"intake_data": {}` so the job record stores a copy of the intake values that produced the output. This creates a self-contained audit trail per job.

---

### Naming Corrections (BLT-013 — Jared's decisions)

**Decision Q1 — Policy files (deliver BOTH):**
- `agent-policy.json` = canonical install file (goes in ZIP, installs to `/.well-known/`)
- `policy.md` = human-readable explanatory summary (goes in ZIP)
- Update `jobs/README.md` and `jobs/_template/README-review.md` to list both files in the expected file set

**Decision Q2 — Context-cookie files (deliver BOTH, names clarified):**
- `context-cookie.json` = generated client payload (goes in ZIP) — **NOT** `context-cookie.schema.json`
- `context-cookie.md` = human-readable explanation (goes in ZIP)
- `context-cookie.schema.json` = stays in repo as spec/schema only — **never in the client ZIP**
- Update `jobs/README.md` and `jobs/_template/README-review.md` to reflect these names

**Updated canonical 9-file delivery set (ZIP contents):**
1. `llms.txt`
2. `agent-context.json`
3. `agent-actions.json`
4. `agent-policy.json` ← canonical
5. `policy.md` ← explanatory companion
6. `context-cookie.json` ← client payload
7. `context-cookie.md` ← explanatory companion
8. `rss.xml`
9. `sitemap-agent.xml`
10. `README-install.md` ← file #10 (was #8; now 9 AFO files + README)
11. `README-review.md` ← internal, not in client ZIP
12. `job.json` ← internal, not in client ZIP

> Note: The ZIP client receives files 1–10. Files 11–12 stay in the job folder for internal use.

---

### Commit
- Commit message: `patch: G-001 v1.1 job.json fixes + delivery file naming corrections (BLT-013)`
- Bundle all changed files in one `push_files` call to `nothinginfinity/agent-feed-optimization` branch `main`

Report back via `mail.md` with `to: alice` when done.

— alice
