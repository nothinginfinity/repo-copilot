# AFO Source Registry Worker

Source intake and routing layer for the Discovery Mesh.

It stores public source URLs and suggests the specialized worker that should handle them.

## Tools

- `source_registry_status`
- `add_source`
- `bulk_add_sources`
- `list_sources`
- `route_source_to_worker`
- `crawl_source_batch`

## Browser routes

- `/`
- `/console`
- `/add?url=https://example.com/feed.xml`
- `/sources`
- `/batch`
- `/health`
