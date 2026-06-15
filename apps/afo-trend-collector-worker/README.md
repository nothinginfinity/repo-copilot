# AFO Trend Collector Worker

Specialized worker that seeds and crawls technology sources so the source-backed `/news` feed stays alive.

## Tools

- `trend_collector_status`
- `seed_technology_sources`
- `crawl_trend_sources`
- `collect_trends`
- `list_trend_runs`

## Browser routes

- `/`
- `/console`
- `/seed`
- `/crawl?limit=25&items_per_source=5`
- `/trends`
- `/health`

## Schedule

Wrangler config includes an hourly cron trigger placeholder: `17 * * * *`.
