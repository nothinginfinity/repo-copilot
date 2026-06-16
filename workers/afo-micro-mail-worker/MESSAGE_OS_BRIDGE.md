# Message OS Bridge

AFO Micro Mail can now emit inbound email events into a Message OS-compatible ingest endpoint so users can receive project mail inside ChatGPT, Claude, or any AFO-style connector that reads Message OS.

## Flow

```text
External email
→ Cloudflare Email Worker
→ AFO Micro Mail Worker
→ D1 metadata + R2 raw email + Vectorize embedding
→ Workers AI summary/classification
→ Message OS ingest event
→ ChatGPT / Claude connector inbox
```

## Runtime vars

Set these in `wrangler.jsonc` or through the manual GitHub Action inputs:

```text
MESSAGE_OS_INGEST_URL   Message OS ingest endpoint. Leave blank to disable bridge.
MESSAGE_OS_TARGET_USER   Target user, default: jared
MESSAGE_OS_BRIDGE_MODE   Current mode: notify
MESSAGE_OS_BODY_LIMIT    Max clean email body chars sent to Message OS, default: 6000
```

Set this as a Worker secret when the ingest endpoint requires auth:

```text
MESSAGE_OS_TOKEN
```

The manual workflow reads the GitHub repository secret `MESSAGE_OS_TOKEN` and writes it to the Cloudflare Worker secret with Wrangler.

## Test endpoint

After deploy, test bridge emission with:

```bash
curl -X POST https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/api/message-os/test \
  -H 'content-type: application/json' \
  -d '{
    "mailbox_slug": "project-demo",
    "from_addr": "client@example.com",
    "subject": "Bridge test",
    "body": "This should appear as an in-chat mail event."
  }'
```

## Payload shape

The Worker emits a structured event similar to:

```json
{
  "source": "afo-micro-mail-worker",
  "type": "email.received",
  "to_user": "jared",
  "project": "project-demo",
  "subject": "📬 Updated proposal",
  "body": "New email received in project-demo...",
  "summary": "Client sent a revised proposal.",
  "priority": "normal",
  "tags": ["email", "micro-mail", "mailbox:project-demo"],
  "metadata": {
    "mailbox_slug": "project-demo",
    "message_id": "msg_...",
    "from_addr": "client@example.com",
    "to_addr": "project-demo@example.com",
    "r2_key": "mailboxes/project-demo/messages/msg_....eml"
  }
}
```

## Current behavior

The bridge is non-blocking for normal email ingestion. If Message OS emission fails, the email is still stored in D1/R2 and the failure is written to `agent_events`.
