# afo-inline-renderer-debundler-mcp

**Version:** 0.1.0  
**Type:** AFO MCP Worker — Inline Renderer Debundler  
**Deployed at:** `https://afo-inline-renderer-debundler-mcp.jaredtechfit.workers.dev/`

---

## What it does

Splits large server-side render functions that contain embedded HTML/CSS/client-side JS strings into maintainable modules — without changing runtime behavior.

This is a *different* class of tool from the Worker debundler. The Worker debundler targets single-file CF Worker bundles. This tool targets individual render files inside an already-modular repo where one file has grown too large to edit safely.

---

## Tools

### `inline_debundler_status`
Health check. Returns version and binding status.

### `analyze_inline_renderer`
Dry-run only. Reads the target file from GitHub and returns:
- Detected exported function name
- Top-level imports
- Whether CSS / HTML / `<script>` blocks were found
- Server-side interpolation variables
- Proposed output file plan
- Risk level (low / medium / high)

**Does not write anything.**

### `debundle_inline_renderer`
Performs the split and commits to GitHub:

| Output file | Contents |
|---|---|
| `{dir}/styles.js` | Extracted CSS template string |
| `{dir}/client_script.js` | Client-side script as a parameterized string builder |
| `{dir}/template.js` | HTML template stub (requires manual fill-in) |
| `{dir}/index.js` | Scaffold re-export (requires manual wiring) |
| `{dir}/DEBUNDLE_NOTES.md` | Step-by-step instructions to complete the debundle |
| `{file}.bak` | Backup of original file |
| `{file}` | Compatibility wrapper: `export { fn } from './{dir}/index.js'` |

> **Note:** `template.js` and `index.js` are generated as stubs that will throw until manually filled in. This is by design — the HTML extraction boundary requires human review to get right. The `DEBUNDLE_NOTES.md` explains exactly what to do.

### `verify_inline_debundle`
After manual fill-in, verifies:
- Compatibility wrapper exists at original path
- All sub-files exist
- `index.js` exports the correct function name
- `template.js` + `client_script.js` contain expected UI/API markers
- Reports stub status clearly

---

## Safety rules (enforced by design)

1. Never writes to `watersedge-v2-dev` or any live repo unless you explicitly pass that repo name.
2. Always creates `.bak` backup before touching original file.
3. `analyze_inline_renderer` is always a dry-run — no writes.
4. `debundle_inline_renderer` supports `dry_run: true` for a preview before committing.
5. Every write is a separate commit with a descriptive message.
6. `verify_inline_debundle` must be run after manual fill-in before any test deploy.

---

## Required secrets

Set via Cloudflare dashboard or `wrangler secret put`:

| Secret | Description |
|---|---|
| `GITHUB_TOKEN` | Fine-grained PAT with `contents:read+write` on lab repos |

---

## First target

```
Owner:  nothinginfinity
Repo:   watersedge-v2-debundle-lab   <- lab only, never dev
File:   workers/watersedge-v2-debundle-lab/src/render/chat_room_v2.js
```

Stable baseline:
- Commit: `5073cf7aaa5c2d53c90458f56d504ad7ad13a575`
- Renderer SHA: `418eac97deb2f00113ed163ac229c9a3fe31fac0`

---

## Workflow

```
1. analyze_inline_renderer   -> dry-run, inspect plan
2. debundle_inline_renderer  -> commit stubs + backup
3. Manually edit template.js -> fill in HTML template
4. Manually edit index.js    -> wire up styles + script + template
5. verify_inline_debundle    -> confirm markers pass
6. Deploy lab worker         -> manual smoke test
7. Port to live only after Jared confirms lab version works
```
