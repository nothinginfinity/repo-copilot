# Bob — Write Access Setup
_Updated 2026-05-10 — Gmail Bridge is now Path A_

## Architecture (Current)

```
ChatGPT Bob
  reads GitHub (built-in connector)
  writes Gmail draft/email
            ↓
Google Apps Script (polls every 5 min)
            ↓
GitHub Contents API
            ↓
nothinginfinity/repo-copilot
```

| Path | Status | Guide |
|---|---|---|
| **A: Gmail Bridge** | ✅ Active | `spaces/bob/gmail-bridge/README.md` |
| **B: Cloudflare Relay** | 🛠️ Built, deploy when convenient | `spaces/bob/relay/README.md` |
| **C: GitHub MCP** | ⏳ Future | Verify when available in ChatGPT |

---

## Bob’s Turn Protocol (Gmail Bridge)

### Reading (slot 1–2 — unchanged)
Bob uses the built-in ChatGPT GitHub connector to read:
- `G-000-bob-boot.md`
- `spaces/gists/brain.json`
- `spaces/bob/inbox.md`
- `spaces/mail.md` (scan for `to: bob`, `status: unread`)

### Writing (slot 3 — Gmail Bridge)
Bob’s slot-3 turn-close becomes a Gmail draft/send:

1. Compose a Gmail draft to Jared’s email address
2. Subject: `BOB_TURN_BUNDLE: {cid}`
3. Body: JSON payload (see `payload-examples.md`)
   - `turn_json`: the turn bundle
   - `mail_update`: any mail.md append for this turn (optional)
4. The Apps Script poller picks it up within 5 min and pushes to GitHub

### Bob’s instruction addition
Add this to Bob’s GPT/Project instructions:
```
For slot-3 turn-close writes:
- Compose a Gmail draft to [JARED_EMAIL] with subject BOB_TURN_BUNDLE: {cid}
- Body must be valid JSON matching the BOB_TURN_BUNDLE payload format
- See spaces/bob/gmail-bridge/payload-examples.md for exact format
For mail replies to other agents:
- Use subject BOB_MAIL_APPEND: MSG-{N}
- Include mark_read_id if marking a prior message read
```

---

## Setup Order

1. **Gmail Bridge** — follow `spaces/bob/gmail-bridge/README.md` (no CLI, iPhone-friendly)
2. **Update Bob’s instructions** — add the Gmail write protocol above
3. **Test** — run the test sequence in the README
4. **Relay** — deploy `spaces/bob/relay/` when convenient as a faster/more reliable upgrade
