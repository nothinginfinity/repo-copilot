# Bob — ChatGPT Custom Action Setup
_How to wire Bob's write access in a ChatGPT Project (iPhone app)_

---

## What This Solves

ChatGPT's built-in GitHub tool is read-only. This custom Action adds write access
(create/update files, push turn bundles) using your GitHub PAT as the auth token.

---

## Step 1 — Generate a GitHub PAT

1. Go to: https://github.com/settings/tokens?type=beta
2. Tap **Generate new token**
3. Name: `repo-copilot-bob`
4. Repository access: **Only selected repositories** → `nothinginfinity/repo-copilot`
5. Permissions: **Repository contents — Read and Write**
6. Copy the token (starts with `github_pat_...`)

---

## Step 2 — Create the Custom Action in ChatGPT

> On iPhone: ChatGPT app → tap your profile → **My GPTs** (or open the Bob Project settings)

1. Open the **Bob Project** settings
2. Scroll to **Actions** → tap **Add Action**
3. Paste the contents of `spaces/bob/chatgpt-action-schema.yaml` into the schema field
4. Under **Authentication**:
   - Type: **API Key**
   - Auth type: **Bearer**
   - API Key: paste your `github_pat_...` token
5. Save

---

## Step 3 — Update Bob's Project Instructions

Replace the existing Bob Space instructions with the version in
`G-000-bob-boot.md` → Section 7 (Perplexity Space Bootloader).

Add this line at the bottom:

```
For file writes (push_files, turn bundles): use the GitHub Write API Action
(createOrUpdateFile). Base64-encode all file content before sending.
Always call getFileContents first to get the current SHA when updating existing files.
```

---

## Step 4 — How Bob Pushes Files

Since ChatGPT Actions use single-file `PUT` (not multi-file `push_files`),
Bob's slot-3 turn bundle becomes **sequential single-file writes**:

```
1. getFileContents(“.github/turns/.../turn.json”) — check if exists (skip SHA if new)
2. createOrUpdateFile(“.github/turns/.../turn.json”, base64(turn_json), sha_if_exists)
3. createOrUpdateFile(“spaces/mail.md”, base64(mail_content), sha) — if mail sent
```

This replaces the `push_files` multi-file bundle. Same outcome, sequential writes.

---

## Base64 Encoding Note

ChatGPT must base64-encode file content before sending to the GitHub API.
The model handles this automatically when told to — remind Bob in the
Project instructions:

> "When writing files via the GitHub Write API Action, always base64-encode
> the content field. GitHub API requires base64 for the contents parameter."

---

## Security Note

- The PAT is stored in ChatGPT's Action auth settings (encrypted at rest)
- Scope is limited to one repo and one permission (contents read/write)
- Rotate the token at https://github.com/settings/tokens if compromised
- Never paste the PAT into a chat message or file
