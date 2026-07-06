# ask_github read-only acceptance tests

All cases below are read-only. None require mutation permission.

## A. Health

Tool: `gh_api_status`

Expected:

- `status` is `ok`
- `tools` includes `ask_github`
- spec index is seeded

## B. Repository info

Tool: `ask_github`

Input:

```json
{
  "request": "Read-only test: inspect repository metadata for nothinginfinity/repo-copilot. Return selected endpoint, final resolved path, default branch, visibility/private flag, and audit trail. Do not mutate anything.",
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /repos/{owner}/{repo}`
- final resolved path is `/repos/nothinginfinity/repo-copilot`
- audit includes extracted path params for `owner` and `repo`

## C. Workflow runs list

Tool: `ask_github`

Input:

```json
{
  "request": "Read-only test: list recent GitHub Actions workflow runs for repo nothinginfinity/repo-copilot. Return count, first few runs, selected endpoint, final resolved path, and audit trail. Do not mutate anything.",
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /repos/{owner}/{repo}/actions/runs`
- final resolved path is `/repos/nothinginfinity/repo-copilot/actions/runs`
- audit includes final resolved path

## D. Parameterized workflow run jobs

Tool: `ask_github`

Input:

```json
{
  "request": "Read-only test: list jobs and steps for workflow run_id exactly 28769108115 in repo nothinginfinity/repo-copilot. Return selected endpoint, extracted path params, final resolved path, and job names/statuses. Do not mutate anything.",
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`
- extracted `run_id` is `28769108115`
- final resolved path contains `/actions/runs/28769108115/jobs`
- result includes job names/statuses

## E. Repository contents path

Tool: `ask_github`

Input:

```json
{
  "request": "Read-only test: read repository contents for path exactly apps/afo-github-api-mcp/worker.js in repo nothinginfinity/repo-copilot. Return selected endpoint, extracted path params, final resolved path, file sha/name/size, and audit trail. Do not mutate anything.",
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "dry_run": false
}
```

Expected:

- `ok: true`
- HTTP status `200`
- selected endpoint is `GET /repos/{owner}/{repo}/contents/{path}`
- extracted `path` is `apps/afo-github-api-mcp/worker.js`
- final resolved path contains `/contents/apps/afo-github-api-mcp/worker.js`

## F. Missing path param dry run

Tool: `ask_github`

Input:

```json
{
  "request": "Dry run only: get workflow run jobs, but do not provide a run_id.",
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "dry_run": true
}
```

Expected:

- no GitHub execution
- if a parameterized endpoint is selected and `run_id` is missing, return `ok: false`
- `error_type` is `missing_path_param`
- `missing_params` includes `run_id`
- selected endpoint and audit candidates are returned
