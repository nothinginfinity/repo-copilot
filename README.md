# Repo Copilot

A mobile-first GitHub repo browser, downloader, and multi-provider code copilot optimized for iPhone workflows.

## Purpose

Repo Copilot is designed for a simple flow:

1. Paste a GitHub repository URL.
2. Fetch the repository tree and file contents.
3. Download the repo as a ZIP or as a single LLM-friendly text bundle.
4. Chat against the repo with your own model provider and API key.

It is built for people who want a lightweight, local-feeling copilot without setting up a laptop-heavy environment.

## Core features

- Mobile-first single-page UI
- GitHub repo URL parser
- File tree explorer
- Download as ZIP
- Download as `REPO_DUMP.txt`
- Multi-provider chat abstraction
- Provider toggle for OpenAI-compatible and custom endpoints
- In-memory API key handling only
- Designed for iPhone use

## Planned providers

The app architecture is designed to support these providers through a unified adapter layer:

- OpenAI
- Groq
- Gemini
- xAI
- Cerebras
- Fireworks
- Mistral
- DeepSeek
- Any OpenAI-compatible endpoint

## Architecture

### Frontend

- React + Vite
- Zustand for local state
- JSZip for archive generation
- Mobile-first responsive layout

### Data flow

1. User pastes repo URL.
2. App resolves owner/repo.
3. App fetches repository tree and contents through GitHub APIs.
4. App stores files in in-memory state.
5. User downloads bundle or opens chat.
6. Chat sends selected files + prompt to chosen provider.

### Security model

- API keys are kept in memory only.
- No backend required for MVP.
- GitHub access can start with public repos and later support personal access tokens for private repos.

## MVP scope

### Phase 1

- Paste repo link
- Load file tree
- Preview files
- Download ZIP
- Download text bundle

### Phase 2

- Provider switcher
- API key entry
- Chat against selected repo context
- File inclusion controls
- Token budget controls

### Phase 3

- Private repo PAT support
- Saved sessions
- Prompt presets
- Diff-aware editing workflows

## Example use cases

- Download a repo on iPhone and open it in Working Copy or another local editor
- Generate a single text dump for Perplexity, Claude, or ChatGPT context
- Ask architecture questions about a repo without cloning it to a laptop
- Compare files and inspect code structure on mobile

## Status

Initial product scaffold and spec repository.
