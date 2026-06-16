# AFO Micro Mail Worker Setup Status

## Completed

- Worker implementation exists at `workers/afo-micro-mail-worker/worker.js`.
- D1 schema exists at `workers/afo-micro-mail-worker/schema.sql`.
- Wrangler config exists at `workers/afo-micro-mail-worker/wrangler.jsonc`.
- Deploy instructions exist at `workers/afo-micro-mail-worker/DEPLOY.md`.
- Package scripts exist at `workers/afo-micro-mail-worker/package.json`.
- Manual GitHub Actions workflow exists at `.github/workflows/afo-micro-mail-worker.yml`.

## Still required before first successful deploy

- Replace placeholder D1 database ID in `wrangler.jsonc`.
- Replace placeholder KV namespace ID in `wrangler.jsonc`.
- Confirm R2 bucket `afo-micro-mail` exists.
- Confirm Vectorize index `afo-micro-mail-vectors` exists.
- Ensure GitHub repository secrets exist:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

## Manual workflow

Run the workflow named `AFO Micro Mail Worker` from GitHub Actions. It supports manual inputs for applying the D1 schema, dry-run validation, and deployment.
