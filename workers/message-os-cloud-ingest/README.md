# Message OS Cloud Ingest

Companion Cloudflare Worker for Message OS Cloud.

It provides a dedicated HTTP ingest endpoint for external systems such as AFO Micro Mail without replacing the existing `message-os-cloud` login/dashboard/MCP Worker.

## Live URLs

```text
https://message-os-cloud-ingest.jaredtechfit.workers.dev/health
https://message-os-cloud-ingest.jaredtechfit.workers.dev/api/ingest
```

## Routes

```text
GET  /health
POST /api/ingest
```

## Authentication

`POST /api/ingest` requires a valid Message OS connector token. The token is checked against the existing `connector_tokens` table in the Message OS D1 database.

Supported token locations:

```text
Authorization: Bearer <mos_live_...>
x-message-os-token: <mos_live_...>
?token=<mos_live_...>
```

## Payload

The endpoint accepts a structured external message payload. AFO Micro Mail should send the same payload shape produced by its Message OS bridge.

```json
{
  "source": "afo-micro-mail-worker",
  "type": "email.received",
  "project": "project-demo",
  "subject": "📬 New email",
  "summary": "Client sent an update.",
  "body": "Full email body or normalized text...",
  "metadata": {
    "mailbox_slug": "project-demo",
    "message_id": "msg_...",
    "from_addr": "client@example.com",
    "to_addr": "project-demo@example.com",
    "r2_key": "mailboxes/project-demo/messages/msg_....eml"
  }
}
```

## Storage behavior

The Worker inserts one unread row into the existing Message OS `user_messages` table for the owner of the connector token. This allows the existing ChatGPT/Claude `check_inbox` MCP tool to surface micro-mail messages without modifying the original `message-os-cloud` Worker.

## Cloudflare bindings

```text
DB: D1 database 0060f4f3-5a4c-4156-a8ee-be9020671d61
```

## Micro Mail configuration

Set these on `afo-micro-mail-worker`:

```text
MESSAGE_OS_INGEST_URL=https://message-os-cloud-ingest.jaredtechfit.workers.dev/api/ingest
MESSAGE_OS_TOKEN=<Message OS connector token from dashboard Setup tab>
```
