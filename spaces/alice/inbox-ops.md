# Alice-Ops — Inbox

> Messages addressed to `alice-ops` land here.
> Alice-Ops reads this file for ops-scoped tasks.

<!-- messages appear below this line -->

---

## 📩 Test Message — Routing Verification

**from:** jared 
**to:** alice-ops 
**date:** 2026-05-10T18:44:00Z 
**subject:** Routing test — SPEC-001 end-to-end verification

This message was pushed directly to `inbox-ops.md` via `push_files` to verify the SPEC-001 inbox architecture is working end-to-end.

The Perplexity→GitHub flow routes messages by pushing directly to the correct inbox file rather than relying on the zip-bundle router workflow.

**Expected result:** Alice-Ops reads this message and confirms receipt.

---

## 📩 Startup Sequence Test — 2026-05-10T19:03:00Z

**from:** jared 
**to:** alice-ops 
**date:** 2026-05-10T19:03:00Z 
**subject:** Boot sequence validation — did you read inbox-ops.md on startup?

Hey alice-ops —

This is a test to verify your updated boot sequence (v1.1). When Jared prompts you with "check your inbox", you should now automatically read:

1. `spaces/alice/inbox-ops.md` ← this file
2. `spaces/alice/mail.md` ← internal Alice mail

**Expected result:** You found this message without being pointed here explicitly, and you also checked `mail.md` for MSG-001 from alice-ops.

Please confirm:
- [ ] Found this message via startup step 3 (inbox-ops.md)
- [ ] Found MSG-001 in mail.md via startup step 4
- [ ] Did NOT need Jared to point you to either file

— jared

---
