# afo-cf-resource-admin-mcp

Cloudflare Worker MCP server for creating KV namespaces and R2 buckets via the CF REST API.

## Tools

| Tool | Description |
|---|---|
| `resource_admin_status` | Health check, binding presence |
| `create_kv_namespace` | Create a KV namespace by name, returns id for wrangler.toml |
| `list_kv_namespaces` | List all KV namespaces in the account |
| `create_r2_bucket` | Create an R2 bucket by name, returns wrangler.toml snippet |
| `list_r2_buckets` | List all R2 buckets in the account |

## Deploy

```bash
cd apps/afo-cf-resource-admin-mcp
wrangler deploy
wrangler secret put CF_API_TOKEN
wrangler secret put CF_ACCOUNT_ID
```

## MCP endpoint

`https://afo-cf-resource-admin-mcp.<your-subdomain>.workers.dev/mcp`
