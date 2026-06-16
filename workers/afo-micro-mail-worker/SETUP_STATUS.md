# AFO Micro Mail Worker Setup Status

## Completed

- Worker implementation exists at `workers/afo-micro-mail-worker/worker.js`.
- D1 schema exists at `workers/afo-micro-mail-worker/schema.sql`.
- Wrangler config exists at `workers/afo-micro-mail-worker/wrangler.jsonc`.
- Deploy instructions exist at `workers/afo-micro-mail-worker/DEPLOY.md`.
- Package scripts exist at `workers/afo-micro-mail-worker/package.json`.
- Manual GitHub Actions workflow exists at `.github/workflows/afo-micro-mail-worker.yml`.
- The manual workflow now creates or reuses Cloudflare D1, KV, R2, and Vectorize resources.
- The manual workflow patches `wrangler.jsonc` during the run.
- The manual workflow can optionally commit the resolved D1/KV IDs back to GitHub.
- The manual workflow can apply `schema.sql` and deploy the Worker.

## Required GitHub repository secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Manual workflow

Run the workflow named `AFO Micro Mail Worker` from GitHub Actions.

Recommended first-run inputs:

- `setup_resources`: true
- `commit_wrangler_ids`: true
- `apply_schema`: true
- `smoke_test`: true
- `deploy_worker`: true
- `mail_domain`: replace `example.com` with the real mail domain

## Notes

The workflow performs the live Cloudflare work. The current chat session updated the repository, but did not directly execute the GitHub Action run.
