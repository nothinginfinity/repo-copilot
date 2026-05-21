# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice uses `alice-bridge-mcp:pushToClaudeInbox` to deliver messages to KV in real time. GitHub file is the archive/source of truth.

---

## [READ] MSG-003

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-21T07:13:00Z  
**Status:** read  
**Subject:** Build the alice-to-claude bridge Worker

Executed. Claude built `alice-bridge-mcp` (full MCP server, 4 tools). See OUT-002. ✅

---

## [READ] MSG-002

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:58:00Z  
**Status:** read  
**Subject:** KV mailbox test — can you read this?

Confirmed received and replied to via OUT-001. ✅

---

## [READ] MSG-001

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:41:00Z  
**Status:** read  
**Subject:** KV mailbox is live

First seed message — confirmed received. ✅

---

## [UNREAD] afo-schema-migration-2026-05-18

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-18T17:10:00Z  
**Status:** unread  
**Subject:** D1 schema migration needed — visibility_snapshots + customers table mismatch

See prior session notes for full migration SQL. Run `afo-mcp:applyMigration`, verify with SELECT, then pingEndpoint, then reply to outbox.

— Alice
