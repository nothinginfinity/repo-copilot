# CairnStone GitHub Vault MCP

A standalone Cloudflare Worker MCP/app that turns GitHub repositories into a searchable, relationship-aware stone vault.

## What it does

- Lists and indexes GitHub repos.
- Stones meaningful files into D1.
- Extracts cheap capability flags from source/docs/config files.
- Builds repo chain manifests.
- Searches across all indexed repos.
- Discovers likely repo combinations such as podcast pipelines feeding 3D UI runtimes.

## MCP tools

- `github_vault_status`
- `stone_github_account`
- `stone_github_repo`
- `stone_github_file`
- `query_github_vault`
- `get_repo_manifest`
- `discover_repo_combinations`
- `refresh_changed_repos`

## Required bindings

- `DB`: Cloudflare D1 database.
- `GITHUB_TOKEN`: secret text binding with repo read access.

## Deploy

Create a D1 database named `github_stone_vault`, replace the placeholder database id in `wrangler.jsonc`, then run:

```bash
npm install
npx wrangler d1 execute github_stone_vault --file=schema/001_initial.sql
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

## Smoke test

```bash
curl https://cairnstone-github-vault-mcp.<your-subdomain>.workers.dev/health
curl "https://cairnstone-github-vault-mcp.<your-subdomain>.workers.dev/api/search?q=podcast%203d"
```

## First real indexing call

```bash
curl -X POST https://cairnstone-github-vault-mcp.<your-subdomain>.workers.dev/mcp/call \
  -H "content-type: application/json" \
  -d '{"tool":"stone_github_repo","input":{"repo":"nothinginfinity/dogfoodma","max_files":80}}'
```

Then query:

```bash
curl "https://cairnstone-github-vault-mcp.<your-subdomain>.workers.dev/api/search?q=Joe%20Rogan%203D%20podcast%20explorer"
```

## Design note

This is intentionally independent of the main CairnStone graph at v0.1. It produces CairnStone-compatible chains, stones, refs, HEAD-like file mappings, and edges. Once stable, it can sync into the canonical CairnStone graph.
