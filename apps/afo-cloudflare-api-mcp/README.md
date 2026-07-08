# afo-cloudflare-api-mcp

A schema-clean, read-only Cloudflare verifier MCP surface for AFO Cloud-Loop safety work.

As of v0.7.10, the default connector surface is intentionally read-only. It is designed for fresh-chat safety: the public manifest lists only status, verifier, Worker inspection, bound-D1 resolution, D1 schema preflight, D1 table inventory, and cached docs search/excerpt tools.

## Default visible tools

| Tool | Description |
|---|---|
| `cf_api_status` | Health check, binding presence, version, visible tools, and schema profile |
| `ask_cloud_loop` | Supervised read-only Cloud-Loop verifier with forward evidence, inverse safety agents, verification, convergence, and receipts |
| `verify_v078_inverse_agents_readonly` | One-shot read-only verifier for Worker settings and optional bound-D1 schema preflight evidence |
| `get_worker_settings_readonly` | Reads Worker binding names/types and safe compatibility metadata without returning secret values or changing settings |
| `resolve_worker_bound_d1_readonly` | Reads Worker settings and resolves D1 binding choices without changing Cloudflare resources |
| `d1_schema_preflight_readonly` | Performs read-only D1 schema preflight and proposed SQL text audit without applying SQL |
| `list_d1_tables_readonly` | Lists D1 table names through read-only schema inventory |
| `search_cloudflare_docs` | Searches the cached Cloudflare docs knowledge base |
| `get_cloudflare_doc_excerpt` | Reads a focused cached docs excerpt around a query |

## Safety boundary

The default manifest does not register admin/write/deploy/D1 execution tools. Any future admin surface must be separate or explicitly admin-gated so the read-only verifier remains safe at tool-discovery time, not merely hidden at runtime.

The read-only surface must not deploy Workers, replace bindings, execute D1 write/DDL SQL, mutate skills/spec indexes, or perform generic authenticated Cloudflare endpoint calls.

## Why this exists

Earlier versions proved that hiding risky tools at runtime was not enough. Fresh-context testing of v0.7.9 showed the live status endpoint reported the correct 9-tool read-only surface, but the platform/tool-discovery layer could still see stale or broad schemas and blocked read-only runtime verification calls before they reached the Worker.

v0.7.10 makes the repo manifest match the intended default surface:

```text
status + verifier + read-only Worker/D1/docs tools only
```

## Validation expectations

A fresh-context test should be able to:

1. call `cf_api_status` and confirm version `0.7.10` after deployment;
2. see only the 9 default read-only tools in the connector/manifest surface;
3. run read-only Worker settings verification for `contractor-v004-demo`;
4. run read-only bound-D1 schema preflight using `proposed_sql_text` only;
5. receive inverse packets and receipts showing no deploys, no binding changes, no Cloudflare writes, and no D1 write/DDL execution.

## Setup notes

The Worker still requires the existing bindings used by the verifier runtime:

- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`
- `GITHUB_TOKEN`
- `SPEC` R2 bucket binding
- `AI` binding

The spec/docs cache remains stored under the shared `afo-site-content` R2 bucket.
