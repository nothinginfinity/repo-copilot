# Stage as `.md` — Turn 3 Spec

This extends the per-turn ⬇ Save button (Turn 1) with a secondary **"Stage as .md"** action that pushes the formatted turn directly to `docs/reviews/` in the configured repo via `stageFile()` with `customPath`.

All changes go in `repo-copilot.html`.

---

## 1. Update `downloadTurn()` to also return formatted content

Turn 1 added `downloadTurn(index)`. Refactor it so the formatted markdown string is
returnable for both download AND staging:

```js
// Replace your existing downloadTurn() with this split version:

function buildTurnMarkdown(index) {
  const msg = chatHistory[index];           // the assistant message
  const userMsg = chatHistory[index - 1];   // the preceding user message
  const { owner, repo } = getConfig();
  const turnNum = msg.turnNumber || index;
  const model = msg.model || 'unknown';
  const provider = msg.provider || 'unknown';
  const date = msg.timestamp
    ? new Date(msg.timestamp).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return [
    `# Turn ${turnNum} — ${date}`,
    ``,
    `**Repo:** ${owner}/${repo}`,
    `**Model:** ${model} · ${provider}`,
    `**Date:** ${date}`,
    ``,
    `## Prompt`,
    ``,
    userMsg ? userMsg.bubble : '*(no prompt captured)*',
    ``,
    `## Response`,
    ``,
    msg.bubble || ''
  ].join('\n');
}

function downloadTurn(index) {
  const msg = chatHistory[index];
  const turnNum = msg.turnNumber || index;
  const date = msg.timestamp
    ? new Date(msg.timestamp).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const filename = `turn-${turnNum}-${date}.md`;
  const content = buildTurnMarkdown(index);
  const blob = new Blob([content], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

---

## 2. Add `stageTurnAsMd(index)`

This is the new function that stages the turn output as a `.md` file in `docs/reviews/`:

```js
async function stageTurnAsMd(index) {
  const msg = chatHistory[index];
  const turnNum = msg.turnNumber || index;
  const date = msg.timestamp
    ? new Date(msg.timestamp).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const path = `docs/reviews/turn-${turnNum}-${date}.md`;
  const content = buildTurnMarkdown(index);

  // stageFile with customPath (added in Turn 1)
  stageFile(path, content);

  // Visual feedback on the button
  const btn = document.querySelector(`[data-stage-turn="${index}"]`);
  if (btn) {
    btn.textContent = '✅ Staged';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = '⬆ Stage .md'; btn.disabled = false; }, 2000);
  }
}
```

---

## 3. Update the assistant bubble HTML

Turn 1 added a `.btn-save-turn` button. Extend the button row to include the Stage button:

Find the section in your `renderMessage()` or bubble-building code where `.btn-save-turn` is injected. Replace it with a two-button row:

```html
<!-- Replace the single save button with this row -->
<div class="msg-actions">
  <button class="btn-save-turn" onclick="downloadTurn(${index})">⬇ Save</button>
  <button class="btn-stage-turn" data-stage-turn="${index}" onclick="stageTurnAsMd(${index})">⬆ Stage .md</button>
</div>
```

> **Note:** `${index}` is the JS template literal index of the message in `chatHistory`.
> Make sure this is inside a template literal (backtick string) when building the bubble HTML.

---

## 4. CSS — add to `<style>` block

```css
.msg-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.btn-stage-turn {
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 11px;
  cursor: pointer;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-muted);
  transition: all 0.15s;
}
.btn-stage-turn:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.btn-stage-turn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

---

## 5. Ensure `docs/reviews/` exists

The GitHub API will create the directory automatically when the first file is pushed there —
no need to pre-create it. The first `pushFiles()` call with path `docs/reviews/turn-1-…md`
will create the folder.

---

## 6. Verify `stageFile(path, content)` accepts customPath

Turn 1 added `customPath` support. Confirm your `stageFile()` looks like this:

```js
function stageFile(path, content) {
  // path IS the customPath — use it directly as the file key
  stagedFiles[path] = content;
  renderStagedFiles(); // or however staging UI updates
}
```

If your Turn 1 implementation used a different signature (e.g. `stageFile(name, content, customPath)`),
adjust the `stageTurnAsMd()` call in Step 2 to match.

---

## Summary

| Piece | What it does |
|---|---|
| `buildTurnMarkdown(index)` | Shared formatter — used by both download and stage |
| `downloadTurn(index)` | Unchanged behavior, now calls `buildTurnMarkdown()` |
| `stageTurnAsMd(index)` | Stages formatted turn to `docs/reviews/turn-N-YYYY-MM-DD.md` |
| `⬆ Stage .md` button | Added next to ⬇ Save on every assistant bubble |
| `docs/reviews/` | Auto-created on first push — no manual setup needed |

After applying: every LLM response in repo-copilot can be saved locally **or** pushed directly
to the repo as a permanent review artifact — one click.
