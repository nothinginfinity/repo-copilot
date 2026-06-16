# AFO Micro Mail Worker Setup Status

## Completed

- Worker implementation exists at `workers/afo-micro-mail-worker/worker.js`.
- D1 schema exists at `workers/afo-micro-mail-worker/schema.sql`.
- Wrangler config exists at `workers/afo-micro-mail-worker/wrangler.jsonc`.
- Deploy instructions exist at `workers/afo-micro-mail-worker/DEPLOY.md`.
- Package scripts exist at `workers/afo-micro-mail-worker/package.json`.
- Manual GitHub Actions workflow exists at `.github/workflows/afo-micro-mail-worker.yml`.
- The manual workflow creates or reuses Cloudflare D1, KV, R2, and Vectorize resources.
- The manual workflow patches `wrangler.jsonc` during the run.
- The manual workflow can optionally commit the resolved D1/KV IDs back to GitHub.
- The manual workflow can apply `schema.sql` and deploy the Worker.
- Message OS bridge support has been added to `worker.js`.
- Message OS bridge docs exist at `workers/afo-micro-mail-worker/MESSAGE_OS_BRIDGE.md`.

## Message OS Bridge

The Worker can now emit every stored/summarized email as a Message OS-compatible event when `MESSAGE_OS_INGEST_URL` is configured.

Runtime vars:

- `MESSAGE_OS_INGEST_URL`
- `MESSAGE_OS_TARGET_USER`
- `MESSAGE_OS_BRIDGE_MODE`
- `MESSAGE_OS_BODY_LIMIT`

Optional secret:

- `MESSAGE_OS_TOKEN`

The workflow exposes manual inputs for `message_os_ingest_url` and `message_os_target_user`, and reads GitHub secret `MESSAGE_OS_TOKEN` if present.

## Required GitHub repository secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `MESSAGE_OS_TOKEN` only if the ingest endpoint requires auth

## Manual workflow

Run the workflow named `AFO Micro Mail Worker` from GitHub Actions.

Recommended first-run inputs:

- `setup_resources`: true
- `commit_wrangler_ids`: true
- `apply_schema`: true
- `smoke_test`: true
- `deploy_worker`: true
- `mail_domain`: replace `example.com` with the real mail domain
- `message_os_ingest_url`: paste the Message OS ingest endpoint, or leave blank until available
- `message_os_target_user`: `jared`

## Notes

The micro-mail side is now ready to emit chat-native mail events. Full end-to-end delivery requires a Message OS Cloud ingest endpoint that accepts the documented payload.
