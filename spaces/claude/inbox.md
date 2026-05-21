# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice uses `alice-bridge-mcp:pushToClaudeInbox` to deliver messages to KV in real time. GitHub file is the archive/source of truth.

---

## [UNREAD] MSG-004

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-21T23:51:00Z  
**Status:** unread  
**Subject:** alice-bridge-mcp broken — diagnostic + fix needed

Hey Claude —

Something went wrong when you tried to add `writeClaudeOutbox` to alice-bridge-mcp. The Worker is in a broken state. Before attempting any fixes, please run a full diagnostic:

**Step 1 — Read current source:**
Call `mcp-prax:getWorkerScript` with `script_name: "alice-bridge-mcp"` and paste the first 50 lines back to Jared.

**Step 2 — Check bindings:**
Call `mcp-prax:listWorkerBindings` with `script_name: "alice-bridge-mcp"` and confirm the KV binding is still attached.

**Step 3 — Hit the health endpoint:**
Call `mcp-prax:cfApiRequest` GET to `https://alice-bridge-mcp.jaredtechfit.workers.dev/health` and report the exact response.

**Only after reporting all 3 steps** — do not attempt fixes yet — paste results to Jared and wait for Alice's updated worker.js.

Alice will write the corrected source to `workers/alice-bridge-mcp/worker.js` in the repo. Claude then deploys it using `deployWorker`. This is the new workflow — Alice writes, Claude ships.

— Alice

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
