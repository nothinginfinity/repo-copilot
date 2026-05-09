# .gitzip — Maildrop Drop Zone

This folder is the **intake maildrop** for gitzip-push envelopes.

Drop a `drop-*.zip` here and the [`gitzip-unpack` workflow](../.github/workflows/gitzip-unpack.yml) will validate and deploy the files inside it.

---

## How it works

```
browser / mobile / agent
        ↓
package files as drop-{timestamp}.zip
        ↓
include gitzip-manifest.json inside zip
        ↓
push zip to .gitzip/drop-{timestamp}.zip
        ↓
GitHub Actions validates manifest + integrity
        ↓
files deployed to repo at declared destinations
        ↓
zip drop deleted, commit pushed [skip ci]
```

---

## Manifest format (v2)

Every zip **must** contain a `gitzip-manifest.json` at the zip root:

```json
{
  "version": 2,
  "created": "2026-05-07T00:00:00Z",
  "target_branch": "main",
  "commit_message": "feat: deploy repo-copilot UI update",
  "artifact_type": "html_app",
  "dry_run": false,
  "files": [
    {
      "src": "repo-copilot.html",
      "dest": "repo-copilot.html",
      "sha256": "<sha256-hex-of-file>",
      "size": 62144
    }
  ]
}
```

See [gitzip-manifest.schema.json](./gitzip-manifest.schema.json) for the full schema.

---

## Security rules (enforced by the unpack Action)

The following destination paths are **always rejected**:

| Pattern | Reason |
|---|---|
| Absolute paths (`/etc/...`) | Can't escape repo root |
| Path traversal (`../anything`) in `dest` | Can't escape repo root |
| Path traversal (`../anything`) in `src` | Can't escape temp unpack dir |
| `.git/**` | Protects git internals |
| `.gitzip/**` or `_gitzip/**` | Prevents recursive drops |
| `.github/workflows/**` | Workflow files execute code — blocked by default |
| > 200 files per drop | Zip bomb / runaway drop guard |
| > 50 MB unpacked total per drop | Zip bomb / resource exhaustion guard |

To allow workflow writes (advanced, trusted deployments only), set `"allow_workflow_writes": true` in the manifest.

> ⚠️ **`allow_workflow_writes: true` deploys executable GitHub Actions YAML.**
> Only use this from a fully trusted, authenticated source. A compromised drop
> with this flag set can modify CI/CD pipelines.

---

## Dry-run mode

Set `"dry_run": true` in the manifest to validate and log everything without writing any files or committing. Use this to test a manifest before a real push.

Dry-run can also be triggered at the CLI/Action level with the `--dry-run` flag, which takes precedence over the manifest value.

---

## Integrity checks

The `sha256` and `size` fields in each file entry are **optional but strongly recommended**.

If provided:
- The unpack Action verifies the file matches before writing it.
- A mismatch aborts the entire drop with a clear error in the Actions log.

To compute SHA-256 in the browser:
```js
const buf = await file.arrayBuffer();
const hashBuf = await crypto.subtle.digest('SHA-256', buf);
const hex = Array.from(new Uint8Array(hashBuf))
  .map(b => b.toString(16).padStart(2, '0')).join('');
```

---

## PAT / authentication

> ⚠️ **Use a fine-grained PAT scoped to this repo only.**
>
> Required permission: **Contents → Read and Write**
>
> Do NOT use a classic PAT with broad `repo` scope — classic PATs grant write
> access to every repo in your account. A leaked classic PAT is a full account
> compromise. A leaked fine-grained repo-scoped PAT is limited blast radius.
>
> Do NOT commit your PAT to any file. Store it as a GitHub Actions secret
> (`Settings → Secrets → Actions`) or in a local `.env` file that is
> `.gitignore`d.

**Minimum PAT permissions for gitzip-push:**

| Permission | Level | Why |
|---|---|---|
| Contents | Read & Write | Push zip drops, receive deployed commits |
| Actions | Read | (Optional) Monitor workflow run status |
| Metadata | Read | Required by all fine-grained PATs |

Do not grant Secrets, Administration, or Workflows permissions unless you
have a specific need — and never grant Organization permissions.

---

## Naming convention

Drop files must be named `drop-{timestamp}.zip`, e.g.:

```
drop-20260507-143022.zip
drop-20260507T143022Z.zip
```

This ensures uniqueness and avoids the workflow missing an update on re-pushed paths.

---

## Security hardening changelog

| Version | Date | Change |
|---|---|---|
| v1.1 | 2026-05-09 | `execSync` → `execFileSync` (no shell injection surface) |
| v1.1 | 2026-05-09 | `rm -rf` shell call → `fs.rmSync` (Node built-in, no shell) |
| v1.1 | 2026-05-09 | Added `normalizeSrc()` — src paths validated against tmpDir, not just dest |
| v1.1 | 2026-05-09 | Fixed `normalizeDest` root edge-case — writing to repo root itself now blocked |
| v1.1 | 2026-05-09 | Zip bomb guard — max 200 files per drop |
| v1.1 | 2026-05-09 | Zip bomb guard — max 50 MB unpacked total per drop |
