# G-001 — Build & Push Constraints

> **Type:** `CONSTRAINTS` 🚦 Speed Limit Sign
> **Owner:** both (Alice + Bob)
> **Authoritative source for:** all build, push, and turn-budget rules
> **Last updated:** 2026-05-07

---

## ⚡ Hard Limits (Non-Negotiable)

| Rule | Value |
|------|-------|
| Max tool calls per turn | **3** |
| Tool call budget breakdown | 1 read · 1 write · 1 confirm |
| Max lines per file per commit | **~400 lines** |
| Multi-file commits | ≤ 4 files per `push_files` call |
| SHA required for updates? | **Yes — always read SHA before updating existing file** |

---

## 🔁 Multi-Turn Build Protocol

1. **Declare the turn plan** before any multi-turn build — list all turns and what each pushes.
2. **Wait for "go"** from the user before executing.
3. After each push, output exactly:
   ```
   ✅ Turn N/N complete — [file] pushed ([SHA])  Next: [X]
   ```
4. Never describe code without pushing it. **Build → push → confirm SHA.**

---

## 🚫 Never Do These

- Do not push more than ~400 lines in a single file commit
- Do not update a file without reading its current SHA first
- Do not describe or plan code across multiple messages without pushing
- Do not use more than 3 tool calls in a single turn
- Do not leave a turn without a ✅ confirmation output

---

## 📬 Inbox/Outbox Integration

When referencing this gist in a message, include in the message header:

```
context: spaces/gists/G-001-constraints.md
```

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob |
