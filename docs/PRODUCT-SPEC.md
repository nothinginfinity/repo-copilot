# Product Spec

## Product name
Repo Copilot

## One-line description
A pocket GitHub workspace for downloading repos and chatting with them using any supported AI provider.

## Target user
A mobile-first builder working primarily from iPhone who wants repo access, exports, and code chat without a desktop setup.

## Jobs to be done

- Turn any GitHub repo into a usable local artifact quickly.
- Feed an entire repo into an LLM in a structured way.
- Switch between model vendors depending on price, speed, or quality.
- Work from a phone without terminal setup.

## Must-have features

- Paste GitHub URL
- Load repo metadata
- Browse tree
- Preview text files
- Multi-select files
- Export ZIP
- Export text bundle
- Choose provider
- Enter API key
- Choose model
- Chat using selected repo context

## Nice-to-have

- Saved provider presets
- Token estimator
- Smart file filtering
- Chunking presets for large repos
- Chat modes: explain, debug, summarize, refactor
- Copy prompt package

## Non-goals for MVP

- Full IDE
- Local git commit engine
- Background sync daemon
- Self-hosted backend

## Success criteria

- Can load a public repo in under 10 seconds for small projects.
- Can export a usable text bundle in one tap.
- Can start a code chat in under 30 seconds from app open.
