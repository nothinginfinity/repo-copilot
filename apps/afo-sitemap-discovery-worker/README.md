# AFO Sitemap Discovery Worker

Specialized Discovery Mode worker for the `sitemap_worker` role.

It inspects public sitemap XML files and writes normalized URL rows to the shared AFO discovery database.

## Tools

- `sitemap_discovery_status`
- `inspect_sitemap`
- `run_sitemap_discovery_job`
- `list_recent_sitemap_urls`

## Browser routes

- `/`
- `/console`
- `/run?url=https://example.com/sitemap.xml`
- `/health`
