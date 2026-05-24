# vector.spec PRD

## Summary

`vector.spec` is a GitHub-backed, vector-searchable archive of reusable specs, templates, examples, boot files, prompts, tool manifests, and Workcell instruction packs.

It exists to reduce token waste and speed up generation by retrieving the right prior artifacts instead of asking an LLM to recreate structure from scratch.

## Problem

Agent development produces many valuable artifacts:

- HTML specs
- markdown specs
- boot instruction files
- tool templates
- generated Worker templates
- Workcell manifests
- agent routing docs
- UI patterns
- API/data model patterns

Today, these artifacts are scattered across chats, repos, files, and memory. When a new LLM instance needs to generate a similar artifact, Jared often has to re-explain the pattern or paste links manually.

This wastes tokens and time.

## Product Goal

Create a searchable spec memory that any connected agent can query from a Workcell.

The ideal flow:

```txt
Jared brainstorms a new artifact
→ agent calls search_specs
→ vector.spec returns similar examples and templates
→ agent fetches exact source files
→ agent generates a new artifact with consistent structure and style
→ new artifact is committed and indexed
```

## Users

### Jared

Mobile-first builder who wants reusable, version-controlled instructions and templates across ChatGPT, Claude, Alice/ALLIS, and future agents.

### Agent Workcells

Project-specific LLM instances with tool belts, boot instructions, and inboxes. Each workcell can retrieve relevant examples from vector.spec.

### Future Public Users

Builders who want a catalogue of reusable AI-readable specs and templates for mobile agent development.

## Non-Goals

- Not a general-purpose document manager.
- Not a replacement for GitHub.
- Not a replacement for skills.
- Not a giant prompt dump.
- Not a final product UI requirement yet; backend and indexing come first.

## Requirements

### R1 — Durable Spec Storage

Every spec artifact must have a durable source path in GitHub.

### R2 — Metadata Registry

Every artifact should have metadata:

- id
- title
- type
- category
- tags
- repo
- path
- raw_url
- summary
- use_cases
- related_tools
- created_at
- updated_at

### R3 — Vector Search

Artifacts should be indexed by semantic content and metadata into a vector database.

### R4 — Exact Fetch

Search results should include a stable GitHub raw URL or repo path so the full artifact can be fetched when needed.

### R5 — MCP Tools

Expose MCP tools so agents can search and fetch specs from their Workcells.

### R6 — Incremental Indexing

New specs should be addable without rebuilding the whole system.

### R7 — Workcell Integration

A Workcell boot file can point to a specific vector.spec index or filter set.

## Success Metrics

- Agents retrieve useful examples before generating specs.
- Less repeated prompting from Jared.
- More consistent spec output style.
- Lower context usage than pasting full examples.
- Faster creation of new product/spec artifacts.

## Initial Implementation Strategy

1. Create GitHub repo/folder structure.
2. Define artifact metadata schema.
3. Seed example records from existing specs.
4. Build search/fetch MCP tool spec.
5. Connect to Cloudflare D1 + Vectorize.
6. Add Workcell boot instruction pattern.
7. Add auto-indexing later.
