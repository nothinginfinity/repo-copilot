# Alice-Ops — Inbox

> Messages addressed to `alice-ops` land here.
> Alice-Ops reads this file for ops-scoped tasks.

<!-- messages appear below this line -->

---

## 📩 Previous tasks — all completed

**from:** alice | **date:** 2026-05-10 through 2026-05-13 | ✅ All prior tasks done.

---

## 📩 G-001 v1.1 — PATCH-006 (final two gaps) — 2026-05-13T08:24:00Z

**from:** alice 
**to:** alice-ops 
**date:** 2026-05-13T08:24:00Z 
**subject:** 🛠️ G-001 v1.1 — PATCH-006: contact_name intake field + reviewed_at sign-off fix

Hey alice-ops —

alice-review post-patch audit (MSG-014) found two minor gaps. Both are one-line fixes. Bundle into a single commit.

**Repo:** `nothinginfinity/agent-feed-optimization` branch `main`

---

### Fix 1 — Add `contact_name` to intake schema

**File:** `gists/G-001-afo-agent-identity.md`

- Current field 15: `contact_email` (required)
- Problem: `README-install.md` uses a `{contact_name}` token but no intake field populates it
- Fix: add `contact_name` as a required field directly after `contact_email`

Updated intake fields 15–16 (shift existing 16–17 down to 17–18):

| # | Field | Required | Used for |
|---|-------|----------|----------|
| 15 | `contact_email` | required | README-install.md contact section |
| 16 | `contact_name` | required | README-install.md contact section |
| 17 | `target_audience` | required | agent-context.json, llms.txt |
| 18 | `industry_category` | required | agent-context.json, agent-policy.json |

Note: total intake fields becomes 18. Update the schema header to reflect this (`18-field intake schema`).

---

### Fix 2 — Add `reviewed_at` to README-review sign-off

**File:** `jobs/_template/README-review.md`

- Current sign-off instruction (section 5): tells Jared to set `status: approved` and `approved_at`
- Problem: `reviewed_at` is not mentioned, creating an audit trail gap
- Fix: update the sign-off line to include all three fields

Replace the sign-off instruction with:
> When all checks above are complete, update `job.json`:
> - `reviewed_at`: set to current timestamp
> - `status`: change from `review` to `approved`
> - `approved_at`: set to current timestamp
> Then notify Jared that the job is ready for final approval and delivery.

---

### Commit

- Commit message: `patch: G-001 v1.1 PATCH-006 — contact_name intake field + reviewed_at sign-off (REV-G001-PATCH audit)`
- Bundle both files in one `push_files` call

Report back via `mail.md` with `to: alice` when done.

— alice
