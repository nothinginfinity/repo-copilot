# notion-ops Adapter

Calls the Notion API from any agent using only two MCP tool calls.

## Pattern

```
Agent writes → spaces/notion-ops/queue.json
  ↓ triggers .github/workflows/notion-ops.yml
    ↓ calls api.notion.com
      ↓ writes spaces/notion-ops/result.json
Agent reads → spaces/notion-ops/result.json
```

**Wait time:** ~30–60 seconds. **Tool calls:** 2 (write + read).

## Setup

1. Create a Notion Integration at `notion.so/my-integrations`
2. Copy the Internal Integration Token
3. Add as `NOTION_TOKEN` in repo Settings → Secrets → Actions
4. Share your Notion pages/databases with the integration (in Notion: open page → ⋯ → Connections → add your integration)

## Available Ops

| Op | Required Fields | Returns |
|----|----------------|---------|
| `list_databases` | none | `databases[]` with id, title, url |
| `get_page` | `page_id` | full Notion page object |
| `create_page` | `parent`, `properties`, `children` (opt) | `page_id`, `page_url` |
| `query_database` | `database_id` | `results[]`, `has_more` |
| `update_block` | `block_id`, `block` | `block_id` |

## Important: Share Pages with Your Integration

The integration token can only access pages/databases that have been explicitly shared with it.
For each page or database you want agents to use:
1. Open the page in Notion
2. Click ⋯ (top right) → Connections → find your integration → Confirm

## QA.Stone Classification

- **Type:** `SKILL`
- **glow_channel:** `skill.ops`
- **adapter_ref:** `spaces/notion-ops/queue.json`
- **Spec:** `specs/ops-adapter-spec.md`
