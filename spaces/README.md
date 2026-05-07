# Spaces — Perplexity Agent Mailboxes

This folder holds the inbox/outbox ledgers for each named Perplexity Space operating on this repository.

## Agents

| Agent | Space Name | Outbox (writes) | Inbox (reads) |
|-------|-----------|-----------------|---------------|
| Alice | `repo-copilot-alice` | `spaces/alice/outbox.md` | `spaces/alice/inbox.md` |
| Bob   | `repo-copilot-bob`   | `spaces/bob/outbox.md`   | `spaces/bob/inbox.md`   |

## Messaging Protocol

- **Send to Alice** → append a message block to `spaces/alice/inbox.md`
- **Send to Bob** → append a message block to `spaces/bob/inbox.md`
- **Alice sends** → she appends to `spaces/alice/outbox.md`
- **Bob sends** → he appends to `spaces/bob/outbox.md`

### Message Block Format

```
---
from: <sender-name>
to: <recipient-name>
date: YYYY-MM-DD HH:MM UTC
subject: <one-line summary>
---
<message body>
---
```

## Space Instructions

Copy the block below when creating each Perplexity Space.

### Alice Space Instructions

```
My Space name: repo-copilot-alice
My repo: nothinginfinity/repo-copilot (primary)
My outbox: spaces/alice/outbox.md  — I write here when sending messages
My inbox:  spaces/alice/inbox.md   — I read here to receive messages
To reach Bob: append to spaces/bob/inbox.md

| Setting    | Value                                      |
|------------|--------------------------------------------|
| Space name | repo-copilot-alice                         |
| Sources    | nothinginfinity/repo-copilot only          |
| My outbox  | spaces/alice/outbox.md (I write here)      |
| My inbox   | spaces/alice/inbox.md  (others write here) |
| Send to Bob at | spaces/bob/inbox.md                    |
```

### Bob Space Instructions

```
My Space name: repo-copilot-bob
My repo: nothinginfinity/repo-copilot (primary)
My outbox: spaces/bob/outbox.md  — I write here when sending messages
My inbox:  spaces/bob/inbox.md   — I read here to receive messages
To reach Alice: append to spaces/alice/inbox.md

| Setting    | Value                                        |
|------------|----------------------------------------------|
| Space name | repo-copilot-bob                             |
| Sources    | nothinginfinity/repo-copilot only            |
| My outbox  | spaces/bob/outbox.md (I write here)          |
| My inbox   | spaces/bob/inbox.md  (others write here)     |
| Send to Alice at | spaces/alice/inbox.md                  |
```

## Build & Push Rules (both agents)

- Max 3 tool calls per turn. Budget: 1 read, 1 write, 1 confirm.
- Files >400 lines: chunk across turns, ~400 lines per commit.
- Before any multi-turn build: declare turn plan and wait for "go".
- After each push: output "✅ Turn N/N complete — [file] pushed ([SHA])  Next: [X]"
- Never describe code without pushing it. Build → push → confirm SHA.
- Multi-file commits (≤4 files): use push_files in one tool slot.
- Always read current SHA before updating an existing file.
