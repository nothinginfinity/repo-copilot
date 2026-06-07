# AFO Control Center Dashboard Status

Updated: 2026-06-06

## Current state

The GitHub-first Control Center Dashboard scaffold exists at:

```text
apps/afo-control-center-dashboard/
```

Files currently included:

- `README.md` - product intent, route plan, and build direction.
- `index.html` - polished standalone dashboard UI.
- `worker.js` - Cloudflare Worker shell with API proxy routes.
- `build-inline.mjs` - generates `worker.generated.js` by inlining `index.html` into `worker.js`.
- `package.json` - build/dev/check/deploy commands.
- `wrangler.toml` - Worker config pointing at `worker.generated.js`.
- `DEPLOY.md` - deploy notes.
- `.github/workflows/afo-control-center-dashboard.yml` - CI workflow for this subfolder.

## What works conceptually

The dashboard UI expects these routes:

```text
/api/status
/api/workers
/api/mcp-apps
/api/tools
/api/d1
/api/endpoints
/api/queue
/api/audits
/api/repairs
/api/export
```

The Worker shell proxies inventory routes to:

```text
https://browser.agentfeedoptimization.com
```

Queue, audit, and repair routes currently return placeholders so the UI can render those tabs before the backend is wired.

## Important build note

`wrangler.toml` points at:

```text
worker.generated.js
```

That file is not committed by default. It is generated locally or in CI with:

```text
npm run build
```

Package scripts have been cleaned up so Wrangler reads `worker.generated.js` from `wrangler.toml` instead of receiving it as a positional argument.

Verification pass: package scripts, Wrangler `main`, Worker fallback marker, and inline build paths are consistent for a local dry run.

## Next concrete steps

1. Run the build script and verify `worker.generated.js` is created.
2. Run the Wrangler dry run from the dashboard folder.
3. Deploy to a preview Worker first.
4. Confirm `/api/status` returns JSON.
5. Confirm `/` serves the polished dashboard, not the fallback shell.
6. After preview works, attach or route to `control.agentfeedoptimization.com`.

## Next product steps

1. Wire `/api/queue` to the runtime queue MCP or Control Center queue table.
2. Wire `/api/audits` to audit receipt/page-audit results.
3. Wire `/api/repairs` to Toolsmith repair jobs and Cloudflare apply MCP.
4. Add row actions that actually enqueue audit/repair jobs.
5. Add user-facing auth before making repair actions destructive.

## Recommended product order

```text
1. Control Center Dashboard
2. UI Belt Composer
3. Unified AFO Shell
```
