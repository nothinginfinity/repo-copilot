# vector.spec MCP Tool Definitions

These are the first tools the `vector.spec` MCP server should expose.

## search_specs

Search the vector.spec index for artifacts relevant to a brainstorm, prompt, project, or requested output.

### Input

```json
{
  "query": "Need an HTML spec for a mobile MCP workcell generator",
  "type": "html.spec",
  "category": "agent-infrastructure",
  "limit": 5
}
```

### Output

```json
{
  "matches": [
    {
      "id": "spec_mobile_mcp_workcell",
      "title": "Mobile MCP Workcell Spec",
      "type": "html.spec",
      "summary": "Defines Workcells as tool belts plus boot instructions, inboxes, identity, and routing.",
      "repo": "nothinginfinity/repo-copilot",
      "path": "specs/mobile-mcp-workcell.spec.html",
      "raw_url": "https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/specs/mobile-mcp-workcell.spec.html",
      "score": 0.91
    }
  ]
}
```

## fetch_spec

Fetch the full canonical artifact content by ID or repo path.

### Input

```json
{
  "id_or_path": "spec_mobile_mcp_workcell"
}
```

### Output

```json
{
  "id": "spec_mobile_mcp_workcell",
  "title": "Mobile MCP Workcell Spec",
  "type": "html.spec",
  "content": "<!doctype html>...",
  "metadata": {}
}
```

## index_spec

Register or update a GitHub-backed artifact and queue embedding.

### Input

```json
{
  "repo": "nothinginfinity/repo-copilot",
  "path": "specs/mobile-mcp-workcell.spec.html",
  "type": "html.spec",
  "title": "Mobile MCP Workcell Spec",
  "tags": ["mcp", "workcell", "mobile"]
}
```

## refresh_index

Rebuild embeddings for all changed artifacts.

### Input

```json
{
  "scope": "changed | all | artifact",
  "artifact_id": "optional"
}
```

## recommend_templates

Given a brainstorm, recommend the best templates/examples to fetch before writing.

### Input

```json
{
  "brainstorm": "I need a spec for a local mobile model that can call tools on the phone.",
  "artifact_type": "html.spec",
  "limit": 3
}
```

## create_spec_from_template

Use retrieved examples to generate a new artifact draft. This can be implemented later; retrieval is the immediate priority.

### Input

```json
{
  "brainstorm": "string",
  "artifact_type": "html.spec",
  "template_ids": ["spec_mobile_mcp_workcell"],
  "output_path": "specs/new-file.spec.html"
}
```

## Tool Priority

Phase 1 requires only:

1. `search_specs`
2. `fetch_spec`
3. `index_spec`

Everything else can come later.
