# AFO Zip Gateway v2

Unified private JSON-RPC facade for the Zip tool family.

It turns repo writes, text patches, artifact storage, receipts, rollback hooks, and clone routing into one agent-facing filesystem surface instead of four separate utilities.

## Routes

- `GET /status`
- `GET /manifest.json`
- `POST /rpc`
- `POST /mcp`

## Core methods

- `zip.status`
- `zip.tools`
- `zip.plan`
- `zip.execute`
- `zip.receipt`
- `zip.rollback`
- `zip.repo.writeFile`
- `zip.repo.writeBatch`
- `zip.repo.planPatch`
- `zip.repo.applyPatch`
- `zip.repo.applyPatchBatch`
- `zip.clone.plan`
- `zip.clone.runBatch`
- `zip.clone.resume`
- `zip.clone.verify`
- `zip.clone.receipt`
- `zip.artifact.list`
- `zip.artifact.get`
- `zip.artifact.put`
- `zip.artifact.delete`
- `zip.artifact.head`
- `zip.artifact.presign`

## Safety defaults

Writes are dry-run by default.

```text
ZIP_DRY_RUN_DEFAULT=true
ZIP_WRITE_ENABLED=false
ZIP_DELETE_ENABLED=false
```

To write, pass:

```json
{
  "dry_run": false,
  "confirm_write": true
}
```

To delete, pass:

```json
{
  "confirm_delete": true
}
```

## Example

```json
{
  "jsonrpc": "2.0",
  "id": "patch-1",
  "method": "zip.repo.applyPatch",
  "params": {
    "owner": "nothinginfinity",
    "repo": "repo-copilot",
    "branch": "main",
    "path": "workers/example/index.js",
    "dry_run": true,
    "operations": [
      {
        "type": "replace",
        "old_text": "old",
        "new_text": "new"
      }
    ],
    "return_content": true
  }
}
```

## Notes

This is the v2 core facade. Direct repo write, repo patch, artifact list/get/put/delete/head, receipts, planning, and status are implemented here. Clone and advanced rollback namespaces are exposed and should route to the existing specialized Zip engines until v2.1 direct chunk/session execution is enabled.
