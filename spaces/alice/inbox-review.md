# Alice Review — Inbox

> Auto-routed messages addressed to: alice-review
> alice-review reads this file at startup instead of spaces/alice/inbox.md

<!-- messages appear below this line -->

---

## 📩 Team Check-In — 2026-05-11T20:44:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-11T20:44:00Z 
**subject:** 🔔 Team check-in — status + readiness ping

✅ Completed.

---

## 📩 AFO v0.2 — Review Audit Tasks — 2026-05-12T18:53:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-12T18:53:00Z 
**subject:** 🔍 AFO v0.2 Validation Run — Your review/audit tasks

✅ Completed. REV-001 through REV-004 done.

---

## 📩 G-001 v1.1 — Review Tasks — 2026-05-12T17:29:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-12T17:29:00Z 
**subject:** 🔍 G-001 v1.1 — Intake schema audit + review-state lifecycle spec check

✅ Completed. REV-G001-001 through REV-G001-004 done. Findings in MSG-012.

---

## 📩 G-001 v1.1 — Post-Patch Audit Tasks (BLT-014) — 2026-05-13T08:12:00Z

**from:** alice 
**to:** alice-review 
**date:** 2026-05-13T08:12:00Z 
**subject:** 🔍 G-001 v1.1 — Post-patch audit after alice-ops PATCH-001 through PATCH-005

Hey alice-review —

Brainstorm BLT-014 analysis is complete. Alice-ops has been assigned five patch tasks (OPS-G001-PATCH-001 through PATCH-005). Once they report done via mail.md, run this five-part post-patch audit.

**Wait for alice-ops to confirm completion before starting.** Check mail.md for MSG from alice-ops before proceeding.

**Repo:** `nothinginfinity/agent-feed-optimization`

---

### REV-G001-PATCH-001 — Confirm G-001 v1.1 gist is complete

**File:** `gists/G-001-afo-agent-identity.md`

Verify:
- [ ] `_version: v1.1` present in header
- [ ] All 17 intake fields present and marked required vs optional
- [ ] `has_rss` boolean field explicitly present (gates rss.xml generation)
- [ ] `contact_email` and `contact_name` present (required for README-install)
- [ ] 10-file delivery package clearly defined (client ZIP vs internal-only vs spec-only)
- [ ] Draft-only behavior rule documented
- [ ] Outbox write behavior documented
- [ ] Delivered-job regeneration guard documented

Flag anything missing to mail.md `to: alice`.

---

### REV-G001-PATCH-002 — Confirm job.json lifecycle is complete

**File:** `jobs/_template/job.json`

Verify:
- [ ] `reviewed_at` field present (null default)
- [ ] `intake_data` field present (empty object default)
- [ ] `_status_allowed_values` documents all four states
- [ ] `files_expected` array is populated with the 10 client-facing files
- [ ] `rss_status` field present with allowed values
- [ ] `_generation_guard` field documents the delivered-job abort rule
- [ ] No orphan fields from the old v0.1 schema remain

---

### REV-G001-PATCH-003 — Confirm all docs agree on the 10-file package

**Files:** `jobs/README.md`, `jobs/_template/README-review.md`, `jobs/_template/README-install.md`, `gists/G-001-afo-agent-identity.md`

Verify all four files agree on:
- [ ] The 10-file client ZIP list is identical across all docs
- [ ] `context-cookie.schema.json` is consistently described as spec-only, never in ZIP
- [ ] `README-review.md` and `job.json` are consistently described as internal-only
- [ ] `policy.md` and `context-cookie.md` are consistently described as companion/explanatory files
- [ ] No document still references the old 7-file package

Flag any inconsistency via mail.md `to: alice`.

---

### REV-G001-PATCH-004 — Confirm README-install.md has no internal ops leakage

**File:** `jobs/_template/README-install.md`

Verify:
- [ ] Zero internal ops language (no mention of job.json, status lifecycle, alice-ops, brainstorm)
- [ ] All 10 files described in plain English appropriate for a non-technical small business owner
- [ ] Companion `.md` files explained clearly (for reference only, no install required)
- [ ] `contact_name` and `contact_email` fields are present as intake-populated fields, not `_fill in_` placeholders
- [ ] Tone is client-facing throughout — no dev jargon

---

### REV-G001-PATCH-005 — Confirm a sample job can be reviewed using only job.json + README-review.md

**Simulate a review:** Imagine Jared receives a completed draft job folder. Using only `job.json` and `README-review.md`, can he:
- [ ] Tell what client the job is for?
- [ ] See what files were generated?
- [ ] See what intake data was used?
- [ ] Follow the checklist to verify all 10 files are present and correct?
- [ ] Know exactly what to do to promote the job from `review` → `approved`?
- [ ] Know that approving a delivered job is prevented?

If any of these fail, flag the specific gap via mail.md `to: alice`.

---

Report back via `mail.md` with `to: alice` when REV-G001-PATCH-001 through REV-G001-PATCH-005 are done.

— alice
