# Alice Handoff — AFO /start Form + D1 Debug
**Date:** 2026-05-16  
**Status:** ✅ D1 schema confirmed, corrupt row fixed | ⏳ Turnstile env var still needed  
**Worker:** `afo-visibility-snapshot`  
**Domain:** `agentfeedoptimization.com`  
**D1 Database:** `afo-v1`

---

## What Was Done This Session

### 1. Turnstile Issue Identified
- Form showed "Please complete the security check before submitting" — Turnstile widget not rendering
- Root cause: `TURNSTILE_SITE_KEY` env var missing or empty on the Worker
- Fix: Set it in **Workers & Pages → afo-visibility-snapshot → Settings → Variables**
- Use the **Site Key** (public) from **Cloudflare Dashboard → Turnstile**, NOT the secret key

### 2. D1 Schema Confirmed Correct

**`customers`:** id, email (NN), name (NN), business_name (NN), role, created_at (NN), website_url  
**`visibility_snapshots`:** id, customer_id (NN), audit_request_id, website_url (NN), snapshot_score, snapshot_json, generated_prompts_json, self_test_status (default 'pending'), requested_full_audit (default 0), created_at (NN)

### 3. Corrupt Customer Row Fixed
Test row `getfitdoc@me.com` had `business_name = null` violating NOT NULL. Fixed with:
```sql
UPDATE customers SET business_name = 'AFO LLC', website_url = 'https://www.agentfeedoptimization.com' WHERE email = 'getfitdoc@me.com'
```

### 4. D1 Console Quirk Documented
- D1 console does NOT support multi-line SQL or `--` comments
- Submit one clean statement at a time, no comments, no semicolons

---

## Remaining Steps (In Order)

### Priority 1 — Fix Turnstile (5 min, Jared does this)
1. **Cloudflare Dashboard → Turnstile** → copy Site Key for `agentfeedoptimization.com`
2. **Workers & Pages → afo-visibility-snapshot → Settings → Variables**
3. Add/update: `TURNSTILE_SITE_KEY` = `<site key>`
4. Save and Deploy
5. Visit `https://agentfeedoptimization.com/start` — Turnstile widget should render

### Priority 2 — End-to-End Test
1. Fill form with a **new test email** (not `getfitdoc@me.com`, e.g. `getfitdoc+test@gmail.com`)
2. Submit → should redirect to `/results?id=...`
3. D1 verify: `SELECT * FROM visibility_snapshots ORDER BY created_at DESC LIMIT 1`
4. D1 verify: `SELECT * FROM customers ORDER BY created_at DESC LIMIT 1`

### Priority 3 — Full Audit Checkbox
- Checkbox sets `requested_full_audit = 1` in snapshot row
- No email sent yet — future feature
- Test: submit with checkbox checked, verify value in D1

---

## Key Files
| File | Purpose |
|------|---------|
| `workers/visibility-snapshot/index.js` | Main Worker — all routes |
| `workers/visibility-snapshot/start.html` | Form — `{{TURNSTILE_SITE_KEY}}` injected at serve time |
| `workers/visibility-snapshot/results.html` | Results page — score + booking link |
| `db/migrations/002_visibility_snapshot_fields.sql` | D1 migration — already applied |

---

## Context for Next Alice
Jared Edwards is building **Agent Feed Optimization (AFO)** — a service auditing whether businesses appear when customers ask AI assistants. The `/start` page is a free "Visibility Snapshot" lead gen form.

Full pipeline:
`/start form → POST /api/visibility-snapshot → D1 insert → /results page → booking link (cal.com/jared-edwards-gscxmo)`

The Worker is deployed at `agentfeedoptimization.com` via Cloudflare Workers.
