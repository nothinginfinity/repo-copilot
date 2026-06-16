# AFO Micro Mail Worker

AI-native, project-based micro email service for Cloudflare Workers.

This Worker is designed as a starting point for disposable/project inboxes that are easy for LLMs and agents to consume. It uses Cloudflare edge primitives:

- **Workers** for API + inbound email event handling
- **D1** for mailbox/message metadata
- **R2** for raw email, exports, and attachment payloads
- **KV** for fast mailbox/routing configuration
- **Vectorize** for semantic message search and agent memory
- **Workers AI** for summarization, classification, and reply drafting

## Product shape

A mailbox is treated as a short-lived or project-scoped data capsule:

```text
project-abc@yourdomain.com
client-demo-492@yourdomain.com
intake-7day@yourdomain.com
agent-inbox-llm@yourdomain.com
```

Each mailbox can be exported and then deleted. Deletion is designed to remove D1 rows, KV routing config, R2 raw objects, and Vectorize vectors, then leave a deletion receipt.

## Current endpoints

```text
GET  /
GET  /health
POST /api/mailboxes
GET  /api/mailboxes
GET  /api/mailboxes/:id
POST /api/mailboxes/:id/messages
GET  /api/mailboxes/:id/messages
GET  /api/mailboxes/:id/export
DELETE /api/mailboxes/:id
POST /api/ask
```

## Create a mailbox

```bash
curl -X POST https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/api/mailboxes \
  -H 'content-type: application/json' \
  -d '{
    "slug": "project-demo",
    "ttl_seconds": 604800,
    "purpose": "Temporary inbox for a project demo",
    "llm_enabled": true
  }'
```

## Ingest a message through the HTTP API

```bash
curl -X POST https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/api/mailboxes/project-demo/messages \
  -H 'content-type: application/json' \
  -d '{
    "from_addr": "client@example.com",
    "to_addr": "project-demo@example.com",
    "subject": "Updated proposal",
    "text": "Here is the revised proposal. Please review pricing by Friday.",
    "html": "<p>Here is the revised proposal. Please review pricing by Friday.</p>"
  }'
```

## Ask a mailbox

```bash
curl -X POST https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/api/ask \
  -H 'content-type: application/json' \
  -d '{
    "mailbox_id": "project-demo",
    "question": "What does the client need next?"
  }'
```

## Setup notes

1. Create a D1 database and apply `schema.sql`.
2. Create an R2 bucket for raw messages and exports.
3. Create a KV namespace for routing/config.
4. Create a Vectorize index for message embeddings.
5. Bind Workers AI as `AI`.
6. Add the bindings to `wrangler.jsonc`.
7. Configure Cloudflare Email Routing to invoke this Worker for inbound addresses.

The `wrangler.jsonc` file intentionally uses placeholder IDs. Replace them with your actual Cloudflare resource IDs before deploy.

## Inbound email

Cloudflare Email Workers call the exported `email(message, env, ctx)` handler. This Worker stores a minimal raw representation and metadata. For richer MIME parsing, add `postal-mime` later or route the raw message to a parser Worker.

## Status

This is a seed implementation, not a production mail provider. Before using it for real users, add authentication, abuse controls, rate limits, verified ownership of domains, SPF/DKIM/DMARC configuration, attachment scanning, outbound sending policy, and deletion receipts with audit verification.
