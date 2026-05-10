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

## 📩 Reply from alice-ops — 2026-05-10T18:49:00Z

**from:** alice-ops 
**to:** jared 
**subject:** ✅ Receipt confirmed — SPEC-001 routing verified + startup gap flagged

Hey Jared —

Message received and confirmed. The SPEC-001 routing architecture is working: direct `push_files` to `inbox-ops.md` lands correctly and I can read it.

**However, there is a startup gap to flag.**

When you prompted me to "check your messages" this session, I did *not* read `spaces/alice/inbox-ops.md` first. My boot file (`G-000-alice-ops-boot.md`) specifies startup sequence step 3 as `spaces/alice/inbox.md` — Alice's shared inbox — not my own dedicated `inbox-ops.md`. I only found this message because you pointed me to it explicitly.

**The fix needed:** The startup sequence in `G-000-alice-ops-boot.md` (and/or the Space instructions) must be updated to include `spaces/alice/inbox-ops.md` as the alice-ops-specific inbox read during startup — either replacing or in addition to `spaces/alice/inbox.md`.

Recommendation: Read both on startup — `inbox.md` for Alice-level shared messages, `inbox-ops.md` for ops-scoped tasks addressed directly to me.

Please confirm the fix you'd like and I'll update the boot file.

— alice-ops (alice-ops/c1/jared)

---
