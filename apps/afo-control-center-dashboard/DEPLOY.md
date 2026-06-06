# Deploy AFO Control Center Dashboard

This folder contains the GitHub-first scaffold for the AFO Control Center Dashboard.

## Files

- `README.md` - product intent and route plan.
- `index.html` - polished standalone dashboard UI.
- `worker.js` - source Worker shell with API proxy routes and fallback HTML marker.
- `build-inline.mjs` - generates `worker.generated.js` by inlining `index.html` into `worker.js`.
- `worker.generated.js` - generated deploy target. Do not edit by hand.
- `package.json` - build, dev, check, and deploy scripts.
- `wrangler.toml` - Cloudflare Worker config. Its `main` points at `worker.generated.js`.

## Current behavior

The generated Worker serves the polished dashboard at `/` and exposes these routes:

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

Queue, audit, and repair routes are placeholders until wired to the runtime queue, audit receipt, and Toolsmith repair surfaces.

## Local commands

```bash
cd apps/afo-control-center-dashboard
npm install
npm run build
npm run dev
npm run check
npm run deploy
```

## Production target

```text
https://control.agentfeedoptimization.com/
```

## Next patch

Add CI/CD for this subfolder and decide whether production deploy should stay as generated single-file Worker or move to Cloudflare Workers static assets.
