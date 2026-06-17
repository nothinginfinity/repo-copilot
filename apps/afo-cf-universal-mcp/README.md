# afo-cf-universal-mcp

A 2-tool-search-pattern MCP server covering the entire Cloudflare API, instead of one
hand-built tool per endpoint. Inspired by `cloudflare/mcp`'s code-mode approach, but
simplified: no arbitrary code execution, just a searchable endpoint index + a generic
parameterized HTTP caller.

## How it works

1. `build_spec_index` fetches `cloudflare/api-schemas` openapi.json (~10MB) once, extracts
   a compact index (method, path, summary, tags, params) for every endpoint, and stores it
   in the `SPEC_KV` namespace. Run this once after deploy, and again any time you want to
   refresh against the latest Cloudflare API.
2. `search_endpoints` / `list_tags` let you find the right endpoint by keyword or product
   tag without ever loading the full spec into context.
3. `call_endpoint` calls any endpoint directly: `{method, path, path_params, query, body}`.
   `{account_id}` in the path is auto-filled from the bound `CF_ACCOUNT_ID`.

## Tools

| Tool | Description |
|---|---|
| `api_status` | Health check, binding presence, spec index status |
| `build_spec_index` | Fetch + index the full Cloudflare OpenAPI spec into KV |
| `list_tags` | List available product tags (Workers, KV, R2, D1, Vectorize, DNS, ...) with counts |
| `search_endpoints` | Keyword/tag/method search over the indexed endpoints |
| `call_endpoint` | Call any Cloudflare API v4 endpoint by method + path |

## Bindings required

- `CF_API_TOKEN` (secret) — Cloudflare API token
- `CF_ACCOUNT_ID` (secret) — Cloudflare account ID, auto-filled into `{account_id}` path params
- `SPEC_KV` (KV namespace binding) — stores the compact endpoint index

## Example flow

```
search_endpoints({ query: "create vectorize index" })
  -> { method: "POST", path: "/accounts/{account_id}/vectorize/v2/indexes", ... }

call_endpoint({
  method: "POST",
  path: "/accounts/{account_id}/vectorize/v2/indexes",
  body: { name: "my-index", config: { dimensions: 768, metric: "cosine" } }
})
```

## MCP endpoint

`https://afo-cf-universal-mcp.jaredtechfit.workers.dev/mcp`
