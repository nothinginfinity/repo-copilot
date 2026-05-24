# vector.spec

> Version-controlled spec memory for mobile agent development.

`vector.spec` is the searchable spec archive for AFO Toolsmith, Mobile MCP, Workcells, and future agent build systems. It stores specs, templates, boot files, examples, and implementation patterns in GitHub, then indexes them into a vector database so LLM workcells can retrieve the right examples on demand instead of loading huge instruction files every session.

## Core Thesis

Context windows should not be used as permanent storage. Specs should live in GitHub, be indexed into a vector database, and be retrieved only when relevant.

```txt
small boot instructions
+ searchable spec index
+ fetch exact source when needed
= lower token cost, better consistency, faster mobile builds
```

## What This Builds

A reusable system for:

- saving specs and templates as durable artifacts;
- indexing specs into Cloudflare Vectorize or another vector database;
- searching specs by project intent, artifact type, tool, UI style, or implementation pattern;
- fetching exact source files from GitHub;
- generating new specs from the best matching prior examples;
- giving each Workcell access to only the templates it needs.

## Product Layers

```txt
Spec Artifact
  A single HTML spec, markdown spec, boot file, template, prompt, tool manifest, or workcell manifest.

Spec Registry
  GitHub index of all known spec artifacts and metadata.

Vector Index
  Embeddings for semantic search over the registry.

Retrieval Tools
  MCP tools for search, fetch, summarize, and cite.

Instruction Pack
  Lightweight boot file that tells an agent how to use vector.spec.

Workcell Integration
  Each Workcell can attach a spec index relevant to its role.
```

## Target MCP Tools

```txt
search_specs
fetch_spec
list_spec_types
index_spec
refresh_index
recommend_templates
create_spec_from_template
```

## Initial Scope

This seed lives inside `repo-copilot/products/vector.spec/` until a dedicated `nothinginfinity/vector.spec` repo is created. The current GitHub MCP connector can write files but does not expose a create-repo tool yet.

## Status

Seed structure created. Ready for Alice/Claude/ChatGPT to formalize into a dedicated repo and Cloudflare-backed index.
