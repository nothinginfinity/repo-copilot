# Roadmap

## v0.1 MVP

- Cloudflare Worker MCP server.
- D1 schema.
- GitHub repo/file indexing.
- File stones.
- Keyword search.
- Repo manifests.
- Basic relationship discovery.

## v0.2 Parsing depth

- Better JS/TS parsing.
- Cloudflare binding extraction.
- Route extraction.
- package.json dependency graph.
- wrangler config normalization.

## v0.3 CairnStone graph sync

- Export stones to canonical CairnStone.
- Support HEAD pointers.
- Use edge types: documents, references, supersedes, patches, can_feed, can_visualize.

## v0.4 Discovery cockpit

- Add 3D repo/app explorer UI.
- Show forgotten apps.
- Show candidate fusions.
- Show live Cloudflare deployment links when available.

## v0.5 Incremental jobs

- Durable Object or Queue-backed account indexing.
- R2 raw snapshots.
- KV hot cache.
- resumable jobs.
