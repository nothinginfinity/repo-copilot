# afo_inventory_read_mcp

Read-only Cloudflare/D1/R2/tool inventory plus GitHub snapshots.

## Plane

Inventory / Read Plane

## Status

v0 scaffold with real Cloudflare read helpers and `inspect_worker_bindings`.

## Required secrets/vars

- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`
- `GITHUB_TOKEN` for snapshot writes
- `DEFAULT_OWNER` optional
