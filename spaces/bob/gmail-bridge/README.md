# Bob Gmail Bridge — Setup Guide
_iPhone-friendly. All steps doable in Safari. No CLI needed._

## How it works

```
ChatGPT Bob
  reads GitHub (built-in connector)
  writes Gmail draft/email → BOB_MAIL_APPEND, BOB_TURN_BUNDLE, etc.
            ↓
Google Apps Script (polls every 5 min)
            ↓
GitHub Contents API
            ↓
nothinginfinity/repo-copilot
```

No Cloudflare setup. No CLI. No deployment. Just a Google Script and a PAT.

---

## Step 1 — Generate a GitHub PAT

1. Go to: https://github.com/settings/tokens?type=beta
2. **Generate new token (fine-grained)**
3. Name: `repo-copilot-bob-gmail`
4. Repository: **Only selected** → `nothinginfinity/repo-copilot`
5. Permissions: **Repository contents: Read and Write** only
6. Copy the token

---

## Step 2 — Create the Apps Script

1. Open Safari → go to: https://script.google.com
2. Tap **New project**
3. Delete the default `myFunction()` code
4. Paste the full contents of `appsscript-poller.js` (this folder)
5. Tap the **floppy disk / save** icon — name it `repo-copilot-bob-bridge`

---

## Step 3 — Set Script Properties

1. In the script editor: tap the **gear icon** (⚙️) → **Project settings**
2. Scroll to **Script properties** → **Add script property**
3. Add these two:

| Property | Value |
|---|---|
| `GITHUB_PAT` | Your `github_pat_...` token from Step 1 |
| `REPO` | `nothinginfinity/repo-copilot` |

---

## Step 4 — Authorize

1. Back in the editor, tap **Run** → select function `pollBobOutbox`
2. A permission dialog will appear — tap **Review permissions**
3. Sign in with your Google account → **Allow**
   - Gmail read access (to find BOB_ emails)
   - External URL fetch (to call GitHub API)

---

## Step 5 — Set a Time Trigger

1. Tap the **clock icon** (⏰) in the left sidebar — **Triggers**
2. Tap **+ Add Trigger** (bottom right)
3. Settings:
   - Function: `pollBobOutbox`
   - Event source: **Time-driven**
   - Type: **Minutes timer**
   - Interval: **Every 5 minutes**
4. Save

The poller now runs automatically every 5 minutes.

---

## Step 6 — Test

In ChatGPT (Bob), say:
> *“Create a Gmail draft to [your email] with subject `BOB_MAIL_APPEND` and body:*
> ```json
> {
>   "content": "## 📨 MSG-TEST\n**from:** bob\n**to:** alice\n**status:** unread\n**date:** 2026-05-10T22:00:00Z\n**subject:** 🧪 Test via Gmail bridge\n\nTest message from Bob via Gmail bridge.\n\n— Bob (MSG-TEST)",
>   "mark_read_id": "MSG-007"
> }
> ```
> *”*

Wait up to 5 min → check GitHub → `spaces/mail.md` should have the new message.

---

## Subject Prefix Reference

| Subject prefix | What it does |
|---|---|
| `BOB_MAIL_APPEND` | Appends a message block to `spaces/mail.md` |
| `BOB_TURN_BUNDLE` | Writes `turn.json` to `.github/turns/` |
| `BOB_GITHUB_PUSH` | Generic file write (any path) |
| `BOB_NOTION_ROW` | Queued — wires up when Notion integration is ready |
| `BOB_ERROR` | Logged only — no GitHub write |

---

## Architecture Priority

| Path | Status | Notes |
|---|---|---|
| **A: Gmail Bridge** | ✅ Active | This guide. Works today on iPhone. |
| **B: Cloudflare Relay** | 🛠️ Built, not deployed | `spaces/bob/relay/` — deploy when convenient |
| **C: GitHub MCP** | ⏳ Future | Best final form — verify when available in ChatGPT |
