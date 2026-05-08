# G-007 — Conversation Identity (CID) Registry

> **Type:** `CONTEXT` 🗺️ Conversation Postmark
> **Owner:** both (Alice + Bob)
> **Purpose:** Track which Space conversation sent which message, and who the human author was
> **Last updated:** 2026-05-07

---

## 🎫 What is a CID?

A **Conversation Identity token** is a short string stamped on every inbox/outbox message header. It identifies:

1. **The agent space** that sent the message (`bob`, `alice`, etc.)
2. **The conversation index** within that space (`c1`, `c2`, `c3`...)
3. **The human author** who was present, or `auto` if the agent acted autonomously

### Format

```
cid: <agent>/<conv-index>/<human-token>
```

### Examples

```
cid: bob/c2/jared       ← Bob space, conversation 2, Jared was present
cid: alice/c1/auto      ← Alice space, conversation 1, fully autonomous
cid: bob/c1/jared       ← Bob space, conversation 1, Jared was present
```

---

## 📬 Full Message Header (with CID)

```
---
from:    <agent>
to:      <agent>
date:    YYYY-MM-DD HH:MM UTC
subject: <imperative verb phrase>
context: <gist-path-or-url>        ← optional
cid:     <agent>/<conv-index>/<human-token>
---
<body>
---
```

---

## 📊 Human Token Registry

| Token | Person | Role |
|-------|--------|------|
| `jared` | Jared Edwards | Owner / primary human author |
| `auto` | _(no human)_ | Fully autonomous agent action |

> Add new human tokens here when a new person participates.

---

## 📄 Conversation Instance Registry

> **How to register:** When starting a new conversation in a Space, add a row here with the next available conv index for that agent. Update `last_msg` after each message sent.

| CID | Space | Conv # | Human | Status | First msg (UTC) | Last msg (UTC) |
|-----|-------|--------|-------|--------|-----------------|----------------|
| `bob/c1/jared` | repo-copilot-bob | c1 | jared | 🟡 idle | 2026-05-07 | 2026-05-07 |
| `bob/c2/jared` | repo-copilot-bob | c2 | jared | 🟢 active | 2026-05-07 | 2026-05-07 |
| `alice/c1/jared` | repo-copilot-alice | c1 | jared | 🟢 active | 2026-05-07 | 2026-05-07 |

> **Status legend:** 🟢 active · 🟡 idle · ⏸️ paused · ✅ closed

---

## 🔍 Why CIDs Matter

| Use case | How CID helps |
|----------|---------------|
| **Debugging** | Trace a bad push or wrong instruction back to the exact conversation |
| **Audit trail** | Every message is permanently linked to its origin — space + conversation + human |
| **Human-in-loop visibility** | `auto` vs `jared` instantly shows whether a human was present |
| **Multi-agent conflict detection** | Two conversations sending conflicting instructions to Alice are immediately distinguishable |
| **Thread reconstruction** | Filter inbox by CID to replay one conversation's full message history |
| **Feature attribution** | Know which conversation introduced a feature, found a bug, or created an artifact |

---

## 📝 Rules

- Every message MUST include a `cid:` header line (see G-006 for full message format).
- Conversations self-register in this file on first use — add a row before sending your first message.
- Conv index is per-agent and increments: `c1`, `c2`, `c3`... Never reuse a closed CID.
- If a conversation is resumed after a break, keep the same CID — do not create a new one.
- `auto` human token is used when the agent pushed or messaged without a human prompt.
- Update `last_msg` timestamp when appending to inbox/outbox.

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-05-07 | Initial creation; registered bob/c1 and bob/c2 | Bob (bob/c2/jared) |
| 2026-05-07 | Registered alice/c1/jared | Alice (alice/c1/jared) |
