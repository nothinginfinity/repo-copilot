# Alice Inbox

## HANDOFF — afo-audit-signup Worker Deploy Debugging
**Date:** 2026-05-14  
**Status:** 🔴 Blocked — Authentication error on Cloudflare API  
**Repo:** `nothinginfinity/parallel-internet-sites`  
**Worker path:** `workers/audit-signup/`

---

## Current State

The GitHub Actions workflow (`Deploy audit-signup Worker`) is failing at the **Deploy Worker** step with:

```
ERROR A request to the Cloudflare API (/accounts/***/workers/services/afo-audit-signup) failed
Authentication error [code: 10000]
It looks like you are authenticating Wrangler via a custom API token set in an environment variable.
Please ensure it has the correct permissions for this operation.
```

**13 failed runs total today.** Error has evolved through these stages:
1. `exit code 1` — missing `package.json` ✅ fixed
2. `code: 7003` — routing error, caused by `[[routes]]` in wrangler.toml ✅ fixed (routes removed)
3. `--log-level` unknown flag ✅ fixed
4. `code: 10000` — **Authentication error — CURRENT BLOCKER**

---

## Files Changed This Session

| File | Change |
|------|--------|
| `workers/audit-signup/package.json` | Created — was missing, caused exit code 1 |
| `workers/audit-signup/wrangler.toml` | Removed `[[routes]]` block (was causing code 7003) |
| `.github/workflows/deploy-audit-signup.yml` | Added `apiEmail` field for Global API Key auth |

### Current wrangler.toml
```toml
name = "afo-audit-signup"
main = "index.js"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "afo-v1"
database_id = "ccbd076e-aaa7-42bb-8808-a20bd83569e2"

[vars]
EMAIL_PROVIDER = "log"
GITHUB_REPO_OWNER = "nothinginfinity"
GITHUB_REPO_NAME = "agent-feed-optimization"
```

### Current workflow deploy step
```yaml
- name: Deploy Worker
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    apiEmail: ${{ secrets.CLOUDFLARE_API_EMAIL }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    workingDirectory: workers/audit-signup
```

---

## GitHub Secrets (set by user)

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Set to Global API Key (last updated ~5:05 PM today) |
| `CLOUDFLARE_API_EMAIL` | `getfitdoc@me.com` |
| `CLOUDFLARE_ACCOUNT_ID` | Full 32-char UUID (confirmed correct) |

---

## Hypothesis for Current Failure

The `code: 10000` **Authentication error** despite using Global API Key suggests one of:

1. **`CLOUDFLARE_API_TOKEN` still has old custom token value** — user may not have saved the update correctly. Global API Key looks like `e7f...` (48 chars), custom tokens look like `v1.0-...`.
2. **`apiEmail` + Global API Key combo not working with wrangler-action@v3** — wrangler-action v3 may prefer a scoped API token over Global API Key. The `apiEmail` field may conflict.
3. **Account ID mismatch** — the `CLOUDFLARE_ACCOUNT_ID` was also recently updated; worth double-checking.

---

## Recommended Next Steps

### Option A — Fix the token (most likely fix)
Switch back to a **scoped API token** (not Global API Key) with these exact permissions:
- **Workers Scripts: Edit** (Account level)
- **D1: Edit** (Account level)
- **Account Settings: Read** (Account level)
- Scope: **Account** (NOT Zone, NOT User)

Remove `apiEmail` from the workflow — it's only needed for Global API Key auth and may be causing conflicts with token auth.

### Option B — Try `CLOUDFLARE_API_TOKEN` only (no `apiEmail`)
Revert workflow to just `apiToken` + `accountId`, no `apiEmail`. Then create a fresh scoped token.

### Option C — Use `wrangler-action@v4` 
v4 has better auth error messages. Worth trying:
```yaml
uses: cloudflare/wrangler-action@v4
```

---

## D1 Migration Status

The migration SQL at `workers/audit-signup/migrations/0001_initial.sql` has **NOT been run yet**. This needs to be done manually via the Cloudflare D1 Console before the worker can handle requests. Worker must deploy first.

---

## Worker Secrets (not yet set)

These need to be set in Cloudflare Workers dashboard after deploy:
- `TURNSTILE_SECRET`
- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`
- `GITHUB_TOKEN`
