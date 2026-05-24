# vector.spec System Spec

## Purpose

`vector.spec` is the retrieval memory layer for specs, templates, instructions, and build patterns.

It supports mobile-first agent development by letting each LLM Workcell retrieve relevant examples and exact source artifacts from a searchable index instead of carrying large templates in project instructions.

## Core Principle

```txt
Instructions tell the agent what to do.
Vector search finds the right example.
GitHub stores the canonical source.
MCP tools connect the model to the index.
```

## Architecture

```txt
GitHub specs/templates
      ↓
metadata extraction
      ↓
D1 artifact registry
      ↓
embedding generation
      ↓
Cloudflare Vectorize index
      ↓
MCP retrieval tools
      ↓
Agent Workcells
```

## Artifact Types

- `html.spec`
- `markdown.spec`
- `boot.instructions`
- `tool.manifest`
- `toolbelt.manifest`
- `workcell.manifest`
- `worker.template`
- `api.schema`
- `prompt.template`
- `handoff.template`
- `recipe`
- `decision.record`

## Metadata Schema

```json
{
  "id": "spec_mobile_mcp_workcell",
  "title": "Mobile MCP Workcell Spec",
  "type": "html.spec",
  "category": "agent-infrastructure",
  "tags": ["mcp", "workcell", "mobile", "agent-bridge"],
  "summary": "Defines Workcells as tool belts plus boot instructions, inboxes, identity, and routing.",
  "repo": "nothinginfinity/repo-copilot",
  "path": "specs/mobile-mcp-workcell.spec.html",
  "raw_url": "https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/specs/mobile-mcp-workcell.spec.html",
  "use_cases": ["generate workcell specs", "design agent coordination UI"],
  "related_tools": ["search_specs", "fetch_spec", "commit_file"],
  "created_at": "2026-05-23T00:00:00Z",
  "updated_at": "2026-05-23T00:00:00Z"
}
```

## D1 Tables

```sql
CREATE TABLE IF NOT EXISTS spec_artifacts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  summary TEXT,
  repo TEXT NOT NULL,
  path TEXT NOT NULL,
  raw_url TEXT,
  tags_json TEXT DEFAULT '[]',
  use_cases_json TEXT DEFAULT '[]',
  related_tools_json TEXT DEFAULT '[]',
  content_hash TEXT,
  vector_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spec_index_jobs (
  id TEXT PRIMARY KEY,
  artifact_id TEXT,
  status TEXT DEFAULT 'queued',
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);
```

## Vector Document Shape

```json
{
  "id": "vec_spec_mobile_mcp_workcell",
  "text": "Title: Mobile MCP Workcell Spec\nType: html.spec\nTags: mcp, workcell, mobile...\nSummary: ...\nContent excerpt: ...",
  "metadata": {
    "artifact_id": "spec_mobile_mcp_workcell",
    "type": "html.spec",
    "repo": "nothinginfinity/repo-copilot",
    "path": "specs/mobile-mcp-workcell.spec.html"
  }
}
```

## MCP Tool Specs

### search_specs

Search the vector.spec index for relevant spec artifacts.

Input:

```json
{
  "query": "string",
  "type": "html.spec | markdown.spec | boot.instructions | tool.manifest | any",
  "category": "string optional",
  "limit": 5
}
```

Output:

```json
{
  "matches": [
    {
      "id": "spec_mobile_mcp_workcell",
      "title": "Mobile MCP Workcell Spec",
      "type": "html.spec",
      "summary": "...",
      "repo": "nothinginfinity/repo-copilot",
      "path": "specs/mobile-mcp-workcell.spec.html",
      "raw_url": "https://raw.githubusercontent.com/...",
      "score": 0.91
    }
  ]
}
```

### fetch_spec

Fetch the full canonical source for a spec artifact.

Input:

```json
{
  "id_or_path": "spec_mobile_mcp_workcell"
}
```

Output:

```json
{
  "id": "spec_mobile_mcp_workcell",
  "title": "Mobile MCP Workcell Spec",
  "content": "<!doctype html>...",
  "metadata": {}
}
```

### index_spec

Add or update a spec artifact in the registry and queue embedding.

Input:

```json
{
  "repo": "nothinginfinity/repo-copilot",
  "path": "specs/mobile-mcp-workcell.spec.html",
  "type": "html.spec",
  "title": "Mobile MCP Workcell Spec",
  "tags": ["mcp", "workcell"]
}
```

### recommend_templates

Given a brainstorm or task, recommend templates/examples to use.

Input:

```json
{
  "brainstorm": "string",
  "artifact_type": "html.spec",
  "limit": 3
}
```

## Workcell Boot Pattern

A Workcell instruction file should include:

```txt
When generating specs or templates, first call search_specs with the current brainstorm.
Fetch only the top relevant examples.
Use retrieved examples for structure and style.
Do not load the entire archive into context.
Commit new artifacts and index them when asked.
```

## Safety

- Retrieval tools are read-only by default.
- Indexing tools may write metadata, not delete artifacts.
- No destructive GitHub operations.
- Exact source should come from GitHub, not arbitrary URLs, unless explicitly allowed.
- Sensitive/private specs should have access flags before public indexing.

## Roadmap

1. Seed GitHub structure.
2. Add metadata registry and initial seed index.
3. Build MCP retrieval Worker.
4. Add Cloudflare D1 tables.
5. Add Vectorize integration.
6. Add Workcell instruction pack.
7. Add UI for browsing and indexing specs.
8. Add automatic indexing on GitHub commits.
