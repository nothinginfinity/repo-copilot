# Mailbox Feature — Inbox/Outbox Compose

This document is the complete implementation spec for the Mailbox tab upgrade.
Apply all changes to `repo-copilot.html` using repo-copilot's own edit/push flow.

---

## 1. New State Variables

Add these near the top of the `<script>` block alongside the other state vars:

```js
// Mailbox state
let mailboxTab = 'inbox';          // 'inbox' | 'outbox' | 'compose'
let mailboxInboxContent = '';      // raw markdown fetched from inbox.md
let mailboxOutboxContent = '';     // raw markdown fetched from outbox.md
let mailboxLoading = false;
```

---

## 2. MAILBOX_PATHS Config

Add this constant near `PROVIDER_DOCS`:

```js
// Default mailbox paths — matches the Perplexity Spaces convention
const MAILBOX_PATHS = {
  inbox:  'spaces/repo-copilot/inbox.md',
  outbox: 'spaces/repo-copilot/outbox.md',
  sendTo: 'spaces/studio-os-chat/inbox.md'   // where we write TO Perplexity
};
```

---

## 3. Core Functions

### 3a. fetchMailboxFile(path)

Fetches a file from the currently configured repo. Returns decoded content string or null.

```js
async function fetchMailboxFile(path) {
  const { owner, repo, branch, apiKey } = getConfig();
  if (!owner || !repo || !apiKey) return null;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch || 'main'}`;
  const res = await fetch(url, {
    headers: { Authorization: `token ${apiKey}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { content: atob(data.content.replace(/\n/g, '')), sha: data.sha };
}
```

### 3b. appendToMailboxFile(path, newEntry)

GET current content → append → PUT back. The core append-only write.

```js
async function appendToMailboxFile(path, newEntry) {
  const { owner, repo, branch, apiKey } = getConfig();
  const existing = await fetchMailboxFile(path);
  const currentContent = existing ? existing.content : '';
  const currentSha = existing ? existing.sha : null;

  const separator = currentContent.trim() ? '\n\n---\n\n' : '';
  const updated = currentContent + separator + newEntry;
  const encoded = btoa(unescape(encodeURIComponent(updated)));

  const body = {
    message: `mailbox: append message ${new Date().toISOString()}`,
    content: encoded,
    branch: branch || 'main'
  };
  if (currentSha) body.sha = currentSha;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res.ok;
}
```

### 3c. sendMailboxMessage(toPath, messageText)

Formats a timestamped MMCP-style envelope and appends it.

```js
async function sendMailboxMessage(toPath, messageText) {
  const ts = new Date().toISOString();
  const { owner, repo } = getConfig();
  const entry = `## Message\n**From:** ${owner}/${repo}  \n**Sent:** ${ts}\n\n${messageText}`;
  return appendToMailboxFile(toPath, entry);
}
```

### 3d. loadMailbox(tab)

Loads inbox or outbox content and re-renders the panel.

```js
async function loadMailbox(tab) {
  mailboxTab = tab;
  mailboxLoading = true;
  renderMailboxPanel();
  const path = tab === 'inbox' ? MAILBOX_PATHS.inbox : MAILBOX_PATHS.outbox;
  const result = await fetchMailboxFile(path);
  mailboxInboxContent = result ? result.content : '*(empty)*';
  mailboxLoading = false;
  renderMailboxPanel();
}
```

---

## 4. renderMailboxPanel()

This replaces / upgrades the existing `mailbox-section` render. Add as a new function:

```js
function renderMailboxPanel() {
  const el = document.getElementById('mailbox-panel');
  if (!el) return;

  if (mailboxLoading) {
    el.innerHTML = `<div class="mailbox-loading">Loading…</div>`;
    return;
  }

  el.innerHTML = `
    <div class="mailbox-tabs">
      <button class="mailbox-tab ${mailboxTab==='inbox'?'active':''}" onclick="loadMailbox('inbox')">📥 Inbox</button>
      <button class="mailbox-tab ${mailboxTab==='outbox'?'active':''}" onclick="loadMailbox('outbox')">📤 Outbox</button>
      <button class="mailbox-tab ${mailboxTab==='compose'?'active':''}" onclick="showCompose()">✏️ Compose</button>
    </div>

    ${mailboxTab === 'compose' ? renderCompose() : renderMailboxMessages()}
  `;
}

function renderMailboxMessages() {
  const raw = mailboxInboxContent || '*(empty)*';
  // Split on the --- separator to render individual messages
  const messages = raw.split(/\n---\n/).map(m => m.trim()).filter(Boolean);
  return messages.map(m => `
    <div class="mailbox-message">
      <div class="mailbox-message-body">${marked.parse(m)}</div>
    </div>
  `).join('');
}

function renderCompose() {
  return `
    <div class="mailbox-compose">
      <label class="compose-label">To</label>
      <input id="compose-to" class="compose-input" value="${MAILBOX_PATHS.sendTo}" />
      <label class="compose-label">Message</label>
      <textarea id="compose-body" class="compose-textarea" rows="6" placeholder="Write your message…"></textarea>
      <div class="compose-actions">
        <button class="btn-compose-send" onclick="handleComposeSend()">Send ↗</button>
        <button class="btn-compose-cancel" onclick="loadMailbox('inbox')">Cancel</button>
      </div>
      <div id="compose-status"></div>
    </div>
  `;
}

function showCompose() {
  mailboxTab = 'compose';
  renderMailboxPanel();
}

async function handleComposeSend() {
  const toPath = document.getElementById('compose-to').value.trim();
  const body = document.getElementById('compose-body').value.trim();
  const statusEl = document.getElementById('compose-status');
  if (!body) { statusEl.textContent = 'Message is empty.'; return; }
  statusEl.textContent = 'Sending…';
  const ok = await sendMailboxMessage(toPath, body);
  if (ok) {
    statusEl.textContent = '✅ Sent!';
    // Also append to our own outbox as a record
    await appendToMailboxFile(MAILBOX_PATHS.outbox,
      `## Sent\n**To:** ${toPath}  \n**Sent:** ${new Date().toISOString()}\n\n${body}`);
    setTimeout(() => loadMailbox('outbox'), 1200);
  } else {
    statusEl.textContent = '❌ Failed — check your API key and repo config.';
  }
}
```

---

## 5. HTML — Replace Mailbox Section

Find the existing `mailbox-section` div and replace it with:

```html
<!-- MAILBOX PANEL -->
<div id="mailbox-panel" class="mailbox-panel">
  <!-- rendered by renderMailboxPanel() -->
</div>
```

Then call `loadMailbox('inbox')` once on init (after config is loaded).

---

## 6. CSS — Add to `<style>` block

```css
/* Mailbox Panel */
.mailbox-panel { display: flex; flex-direction: column; gap: 0; }

.mailbox-tabs { display: flex; gap: 4px; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.mailbox-tab {
  padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;
  background: none; border: 1px solid transparent; color: var(--text-muted);
  transition: all 0.15s;
}
.mailbox-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.mailbox-tab:hover:not(.active) { border-color: var(--border); color: var(--text); }

.mailbox-message {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.6;
}
.mailbox-message:last-child { border-bottom: none; }
.mailbox-message-body h2 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.mailbox-message-body p { margin: 0 0 6px; color: var(--text-muted); }

.mailbox-loading { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }

/* Compose */
.mailbox-compose { padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.compose-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.compose-input {
  padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border);
  background: var(--bg-input); color: var(--text); font-size: 12px;
  font-family: monospace;
}
.compose-textarea {
  padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border);
  background: var(--bg-input); color: var(--text); font-size: 13px;
  resize: vertical; line-height: 1.6;
}
.compose-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-compose-send {
  padding: 6px 16px; border-radius: 6px; background: var(--accent);
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; border: none;
}
.btn-compose-send:hover { opacity: 0.88; }
.btn-compose-cancel {
  padding: 6px 12px; border-radius: 6px; background: none;
  border: 1px solid var(--border); color: var(--text-muted); font-size: 13px; cursor: pointer;
}
#compose-status { font-size: 12px; color: var(--text-muted); min-height: 18px; }
```

---

## 7. Init Call

After the config panel initializes, add:

```js
// Boot mailbox on load
loadMailbox('inbox');
```

---

## Summary of What This Builds

| Piece | What it does |
|---|---|
| `fetchMailboxFile()` | GET any `spaces/*/inbox.md` from the configured repo |
| `appendToMailboxFile()` | GET → append → PUT — the safe append-only write |
| `sendMailboxMessage()` | Formats a timestamped envelope + appends to any inbox path |
| Compose UI | Textarea + To field + Send — writes to `spaces/studio-os-chat/inbox.md` by default |
| Outbox record | Every sent message is also recorded in `spaces/repo-copilot/outbox.md` |
| Inbox reader | Splits on `---` separators, renders each message as a card |

This directly wires repo-copilot into the Perplexity Spaces mailbox system.
