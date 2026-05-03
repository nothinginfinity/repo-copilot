# Repo Copilot Architecture

## Goal

Create a touch-friendly app that lets a user browse a GitHub repo, export it in LLM-friendly formats, and chat with the codebase using whichever API provider they prefer.

## Principles

- Mobile first
- No server required for MVP
- In-memory secrets only
- Fast path from repo URL to usable context
- Provider-agnostic inference layer

## Screens

### 1. Home
- Repo URL input
- Recent repos
- Quick actions

### 2. Repo View
- File tree
- File preview
- Selection controls
- Download actions

### 3. Chat View
- Provider selector
- Model selector
- API key input
- Context controls
- Chat transcript

## Providers

The provider layer should normalize these fields:

- provider id
- label
- base URL
- auth header format
- chat endpoint path
- model list or user-entered model
- request body transformer
- response extractor

## Export formats

### ZIP
Standard folder/file archive.

### REPO_DUMP.txt
A single file with this structure:

```text
===== FILE: src/main.tsx =====
<contents>

===== FILE: package.json =====
<contents>
```

### MANIFEST.json
Metadata about files, sizes, and inclusion state.

## GitHub ingestion

Preferred path:
1. Parse owner/repo from URL.
2. Fetch default branch.
3. Fetch recursive tree.
4. Fetch blob contents for text files.
5. Skip binaries for text bundle, include them in ZIP when possible.

## Constraints

- iPhone Safari compatibility matters.
- Large repos need progressive loading.
- Token budgets require file selection and truncation controls.

## Future

- Prompt-driven patch generation
- GitHub commit and PR flows
- Space/MMCP integration
