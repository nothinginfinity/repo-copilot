# Bob — ChatGPT Custom GPT + Action Setup
_How to wire Bob with full GitHub write access — Custom GPT path (Path A)_
_Updated after Bob’s MSG-004 recommendation (2026-05-10)_

---

## Architecture Decision

**Bob runs as a Custom GPT, not a ChatGPT Project.**

Why: OpenAI’s custom GPTs are the correct place for OpenAPI Actions with Bearer PAT auth.
ChatGPT Projects support instructions, files, memory, and connected apps — but are NOT
documented as the primary place for custom OpenAPI Actions.

**Path A (now):** Custom GPT + GitHub Contents Action — use `chatgpt-action-schema.yaml`
**Path B (later):** GitHub MCP server connected directly — verify after Path A is working

---

## Step 1 — Generate a GitHub PAT

1. Go to: https://github.com/settings/tokens?type=beta
2. Tap **Generate new token (fine-grained)**
3. Name: `repo-copilot-bob`
4. Repository access: **Only selected repositories** → `nothinginfinity/repo-copilot`
5. Permissions — set ONLY:
   - **Repository contents: Read and Write**
   - Nothing else — no workflow, no secrets, no admin
6. Copy the token (starts with `github_pat_...`)

---

## Step 2 — Create the Custom GPT

> Setup requires browser or desktop — the GPT builder is not available on iPhone.
> Day-to-day usage on iPhone works fine once configured.

1. Go to: https://chatgpt.com/gpts/editor (browser)
2. Name the GPT: **Bob** (or `repo-copilot-bob`)
3. Paste Bob’s boot instructions into the **Instructions** field:
   - Copy from `G-000-bob-boot.md` → Section 7 (Perplexity Space Bootloader)
   - Add at the bottom:
     ```
     For file writes (turn bundles, mail.md updates): use the GitHub Write API Action
     (createOrUpdateFile). Always base64-encode file content before sending.
     Always call getFileContents first to get the current SHA when updating existing files.
     Slot-3 turn bundle = sequential createOrUpdateFile calls (turn.json first, then mail.md if changed).
     ```
4. Under **Actions** → tap **Add Action**
5. Paste the full contents of `spaces/bob/chatgpt-action-schema.yaml`
6. Under **Authentication**:
   - Auth type: **API Key**
   - API Key: paste your `github_pat_...` token
   - Auth type: **Bearer**
7. Save and publish (set to **Only me**)

---

## Step 3 — Verify on iPhone

After saving in browser:
1. Open ChatGPT iPhone app
2. Tap the model selector → **My GPTs** → select **Bob**
3. Start a new chat — Bob should boot and load his 4 startup files

---

## Step 4 — Test Write Access

After Bob boots, give him this test prompt:

> "Write a test turn bundle to `.github/turns/test-write/t1/turn.json` confirming write access is working."

Expected result: Bob calls `getFileContents` (to check if file exists), then `createOrUpdateFile` with base64-encoded JSON. Confirm the commit appears on GitHub.

Then test mail:
> "Mark MSG-004 in `spaces/mail.md` as read."

Expected result: Bob reads mail.md (gets SHA), updates MSG-004 status to `read`, pushes the update.

If both pass — **Bob is fully operational on Path A.**

---

## Step 5 — Path B Check (after Path A works)

In Bob’s custom GPT settings, check if **MCP connector** is available:
- Settings → Connected apps / Connectors
- If GitHub MCP is available: connect it, and Bob can use `push_files` natively (no base64)
- If not available on your plan: Path A (Action) remains the working solution

---

## How Bob’s Slot-3 Works (Action Route)

Since ChatGPT Actions use single-file PUT (not multi-file `push_files`),
Bob’s slot-3 turn bundle becomes sequential writes:

```
1. getFileContents(".github/turns/{session}/{cid}/turn.json") — get SHA if exists
2. createOrUpdateFile(".github/turns/{session}/{cid}/turn.json", base64(turn_json), sha_or_omit)
3. If mail sent this turn:
   getFileContents("spaces/mail.md") — get SHA
   createOrUpdateFile("spaces/mail.md", base64(updated_mail), sha)
```

Same outcome as `push_files`, 2–3 sequential calls.

---

## Security

- PAT stored in GPT Action auth settings (encrypted at rest by OpenAI)
- Scoped to one repo, one permission (contents read/write only)
- Rotate at: https://github.com/settings/tokens if compromised
- Never paste the PAT into a chat message or any repo file
