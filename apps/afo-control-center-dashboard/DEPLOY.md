# Deploy AFO Control Center Dashboard

This folder now contains a GitHub-first scaffold for the Control Center Dashboard.

## Files

- `README.md` — product intent and route plan.
- `index.html` — polished standalone dashboard UI.
- `package.json` — Wrangler scripts.
- `wrangler.toml` — Cloudflare Worker config.
- `worker.js` — deployable Worker shell with API proxy routes.

## Current behavior

`worker.js` serves a lightweight fallback shell and exposes these routes:

- `/api/status`
- `/api/workers`
- `/api/mcp-apps`
- `/api/tools`
- `/api/d1`
- `/api/endpoints`
- `/api/queue`
- `/api/audits`
- `/api/repairs`
- `/api/export`

The inventory routes proxy to `https://browser.agentfeedoptimization.com` using `AFO_BROWSER_URL` from `wrangler.toml`.

## Next patch

Serve the polished `index.html` from the Worker. There are two clean options:

1. Inline the contents of `index.html` into the Worker response.
2. Convert this folder to a Cloudflare Workers static-assets project and serve `index.html` as an asset.

Option 2 is preferred once the repo deployment flow is settled.

## Local commands

```bash
cd apps/afo-control-center-dashboard
npm install
npm run dev
npm run check
npm run deploy
```

## Production target

```text
https://control.agentfeedoptimization.com/
```
