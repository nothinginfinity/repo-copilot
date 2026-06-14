# AFO Feed Discoverer Worker

Specialized Discovery Mode worker for the `feed_discoverer` role.

It shares the same D1/KV database pattern as the Public Content Discovery MCP and writes compatible rows into:

- `discovery_index`
- `discovery_receipts`
- `discovery_jobs`
- `discovery_job_steps`

## Tools

- `feed_discoverer_status`
- `discover_public_feeds`
- `run_feed_discovery_job`
- `list_recent_feed_discoveries`

## Browser routes

- `/`
- `/console`
- `/run?url=https://example.com`
- `/health`
