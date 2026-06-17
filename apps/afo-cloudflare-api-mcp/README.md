# afo-cloudflare-api-mcp

A token-efficient MCP server for the entire Cloudflare API, modeled on Cloudflare's own
[cloudflare/mcp](https://github.com/cloudflare/mcp) "code mode" pattern but without OAuth or
arbitrary code execution — just two tools that read a cached OpenAPI index instead of one
tool per endpoint.

## Tools

| Tool | Description |
|---|---|
| `cf_api_status` | Health check, binding presence, spec-seeded status |
| `search` | Search the Cloudflare OpenAPI spec by free text and/or product tag |
| `call` | Call any Cloudflare API v4 endpoint directly (method, path, query, body) |
| `seed_spec` | Fetch the latest spec from `cloudflare/api-schemas` on GitHub and rebuild the R2 index |

## Why this exists

The Cloudflare API has 2,500+ endpoints. Registering one MCP tool per endpoint costs hundreds
of thousands of tokens just in schemas. This worker instead exposes two tools: `search` finds
the right endpoint from a lean index (method, path, tags, summary only — no full param
schemas), and `call` hits it directly with the account's API token attached. This also means
new Cloudflare resource types (KV, R2, D1, Vectorize, DNS, etc.) no longer need their own
single-purpose admin MCP worker — one `call` covers all of them.

## Setup (one time)

1. Deploy this worker (handled by the deploy pipeline).
2. In the Cloudflare dashboard, open this worker → Settings → Variables and Secrets, and add:
   - `CF_API_TOKEN` (secret) — same token used by the other AFO admin MCPs
   - `CF_ACCOUNT_ID` (secret or plain text) — `280908cb4e54b81745740accf5f0500f`
3. Confirm the R2 binding `SPEC` → bucket `afo-site-content` is attached (set via the deploy
   pipeline; check Settings → Bindings if `cf_api_status` reports `SPEC: false`).
4. Call `seed_spec` once (or `GET /admin/seed`) to populate the index. Re-run any time you want
   to pick up newly added Cloudflare endpoints.

## Notes

- Spec index is stored at R2 key `cf-openapi-spec/index.json` inside the shared
  `afo-site-content` bucket — no dedicated bucket needed.
- `call` auto-substitutes the literal `{account_id}` in a path with the `account_id` argument
  or `env.CF_ACCOUNT_ID` if omitted. Zone-scoped paths (`{zone_id}`) must be resolved by the
  caller.
- Responses over ~30k characters are truncated with a note; narrow the query or use
  pagination params (`per_page`, `page`, `cursor`) for large result sets.
