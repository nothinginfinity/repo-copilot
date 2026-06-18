# afo-github-api-mcp

A token-efficient MCP server for the entire GitHub REST API, mirroring
afo-cloudflare-api-mcp's search+call pattern instead of registering one tool per endpoint.

## Tools

| Tool | Description |
|---|---|
| `gh_api_status` | Health check, binding presence, spec-seeded status |
| `search` | Search the GitHub OpenAPI spec by free text and/or tag |
| `call` | Call any GitHub REST API endpoint directly (method, path, owner, repo, query, body) |
| `seed_spec` | Fetch the latest spec from `github/rest-api-description` and rebuild the R2 index |
| `trigger_workflow_dispatch` | Trigger an Actions workflow_dispatch run |
| `list_workflow_runs` | List recent Actions runs, optionally scoped to a workflow/branch/status |
| `get_workflow_run` | Status/conclusion of one run |
| `list_workflow_run_jobs` | Per-job, per-step status for one run (diagnose failed deploys without log zips) |

## Why this exists

Same rationale as afo-cloudflare-api-mcp: the GitHub REST API has 1000+ endpoints, far
more than is worth registering as individual MCP tools. `search` finds the right endpoint
from a lean index (method, path, tags, summary only), and `call` hits it directly with
GITHUB_TOKEN attached. The four Actions tools are typed on top because "reliably triggering
GitHub Actions deploys" was an existing, named pain point - these give direct visibility
into dispatch/run/job status without needing to parse a generic `call` response by hand.

## Setup (one time)

1. Deploy this worker (handled by the deploy pipeline).
2. In the Cloudflare dashboard, open this worker -> Settings -> Variables and Secrets, and
   add `GITHUB_TOKEN` (secret) - same token used by `afo-worker-transport-mcp` / `github-mcp`.
3. Confirm the R2 binding `SPEC` -> bucket `afo-site-content` and the `DEFAULT_OWNER` /
   `DEFAULT_REPO` vars are attached (set via the deploy pipeline).
4. Call `seed_spec` once (or `GET /admin/seed`) to populate the index.

## Notes

- Spec index is stored at R2 key `gh-openapi-spec/index.json` inside the shared
  `afo-site-content` bucket - same bucket afo-cloudflare-api-mcp uses, different prefix.
- `call` auto-substitutes literal `{owner}` / `{repo}` in a path with the owner/repo
  arguments, falling back to `DEFAULT_OWNER` / `DEFAULT_REPO` if omitted.
- Responses over ~30k characters are truncated with a note; narrow the query or use
  pagination params (`per_page`, `page`) for large result sets.
