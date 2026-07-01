# Tool Spec

## github_vault_status

Returns binding readiness, counts, version, and available tools.

## stone_github_account

Indexes accessible repos for an owner.

Input:
- `owner`
- `visibility`: `all`, `public`, or `private`
- `limit`
- `max_files_per_repo`

## stone_github_repo

Indexes a single repo by walking its git tree and stoning meaningful files.

Input:
- `repo`
- `branch`
- `max_files`

## stone_github_file

Stones one exact file.

Input:
- `repo`
- `path`
- `ref`

## query_github_vault

Searches D1 stones using keyword scoring over repo, path, kind, summary, and flags.

Input:
- `query`
- `limit`

## get_repo_manifest

Returns a chain manifest for one repo.

Input:
- `repo`

## discover_repo_combinations

Finds complementary patterns, such as:
- `podcast_rss` -> `three_js_3d_ui`
- `cloudflare_worker` -> `cloudflare_config`
- `template_system` -> `dashboard_ui`

Input:
- `query`
- `repo`
- `limit`

## refresh_changed_repos

Checks branch SHA against stored repo metadata and only reindexes changed repos.
