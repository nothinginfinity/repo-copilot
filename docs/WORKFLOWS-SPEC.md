# Workflows Tab — Turn 4 Spec

Adds a **Workflows** sub-panel inside the Chat tab with pre-built multi-step prompt chains.
First kit ships with a 5-step **Code Review** workflow. All changes go in `repo-copilot.html`.

---

## 1. Workflow Data Structure

Add this constant near `PROVIDER_DOCS` and `MAILBOX_PATHS`:

```js
const WORKFLOWS = {
  'code-review': {
    name: 'Code Review',
    icon: '🔍',
    description: 'Five-step structured code review for any repo.',
    steps: [
      {
        label: 'Architecture Review',
        prompt: 'Review the high-level architecture of this repo. Identify the main modules, their responsibilities, and how data flows between them. Note any structural concerns.'
      },
      {
        label: 'Bug & Edge Case Scan',
        prompt: 'Based on the architecture above, scan for likely bugs, unhandled edge cases, and fragile assumptions. Be specific about file/function names where possible.'
      },
      {
        label: 'Security Audit',
        prompt: 'Review the codebase for security issues: exposed secrets, unsafe eval/innerHTML, missing input validation, insecure API calls, or dependency risks. List each finding with severity (low/medium/high).'
      },
      {
        label: 'Refactor Suggestions',
        prompt: 'Suggest the highest-value refactoring opportunities. Focus on reducing duplication, improving readability, and simplifying complex logic. Prioritize by impact.'
      },
      {
        label: 'Generate Review Summary',
        prompt: 'Synthesize the findings from all previous turns into a concise review summary. Format as a markdown document with sections: Overview, Key Findings, Security, Refactor Priorities, and Recommended Next Steps.'
      }
    ]
  },

  'readme-writer': {
    name: 'README Writer',
    icon: '📝',
    description: 'Generate a polished README from repo structure and code.',
    steps: [
      {
        label: 'Understand the Repo',
        prompt: 'Analyze the repo structure and main source files. Summarize what this project does, who it is for, and what problem it solves.'
      },
      {
        label: 'Installation & Usage',
        prompt: 'Write the Installation and Usage sections of the README. Include prerequisites, setup steps, and at least one usage example.'
      },
      {
        label: 'API / Config Reference',
        prompt: 'Document the key configuration options, environment variables, or public API surface. Use a markdown table where appropriate.'
      },
      {
        label: 'Draft Full README',
        prompt: 'Combine the above into a complete, polished README.md. Include: title, badges placeholder, description, installation, usage, configuration, contributing, and license sections.'
      }
    ]
  }
};
```

---

## 2. Workflow State Variables

Add near other state vars:

```js
let activeWorkflow = null;   // { id, steps, currentStep }
let workflowPanelOpen = false;
```

---

## 3. Core Workflow Functions

```js
function startWorkflow(id) {
  const wf = WORKFLOWS[id];
  if (!wf) return;
  activeWorkflow = {
    id,
    name: wf.name,
    steps: wf.steps,
    currentStep: 0
  };
  loadWorkflowStep();
}

function loadWorkflowStep() {
  if (!activeWorkflow) return;
  const step = activeWorkflow.steps[activeWorkflow.currentStep];
  if (!step) return;

  // Pre-fill the chat input
  const input = document.getElementById('chat-input'); // adjust id to match yours
  if (input) {
    input.value = step.prompt;
    input.focus();
  }

  renderWorkflowProgress();
}

function advanceWorkflow() {
  if (!activeWorkflow) return;
  activeWorkflow.currentStep++;
  if (activeWorkflow.currentStep >= activeWorkflow.steps.length) {
    // Workflow complete
    activeWorkflow = null;
    renderWorkflowProgress();
    showWorkflowComplete();
    return;
  }
  loadWorkflowStep();
}

function cancelWorkflow() {
  activeWorkflow = null;
  renderWorkflowProgress();
}

function showWorkflowComplete() {
  const bar = document.getElementById('workflow-progress-bar');
  if (bar) {
    bar.innerHTML = `<span class="wf-complete">✅ Workflow complete — use ⬆ Stage .md to save any turn.</span>`;
    setTimeout(() => { bar.innerHTML = ''; }, 4000);
  }
}
```

### Hook into sendMessage

After a successful LLM response is appended to `chatHistory`, add this call:

```js
// At the end of your response-received handler:
if (activeWorkflow) advanceWorkflow();
```

This auto-advances the workflow step every time a response lands.

---

## 4. renderWorkflowProgress()

This small persistent bar sits just above the chat input and shows current step:

