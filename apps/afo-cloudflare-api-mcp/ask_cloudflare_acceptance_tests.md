# ask_cloudflare read-only acceptance tests

All cases below are read-only. None require mutation permission.

## A. Health

Tool: `cf_api_status`

Expected:

- `status` is `ok`
- `tools` includes `ask_cloudflare`
- spec index is seeded

## B. Workers list

Tool: `ask_cloudflare`

Input:

```json
{
  "request": "Read-only test: list Workers scripts visible to this account. Return count, first few script names, selected endpoint, final resolved path, and audit trail. Do not mutate anything.",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /accounts/{account_id}/workers/scripts`
- result includes Worker IDs
- audit includes `final_resolved_path`

## C. D1 list

Tool: `ask_cloudflare`

Input:

```json
{
  "request": "Read-only test: list D1 databases visible to this account. Return count, first few names and UUIDs, selected endpoint, final resolved path, and audit trail. Do not mutate anything.",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /accounts/{account_id}/d1/database`
- result includes database names or UUIDs
- audit includes `final_resolved_path`

## D. Worker settings with path param

Tool: `ask_cloudflare`

Input:

```json
{
  "request": "Read-only test: get Worker settings for script_name exactly afo-agent-router-mcp. Return compatibility date and binding names/types only. Do not mutate anything.",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /accounts/{account_id}/workers/scripts/{script_name}/settings`
- extracted `script_name` is `afo-agent-router-mcp`
- final resolved path contains `/workers/scripts/afo-agent-router-mcp/`
- result includes `compatibility_date: 2025-01-01`
- binding names include `AI`, `GITHUB_TOKEN`, `ROUTER_DB`, `SVC_CF_API`, and `WORKER_NAME`

## E. Worker settings dry run

Tool: `ask_cloudflare`

Input:

```json
{
  "request": "Dry run only: get Worker settings for script_name exactly afo-agent-router-mcp.",
  "dry_run": true
}
```

Expected:

- `ok: true`
- `dry_run: true`
- selected endpoint is `GET /accounts/{account_id}/workers/scripts/{script_name}/settings`
- extracted `script_name` is `afo-agent-router-mcp`
- final resolved path contains `/workers/scripts/afo-agent-router-mcp/`
- unresolved path params is empty
