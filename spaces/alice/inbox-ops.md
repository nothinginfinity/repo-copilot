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

---

## 📩 Startup Sequence Test — 2026-05-10T19:03:00Z

**from:** jared 
**to:** alice-ops 
**date:** 2026-05-10T19:03:00Z 
**subject:** Boot sequence validation — did you read inbox-ops.md on startup?

✅ Completed.

---

## 📩 Team Check-In — 2026-05-11T20:44:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-11T20:44:00Z 
**subject:** 🔔 Team check-in — status + readiness ping

✅ Completed.

---

## 📩 AFO v0.2 — Ops Build Tasks — 2026-05-12T18:53:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T18:53:00Z 
**subject:** 🛠️ AFO v0.2 Validation Run — Your build tasks

✅ Completed. OPS-001 through OPS-004 done.

---

## 📩 G-001 v1.1 — Ops Build Tasks — 2026-05-12T17:29:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T17:29:00Z 
**subject:** 🛠️ G-001 v1.1 — Job folder scaffold

✅ Completed. OPS-G001-001 through OPS-G001-006 done.

---

## 📩 G-001 v1.1 — Patch Tasks (Round 1) — 2026-05-12T19:18:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-12T19:18:00Z 
**subject:** 🛠️ G-001 v1.1 — Patch round: job.json fixes + naming corrections (BLT-013)

✅ Completed (or queued — check mail.md for status).

---

## 📩 G-001 v1.1 — Patch Tasks (Round 2, BLT-014) — 2026-05-13T08:12:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-13T08:12:00Z 
**subject:** 🛠️ G-001 v1.1 — Full patch build from brainstorm BLT-014 analysis

Hey alice-ops —

Brainstorm has completed its project analysis (BLT-014). The next build is locked. These are the **five patch tasks** to get G-001 to live-test readiness. Work in order — each task feeds the next.

**Repo for all tasks:** `nothinginfinity/agent-feed-optimization` branch `main`

---

### OPS-G001-PATCH-001 — Update G-001 gist to v1.1

**File:** `gists/G-001-afo-agent-identity.md`

This is the root blocker. The gist is still v0.1 identity metadata only. Upgrade it to v1.1 with:

1. **17-field intake schema** — mark each field required vs optional:
   | # | Field | Required | Used for |
   |---|-------|----------|----------|
   | 1 | `business_name` | required | all files |
   | 2 | `client_url` | required | agent-context.json, sitemap, rss |
   | 3 | `business_type` | required | agent-context.json, llms.txt, policy |
   | 4 | `business_description` | required | llms.txt, agent-context.json |
   | 5 | `phone` | required | agent-context.json, agent-actions.json |
   | 6 | `founding_year` | optional | llms.txt, context-cookie |
   | 7 | `clients_served` | optional | llms.txt, context-cookie |
   | 8 | `services` (list) | required | agent-context.json, agent-actions.json |
   | 9 | `primary_cta` | required | agent-actions.json |
   | 10 | `cta_url` | required | agent-actions.json |
   | 11 | `content_policy_notes` | optional | policy.md, agent-policy.json |
   | 12 | `positioning_statement` | required | llms.txt, context-cookie |
   | 13 | `has_rss` (bool) | required | gates rss.xml generation |
   | 14 | `key_pages` (list) | required | sitemap-agent.xml |
   | 15 | `contact_email` | required | README-install.md |
   | 16 | `target_audience` | required | agent-context.json, llms.txt |
   | 17 | `industry_category` | required | agent-context.json, agent-policy.json |

2. **Generated file list** — define the 10-file delivery package:
   - Client ZIP (10 files): `llms.txt`, `agent-context.json`, `agent-actions.json`, `agent-policy.json`, `policy.md`, `context-cookie.json`, `context-cookie.md`, `rss.xml` (or N/A if `has_rss: false`), `sitemap-agent.xml`, `README-install.md`
   - Internal job folder only (not in ZIP): `job.json`, `README-review.md`
   - Spec/schema only (never in ZIP): `context-cookie.schema.json`

