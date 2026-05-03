# UI Spec

## Layout

A single-page app with three stacked mobile zones:

1. Header
2. Workspace tabs
3. Bottom action rail

## Home screen wireframe

```text
┌──────────────────────────────┐
│ Repo Copilot           ◐     │
│ Paste a GitHub repo URL      │
│ [ github.com/owner/repo    ] │
│ [ Load Repo ]                │
│ Recent                        │
│ • owner/repo-a               │
│ • owner/repo-b               │
└──────────────────────────────┘
```

## Repo screen wireframe

```text
┌──────────────────────────────┐
│ ← repo-copilot         Export│
│ Files  Preview  Chat         │
│ ──────────────────────────── │
│ ▸ src                        │
│ ▸ docs                       │
│ • package.json               │
│ • README.md                  │
│                              │
│ [ Download ZIP ]             │
│ [ Download REPO_DUMP.txt ]   │
└──────────────────────────────┘
```

## Chat screen wireframe

```text
┌──────────────────────────────┐
│ Chat with repo               │
│ Provider [ OpenAI        ▾ ] │
│ Model    [ gpt-4.1       ▾ ] │
│ API key  [ *************** ] │
│ Context  [ Selected files ▾] │
│                              │
│ You: explain this repo       │
│ AI:  This repo is a...       │
│                              │
│ [ Ask about this codebase  ] │
└──────────────────────────────┘
```

## Interaction rules

- Primary actions must be thumb-reachable.
- Large tap targets only.
- Avoid hover-dependent interaction.
- Keep critical settings on one screen.
- Never require localStorage for core function.
