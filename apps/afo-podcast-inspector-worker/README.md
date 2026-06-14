# AFO Podcast Inspector Worker

Specialized Discovery Mode worker for the `podcast_inspector` role.

It shares the AFO discovery D1/KV database and writes podcast episode rows to `discovery_index`.

## Tools

- `podcast_inspector_status`
- `inspect_podcast_feed`
- `run_podcast_inspection_job`
- `list_recent_podcast_episodes`

## Browser routes

- `/`
- `/console`
- `/run?url=https://feeds.npr.org/510289/podcast.xml`
- `/health`
