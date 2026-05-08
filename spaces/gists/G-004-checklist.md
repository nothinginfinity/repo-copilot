# G-004 — Pre-Push Gate Checklist

> **Type:** `CHECKLIST` 🚧 Toll Booth
> **Owner:** both (Alice + Bob)
> **Run before:** every `push_files` or `create_or_update_file` call
> **Last updated:** 2026-05-07

---

## ✅ Pre-Push Gate

Check every item before committing. Do not push if any item is unchecked.

- [ ] **SHA confirmed** — read current file SHA before updating any existing file
- [ ] **Line count checked** — file is ≤ ~400 lines; if over, chunk the work across turns
- [ ] **File count checked** — ≤ 4 files in this `push_files` call
- [ ] **Tool call budget** — this push is within the 3-tool-call-per-turn limit (see G-001)
- [ ] **Commit message format** — follows `type(scope): description` convention
- [ ] **No secrets** — no API keys, tokens, passwords, or credentials in any pushed file
- [ ] **Paths are correct** — all file paths are relative to repo root and confirmed to exist or be intentionally new
- [ ] **Registry updated** — if a new gist was created, a new row was added to `spaces/gists.md`

---

## ⚠️ Secret Scan Reminder

Before pushing any file that contains configuration, env vars, or agent instructions, mentally scan for:
- API keys (`sk-`, `ghp_`, `Bearer `, `token:`)
- Passwords or secrets in plaintext
- Private URLs containing auth tokens

If in doubt, **do not push** — ask the user first.

---

## 📤 Post-Push Confirmation

After every successful push, output:
```
✅ Turn N/N complete — [file(s)] pushed ([SHA])  Next: [X]
```

If the push fails, report the error and **do not retry** without user confirmation.

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob |
