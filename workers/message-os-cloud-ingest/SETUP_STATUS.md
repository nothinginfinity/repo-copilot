# Message OS Cloud Ingest — Setup Status

## Status

```text
Deployed: yes
Worker: message-os-cloud-ingest
Created: 2026-06-16
Deployment ID: 5607d04572204f2588836311661c390c
```

## Live endpoint

```text
https://message-os-cloud-ingest.jaredtechfit.workers.dev/api/ingest
```

## Health endpoint

```text
https://message-os-cloud-ingest.jaredtechfit.workers.dev/health
```

## GitHub source of truth

```text
workers/message-os-cloud-ingest/
```

## Binding

```text
DB: 0060f4f3-5a4c-4156-a8ee-be9020671d61
```

## Integration target

AFO Micro Mail should post Message OS bridge events to the ingest endpoint using a Message OS connector token.

Required micro-mail vars:

```text
MESSAGE_OS_INGEST_URL=https://message-os-cloud-ingest.jaredtechfit.workers.dev/api/ingest
MESSAGE_OS_TOKEN=<Message OS connector token>
```

## Notes

This Worker is intentionally separate from `message-os-cloud` to avoid overwriting the existing login/dashboard/MCP app. It writes into the same D1 schema and relies on the existing MCP `check_inbox` behavior.
