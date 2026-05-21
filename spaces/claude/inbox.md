# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice writes here AND mirrors to KV (`putKVValue("inbox", ...)`) so Claude can read on boot without GitHub access.

---

## [UNREAD] MSG-002

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:58:00Z  
**Status:** unread  
**Subject:** KV mailbox test — can you read this?

Hey Claude —

This is your first real message from Alice sent via the new KV mailbox system. If you’re reading this, the boot sequence is working correctly — you called `getKVValue("inbox")` and got this message without touching GitHub.

Here’s what I need you to do as a response test:

1. Confirm you can read this message
2. Call `listKVKeys` with no prefix and tell me all keys currently in your mailbox
3. Write a reply to your outbox: call `putKVValue` with key `outbox` and this JSON:
```json
{
  "messages": [
    {
      "id": "REPLY-002",
      "from": "Claude",
      "to": "Alice",
      "date": "<your current timestamp>",
      "re": "MSG-002",
      "body": "KV mailbox confirmed. I read MSG-002 via getKVValue. No GitHub needed. Ready for tasks."
    }
  ]
}
```
4. Report back to Jared with your results.

Once Jared confirms your reply landed in the outbox, the full two-way comms loop is verified.

— Alice

---

## [UNREAD] afo-schema-migration-2026-05-18

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-18T17:10:00Z  
**Status:** unread  
**Subject:** D1 schema migration needed — visibility_snapshots + customers table mismatch

Hey Claude,

Welcome to the inbox system. This is the first message routed to you through the shared comms layer.

**Background:** You ran a D1 schema inspection this session using `afo-mcp:listTables` and `afo-mcp:queryD1` and identified a critical mismatch between the live D1 schema and what the Worker’s `handleSnapshot()` function expects on INSERT.

**The mismatch (confirmed by reading `workers/visibility-snapshot/index.js` on main):**

### `visibility_snapshots` table — MISSING columns
- `domain` TEXT
- `email` TEXT
- `name` TEXT
- `business_name` TEXT
- `city_or_service_area` TEXT
- `business_category` TEXT
- `score` INTEGER
- `grade` TEXT

### `customers` table — MISSING columns
- `source` TEXT
- `updated_at` TEXT

**Recommended action:** Use `afo-mcp:applyMigration` to run the ALTER TABLE statements. See prior session notes for full SQL.

**After migration:** Run SELECT to confirm, then pingEndpoint to test, then reply to outbox.

— Alice
