# AFO Article Metadata Worker

Specialized Discovery Mode worker for the `article_metadata_worker` role.

It extracts public page/article metadata and writes normalized rows to the shared AFO discovery database.

## Tools

- `article_metadata_status`
- `extract_article_metadata`
- `run_article_metadata_job`
- `list_recent_article_metadata`

## Browser routes

- `/`
- `/console`
- `/run?url=https://example.com/article`
- `/health`