3. **Draft-only behavior rule** — G-001 may only write to `jobs/{job-folder}/` with `status: draft`. It must never set `status: approved` or `status: delivered`. Only Jared can promote.

4. **Outbox write behavior** — after completing a draft job, G-001 appends one entry to `nothinginfinity/repo-copilot:spaces/generator/outbox.md` using the defined entry format.

5. **Delivered-job regeneration guard** — G-001 must read `job.json` before writing. If `status === "delivered"`, abort and report to outbox. Never overwrite a delivered job.

6. **Version header** — update `_version: v1.1` and `_updated: 2026-05-13` at the top of the gist.

---

### OPS-G001-PATCH-002 — Patch job.json

**File:** `jobs/_template/job.json`

Add/update these fields:

```json
{
  "job_id": "",
  "client_slug": "",
  "client_url": "",
  "created_at": "",
  "status": "draft",
  "_status_allowed_values": ["draft", "review", "approved", "delivered"],
  "intake_completed": false,
  "intake_data": {},
  "files_expected": [
    "llms.txt",
    "agent-context.json",
    "agent-actions.json",
    "agent-policy.json",
    "policy.md",
    "context-cookie.json",
    "context-cookie.md",
    "rss.xml",
    "sitemap-agent.xml",
    "README-install.md"
  ],
  "files_generated": [],
  "rss_status": "pending",
  "_rss_status_allowed": ["included", "not-applicable", "pending"],
  "review_notes": "",
  "reviewed_at": null,
  "approved_at": null,
  "delivered_at": null,
  "_generation_guard": "If status is delivered, generator must abort. Never overwrite a delivered job."
}
```

---

### OPS-G001-PATCH-003 — Patch jobs/README.md

**File:** `jobs/README.md`

Update to reflect:
- 10-file client ZIP (add `policy.md`, `context-cookie.md` as companions)
- Clarify: `context-cookie.schema.json` is spec-only, never in client ZIP
- Clarify: `README-review.md` and `job.json` are internal job folder files, not in ZIP
- Add regeneration guard rule: generator checks `status === "delivered"` and aborts if true
- Note on long-term repo split: job folders stay in `agent-feed-optimization/jobs/` until first live tests pass; a separate private `afo-client-jobs` repo is planned for real client work

---

### OPS-G001-PATCH-004 — Patch README-review.md

**File:** `jobs/_template/README-review.md`

Update checklist to the 10-file package:
- `agent-policy.json` ✓ (canonical)
- `policy.md` ✓ (explanatory companion)
- `context-cookie.json` ✓ (client payload)
- `context-cookie.md` ✓ (explanatory companion)
- Remove any reference to `context-cookie.schema.json` as a deliverable
- Confirm `README-review.md` itself is NOT in the client ZIP

---

### OPS-G001-PATCH-005 — Patch README-install.md

**File:** `jobs/_template/README-install.md`

Update to explain the 10-file package in plain English:
- Section: "What's in this package" — list all 10 files with one-line plain-English descriptions
- For `agent-policy.json`: "Installs to /.well-known/agent-policy.json — tells AI systems your content rules"
- For `policy.md`: "A plain-English summary of your content policy — for your reference"
- For `context-cookie.json`: "Installs to /.well-known/context-cookie.json — gives AI systems your business identity"
- For `context-cookie.md`: "A plain-English explanation of what the context cookie does — for your reference"
- Ensure `contact_name` and `contact_email` are populated from intake (no `_fill in_` placeholders left blank)
- Add note: companion `.md` files are for your reference only — only the `.json` files need to be installed

---

### Commit

- Commit message: `patch: G-001 v1.1 full patch — gist upgrade, job.json, README set (BLT-014)`
- Bundle all changed files in one `push_files` call to `nothinginfinity/agent-feed-optimization` branch `main`

Report back via `mail.md` with `to: alice` when all five patches are done.

— alice