```js
function renderWorkflowProgress() {
  const bar = document.getElementById('workflow-progress-bar');
  if (!bar) return;

  if (!activeWorkflow) {
    bar.innerHTML = '';
    return;
  }

  const { name, steps, currentStep } = activeWorkflow;
  const stepLabel = steps[currentStep]?.label || 'Done';
  const pct = Math.round((currentStep / steps.length) * 100);

  bar.innerHTML = `
    <div class="wf-bar">
      <span class="wf-name">${name}</span>
      <span class="wf-step">Step ${currentStep + 1}/${steps.length} — ${stepLabel}</span>
      <div class="wf-track"><div class="wf-fill" style="width:${pct}%"></div></div>
      <button class="wf-cancel" onclick="cancelWorkflow()">✕ Cancel</button>
    </div>
  `;
}
```

---

## 5. renderWorkflowsPanel()

This renders the Workflows picker — a list of available workflows with Start buttons:

```js
function renderWorkflowsPanel() {
  const el = document.getElementById('workflows-panel');
  if (!el) return;

  const cards = Object.entries(WORKFLOWS).map(([id, wf]) => `
    <div class="wf-card">
      <div class="wf-card-icon">${wf.icon}</div>
      <div class="wf-card-info">
        <div class="wf-card-name">${wf.name}</div>
        <div class="wf-card-desc">${wf.description}</div>
        <div class="wf-card-steps">${wf.steps.length} steps</div>
      </div>
      <button class="wf-card-start" onclick="startWorkflow('${id}'); switchTab('chat')">
        ▶ Start
      </button>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="wf-panel-header">Workflows</div>
    <div class="wf-cards">${cards}</div>
  `;
}
```

---

## 6. HTML — Add to layout

### A. Workflows tab button

Find where your tab buttons are rendered (Chat, Files, Config, etc.) and add:

```html
<button class="tab-btn" data-tab="workflows" onclick="switchTab('workflows')">
  ⚡ Workflows
</button>
```

### B. Workflows panel

Add alongside your other tab panels:

```html
<div id="workflows-panel" class="tab-panel" data-panel="workflows">
  <!-- rendered by renderWorkflowsPanel() -->
</div>
```

### C. Workflow progress bar

Add this div **just above your chat input row**:

```html
<div id="workflow-progress-bar"></div>
```

---

## 7. CSS — Add to `<style>` block

```css
/* Workflow progress bar */
#workflow-progress-bar { padding: 0 12px; }
.wf-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 8px;
  background: var(--bg-input); border: 1px solid var(--border);
  margin-bottom: 6px; font-size: 12px;
}
.wf-name { font-weight: 700; color: var(--accent); white-space: nowrap; }
.wf-step { color: var(--text-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wf-track {
  width: 80px; height: 4px; border-radius: 2px;
  background: var(--border); flex-shrink: 0;
}
.wf-fill { height: 100%; border-radius: 2px; background: var(--accent); transition: width 0.3s ease; }
.wf-cancel {
  padding: 2px 7px; border-radius: 4px; font-size: 11px;
  background: none; border: 1px solid var(--border);
  color: var(--text-muted); cursor: pointer;
}
.wf-cancel:hover { border-color: var(--error, #c0392b); color: var(--error, #c0392b); }
.wf-complete { color: var(--accent); font-size: 12px; padding: 4px 0; display: block; }

/* Workflows panel */
.wf-panel-header {
  padding: 12px 14px 8px; font-weight: 700;
  font-size: 13px; border-bottom: 1px solid var(--border);
}
.wf-cards { display: flex; flex-direction: column; gap: 0; }
.wf-card {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.wf-card:hover { background: var(--bg-input); }
.wf-card-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.wf-card-info { flex: 1; }
.wf-card-name { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
.wf-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 3px; }
.wf-card-steps { font-size: 11px; color: var(--text-muted); opacity: 0.7; }
.wf-card-start {
  padding: 5px 14px; border-radius: 6px;
  background: var(--accent); color: #fff;
  font-size: 12px; font-weight: 600; border: none;
  cursor: pointer; flex-shrink: 0; align-self: center;
}
.wf-card-start:hover { opacity: 0.88; }
```

---

## 8. Init Call

After the DOM is ready, call:

```js
renderWorkflowsPanel();
```

---

## Summary

| Piece | What it does |
|---|---|
| `WORKFLOWS` constant | Defines all workflows + steps — add more anytime |
| `startWorkflow(id)` | Loads step 1 prompt into chat input, starts progress bar |
| `advanceWorkflow()` | Called after each LLM response — moves to next step |
| `cancelWorkflow()` | Clears active workflow, hides progress bar |
| `renderWorkflowProgress()` | Live step/progress bar above chat input |
| `renderWorkflowsPanel()` | Workflow picker in the ⚡ Workflows tab |
| Ships with | Code Review (5 steps) + README Writer (4 steps) |

### Adding custom workflows later

Just add a new entry to `WORKFLOWS` — the UI auto-renders it. No other changes needed.

```js
WORKFLOWS['my-workflow'] = {
  name: 'My Workflow',
  icon: '🚀',
  description: 'Custom steps.',
  steps: [
    { label: 'Step 1', prompt: 'Your prompt here...' }
  ]
};
```
