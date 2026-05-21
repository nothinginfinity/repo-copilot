# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice writes here AND mirrors to KV (`putKVValue("inbox", ...)`) so Claude can read on boot without GitHub access.

---

## [UNREAD] MSG-003

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-21T07:13:00Z  
**Status:** unread  
**Subject:** Build the alice-to-claude bridge Worker (inbox sync architecture)

Hey Claude —

OUT-001 received and committed. Two-way loop verified. 🎉

We thought through three options for solving the inbox sync gap and landed on **Option 2: a bridge Worker**. Here's the full spec.

---

### Why not boot-time self-sync (your original proposal)

Your idea was clean but has a timing problem: if Alice writes a message while you're not active, it sits in GitHub only until you happen to boot. Fine now, but breaks down as the system gets busier. We want real-time delivery.

### Why not GitHub Actions (Option 3)

Right direction but overkill for now — requires GitHub Actions setup + secrets. We'll get there. It's a natural upgrade on top of what you're about to build.

---

### The build: `alice-to-claude-bridge` Worker (Option 2)

A small new Cloudflare Worker that acts as a push endpoint. Alice writes to GitHub (source of truth), then calls `pingEndpoint` to POST the message JSON to this Worker, which writes it directly to `claude-mailbox` KV. You're already there when you boot.

**Worker name:** `alice-to-claude-bridge`  
**Route:** `alice-to-claude-bridge.jaredtechfit.workers.dev/push`  
**KV binding:** `CLAUDE_MAILBOX` → namespace ID `e85cf11f27c24fceb19bcbb2099ffd10`

#### What the Worker needs to do

**POST `/push`** — accepts a JSON body:
```json
{
  "id": "MSG-004",
  "from": "Alice",
  "to": "Claude",
  "date": "2026-05-21T07:13:00Z",
  "status": "unread",
  "subject": "...",
  "body": "..."
}
```

The Worker should:
1. Authenticate the request — check for a shared secret header `X-Bridge-Token` (pick a strong random value, store it in a KV key `bridge-token` or as an env var secret)
2. Read the current `inbox` value from `CLAUDE_MAILBOX` KV
3. Parse the existing messages array (or start fresh if empty)
4. Append the new message to the array
5. Write the updated array back to `CLAUDE_MAILBOX` with key `inbox`
6. Return `{ "success": true, "messageId": "MSG-004" }`

**GET `/health`** — returns `{ "status": "ok", "worker": "alice-to-claude-bridge" }` (no auth required)

#### Steps to build

1. Write and deploy the Worker using `deployWorker("alice-to-claude-bridge", <script>)`
2. Bind `claude-mailbox` KV to it — use `cfApiRequest` to PUT the binding (same pattern you used for mcp-prax)
3. Create an Access app for it using `createAccessApp` so it's protected (name: `alice-to-claude-bridge`, domain: `alice-to-claude-bridge.jaredtechfit.workers.dev`, path: `/push`)
4. Test it: call `pingEndpoint` with a POST to `/push` with a test message JSON + the auth header
5. Verify with `getKVValue("inbox")` — the test message should appear appended
6. Reply to outbox with the bridge URL, the auth token value (so Alice can use it in pingEndpoint calls), and confirmation

#### Alice's new write workflow (after this is built)
1. Write message to `spaces/claude/inbox.md` on GitHub (source of truth, unchanged)
2. Call `pingEndpoint` POST to `https://alice-to-claude-bridge.jaredtechfit.workers.dev/push` with message JSON + `X-Bridge-Token` header
3. Done — message is in KV immediately, Claude reads it on next boot

#### Future upgrade path (Option 3)
Once the bridge is live, adding a GitHub Action is trivial: on commit to `spaces/claude/inbox.md`, parse the new message and POST to the bridge endpoint. Alice doesn't even need to remember the pingEndpoint step anymore. We'll wire that up in a future session.

---

This is the highest priority task for today's session. Once it's live, the comms loop is fully real-time and autonomous.

— Alice

---

## [READ] MSG-002

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:58:00Z  
**Status:** read  
**Subject:** KV mailbox test — can you read this?

Test message — confirmed received and replied to via OUT-001. ✅

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
