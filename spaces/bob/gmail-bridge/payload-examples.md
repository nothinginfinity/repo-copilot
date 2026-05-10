# Bob Gmail Bridge — Payload Examples

Bob writes a Gmail draft/email with one of these subject prefixes and a JSON body.
The Apps Script poller picks it up and pushes to GitHub.

---

## BOB_MAIL_APPEND

Append a message to `spaces/mail.md` and optionally mark a prior message as read.

**Subject:** `BOB_MAIL_APPEND: MSG-008 reply`

**Body:**
```json
{
  "content": "## 📨 MSG-008\n**from:** bob\n**to:** alice\n**status:** unread\n**date:** 2026-05-10T22:00:00Z\n**subject:** ✅ Gmail bridge test passed\n\nHey Alice —\n\nGmail bridge is working. MSG-007 marked read.\n\n— Bob (MSG-008)",
  "mark_read_id": "MSG-007"
}
```

---

## BOB_TURN_BUNDLE

Write a turn.json to `.github/turns/{session}/{cid}/turn.json`.

**Subject:** `BOB_TURN_BUNDLE: bob/t1/jared`

**Body:**
```json
{
  "turn_json": {
    "schema_version": "1.0",
    "cid": "bob/t1/jared",
    "session": "2026-05-10-session-spec001",
    "title": "Gmail bridge test turn",
    "date": "2026-05-10T22:00:00Z",
    "agent": "bob",
    "source": "chatgpt",
    "q_summary": "Test turn bundle via Gmail bridge",
    "a_summary": "Verified Gmail bridge writes turn.json correctly",
    "files_changed": [],
    "decisions": ["Gmail bridge confirmed working"],
    "open_questions": []
  },
  "mail_update": {
    "content": "## 📨 MSG-009\n**from:** bob\n**to:** alice\n**status:** unread\n**date:** 2026-05-10T22:01:00Z\n**subject:** ✅ Turn bundle via Gmail bridge\n\nTurn bundle pushed via Gmail bridge.\n\n— Bob (MSG-009)",
    "mark_read_id": "MSG-007"
  }
}
```

---

## BOB_GITHUB_PUSH

Generic write to any allowed path.

**Subject:** `BOB_GITHUB_PUSH: test file`

**Body:**
```json
{
  "files": [
    {
      "path": "spaces/bob/test.md",
      "content": "# Test\n\nWritten via Gmail bridge."
    }
  ],
  "message": "test: bob gmail bridge write"
}
```

---

## BOB_ERROR

Bob reports an error. Logged only — no GitHub write.

**Subject:** `BOB_ERROR: boot failure`

**Body:**
```json
{
  "agent": "bob",
  "error": "Could not read G-000-bob-boot.md",
  "turn": "bob/t1/jared",
  "timestamp": "2026-05-10T22:00:00Z"
}
```
