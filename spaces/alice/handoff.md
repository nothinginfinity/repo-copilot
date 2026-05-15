# Alice Handoff
_session: 2026-05-14 | status: blocked | next-action: fix Cloudflare auth_

---

## Current State

Deploying `afo-audit-signup` Cloudflare Worker via GitHub Actions. Blocked on **authentication error (code: 10000)** after 13 failed runs. Three prior bugs were fixed. Worker code and D1 config are correct — only auth is broken.

---

## Repo
`nothinginfinity/parallel-internet-sites`  
Worker path: `workers/audit-signup/`

---

## What Was Fixed This Session

| Fix | File |
|-----|------|
| Added missing `package.json` | `workers/audit-signup/package.json` |
| Removed `[[routes]]` block (caused code 7003) | `workers/audit-signup/wrangler.toml` |
| Removed unsupported `--log-level debug` flag | `.github/workflows/deploy-audit-signup.yml` |
| Added `apiEmail` for Global API Key auth attempt | `.github/workflows/deploy-audit-signup.yml` |

---

## Current Error

```
ERROR A request to the Cloudflare API (/accounts/***/workers/services/afo-audit-signup) failed
Authentication error [code: 10000]
Please ensure it has the correct permissions for this operation.
```

---

## Current wrangler.toml
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

---

## Current Workflow
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

## GitHub Secrets (as of session end)

| Secret | Status |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | Set to Global API Key (last updated ~5:05 PM 2026-05-14) |
| `CLOUDFLARE_API_EMAIL` | `getfitdoc@me.com` |
| `CLOUDFLARE_ACCOUNT_ID` | Full 32-char UUID |

---

## Hypothesis

Most likely cause: `apiEmail` + Global API Key combo is conflicting with wrangler-action@v3. The `apiEmail` field is a legacy Global API Key signal — when both `apiToken` and `apiEmail` are present, wrangler may be treating the token as a Global Key but the value isn't correct format, or the token was never actually saved as the Global Key.

---

## Recommended Next Steps (priority order)

1. **Create a fresh scoped API token** on Cloudflare with:
   - Workers Scripts: Edit (Account scope)
   - D1: Edit (Account scope)
   - Account Settings: Read (Account scope)
   - Scope set to **Account** (not Zone, not User)
2. **Update `CLOUDFLARE_API_TOKEN`** in GitHub Secrets with the new token value
3. **Remove `apiEmail`** from the workflow (only needed for Global Key, conflicts with scoped tokens)
4. Re-run the workflow

If still failing after above — try upgrading to `wrangler-action@v4`.

---

## Still Pending After Deploy

- Run D1 migration via Cloudflare console (`workers/audit-signup/migrations/0001_initial.sql`)
- Set 5 Worker secrets: `TURNSTILE_SECRET`, `EMAIL_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `GITHUB_TOKEN`
