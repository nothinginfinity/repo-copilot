const VERSION = '0.2.1-github-complete';

const METHODS = [
  'zip.status',
  'zip.tools',
  'zip.manifest',
  'zip.plan',
  'zip.execute',
  'zip.receipt',
  'zip.rollback',
  'zip.repo.writeFile',
  'zip.repo.writeBatch',
  'zip.repo.planPatch',
  'zip.repo.applyPatch',
  'zip.repo.applyPatchBatch',
  'zip.clone.plan',
  'zip.clone.runBatch',
  'zip.clone.resume',
  'zip.clone.verify',
  'zip.clone.receipt',
  'zip.artifact.list',
  'zip.artifact.get',
  'zip.artifact.put',
  'zip.artifact.delete',
  'zip.artifact.head',
  'zip.artifact.presign'
];

const RISK = {
  'zip.status': 'read',
  'zip.tools': 'read',
  'zip.manifest': 'read',
  'zip.plan': 'read',
  'zip.execute': 'write',
  'zip.receipt': 'read',
  'zip.rollback': 'write',
  'zip.repo.writeFile': 'write',
  'zip.repo.writeBatch': 'write',
  'zip.repo.planPatch': 'read',
  'zip.repo.applyPatch': 'write',
  'zip.repo.applyPatchBatch': 'write',
  'zip.clone.plan': 'read',
  'zip.clone.runBatch': 'write',
  'zip.clone.resume': 'write',
  'zip.clone.verify': 'read',
  'zip.clone.receipt': 'read',
  'zip.artifact.list': 'read',
  'zip.artifact.get': 'read',
  'zip.artifact.put': 'write',
  'zip.artifact.delete': 'destructive',
  'zip.artifact.head': 'read',
  'zip.artifact.presign': 'network'
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (request.method === 'OPTIONS') {
        return withCors(new Response(null, { status: 204 }));
      }

      if (request.method === 'GET') {
        if (url.pathname === '/' || url.pathname === '/status') {
          return json(await status(env));
        }
        if (url.pathname === '/manifest.json' || url.pathname === '/mcp' || url.pathname === '/tools') {
          return json(manifest(env));
        }
        if (url.pathname === '/examples.json') {
          return json(examples());
        }
        return json({ ok: false, error: 'not_found' }, 404);
      }

      if (request.method === 'POST' && ['/', '/rpc', '/mcp'].includes(url.pathname)) {
        const body = await request.json().catch(() => null);
        if (Array.isArray(body)) {
          return json(await Promise.all(body.map((call) => rpc(call, env, ctx))));
        }
        return json(await rpc(body, env, ctx));
      }

      return json({ ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json({ ok: false, error: error.message || String(error) }, 500);
    }
  }
};

async function rpc(call, env, ctx) {
  const id = call && Object.prototype.hasOwnProperty.call(call, 'id') ? call.id : null;

  try {
    if (!call || call.jsonrpc !== '2.0' || !call.method) {
      return rpcError(id, -32600, 'Invalid JSON-RPC request');
    }

    return {
      jsonrpc: '2.0',
      id,
      result: await run(call.method, call.params || {}, env, ctx)
    };
  } catch (error) {
    return rpcError(id, error.code || -32000, error.message || String(error), error.details);
  }
}

function rpcError(id, code, message, data) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data ? { data } : {})
    }
  };
}

async function run(method, params, env, ctx) {
  if (!METHODS.includes(method)) {
    throw makeError('Unknown method ' + method, -32601);
  }

  if (method === 'zip.status') return status(env);
  if (method === 'zip.tools' || method === 'zip.manifest') return manifest(env);
  if (method === 'zip.plan') return plan(params, env);
  if (method === 'zip.execute') return run(requireValue(params, 'method'), params.params || {}, env, ctx);
  if (method === 'zip.receipt') return listReceipts(params, env);
  if (method === 'zip.rollback') return rollback(params, env, ctx);

  if (method === 'zip.repo.writeFile') {
    return writeFiles(
      {
        ...params,
        files: [
          {
            path: requireValue(params, 'path'),
            content: requireValue(params, 'content'),
            content_type: params.content_type
          }
        ]
      },
      env,
      ctx,
      method
    );
  }

  if (method === 'zip.repo.writeBatch') return writeFiles(params, env, ctx, method);
  if (method === 'zip.repo.planPatch') return planTextPatch(params);
  if (method === 'zip.repo.applyPatch') return applyRepoPatch(params, env, ctx);
  if (method === 'zip.repo.applyPatchBatch') return applyPatchBatch(params, env, ctx);
  if (method.startsWith('zip.artifact.')) return artifact(method, params, env, ctx);
  if (method.startsWith('zip.clone.')) return cloneDelegation(method, params);

  throw makeError('Unhandled method ' + method, -32603);
}

async function status(env) {
  return {
    method: 'zip.status',
    ok: true,
    name: 'afo-zip-gateway-v2',
    version: VERSION,
    jsonrpc: '2.0',
    dry_run_default: dryRunDefault(env),
    write_enabled: env.ZIP_WRITE_ENABLED === 'true',
    delete_enabled: env.ZIP_DELETE_ENABLED === 'true',
    default_owner: env.DEFAULT_OWNER || null,
    default_branch: env.DEFAULT_BRANCH || 'main',
    default_bucket: env.DEFAULT_BUCKET || null,
    bindings: {
      github_token: Boolean(env.GITHUB_TOKEN),
      r2_native: Boolean(getBucket(env))
    },
    routes: ['GET /', 'GET /status', 'GET /manifest.json', 'GET /examples.json', 'POST /rpc', 'POST /mcp'],
    methods: METHODS
  };
}

function manifest(env) {
  return {
    method: 'zip.manifest',
    ok: true,
    name: 'afo-zip-gateway-v2',
    version: VERSION,
    transport: 'json-rpc-2.0',
    auth: 'private-worker-secrets-no-user-oauth',
    dry_run_default: dryRunDefault(env),
    routes: ['GET /status', 'GET /manifest.json', 'GET /examples.json', 'POST /rpc', 'POST /mcp'],
    methods: METHODS.map((method) => ({
      id: method,
      risk: RISK[method] || 'read',
      environment: environmentFor(method),
      requiredRole: roleFor(method),
      requiresApproval: false
    })),
    bindings: {
      GITHUB_TOKEN: 'secret',
      ZIP_ARTIFACTS: 'r2',
      DEFAULT_OWNER: env.DEFAULT_OWNER || 'nothinginfinity',
      DEFAULT_BRANCH: env.DEFAULT_BRANCH || 'main'
    }
  };
}

function examples() {
  return {
    status: {
      jsonrpc: '2.0',
      id: 'status-1',
      method: 'zip.status',
      params: {}
    },
    plan_patch_content: {
      jsonrpc: '2.0',
      id: 'plan-patch-1',
      method: 'zip.repo.planPatch',
      params: {
        content: 'hello old world\n',
        operations: [{ type: 'replace', old_text: 'old', new_text: 'new' }],
        verify: [{ contains: 'hello new world' }],
        return_content: true
      }
    },
    write_file_dry_run: {
      jsonrpc: '2.0',
      id: 'write-file-1',
      method: 'zip.repo.writeFile',
      params: {
        owner: 'nothinginfinity',
        repo: 'repo-copilot',
        branch: 'main',
        path: 'tmp/zip-gateway-v2-test.txt',
        content: 'hello from Zip Gateway v2\n',
        dry_run: true
      }
    }
  };
}

function plan(params, env) {
  const text = String(params.intent || params.task || '').toLowerCase();
  let selected = 'zip.tools';

  if (text.includes('patch') || text.includes('edit') || text.includes('modify')) {
    selected = 'zip.repo.applyPatch';
  } else if (text.includes('batch')) {
    selected = 'zip.repo.writeBatch';
  } else if (text.includes('write') || text.includes('create') || text.includes('file')) {
    selected = 'zip.repo.writeFile';
  } else if (text.includes('clone')) {
    selected = 'zip.clone.plan';
  } else if (text.includes('artifact') || text.includes('r2') || text.includes('bundle')) {
    selected = 'zip.artifact.put';
  } else if (text.includes('receipt') || text.includes('audit')) {
    selected = 'zip.receipt';
  }

  return {
    method: 'zip.plan',
    ok: true,
    selected_method: selected,
    dry_run_default: dryRunDefault(env),
    proposed_call: {
      jsonrpc: '2.0',
      id: 'rpc_' + crypto.randomUUID(),
      method: selected,
      params: params.params || {}
    }
  };
}

async function writeFiles(params, env, ctx, method) {
  const target = normalizeTarget(params, env);
  enforceOwner(target.owner, env);

  const files = requireValue(params, 'files');
  if (!Array.isArray(files) || files.length === 0) {
    throw makeError('files must be a non-empty array', -32602);
  }

  const sessionId = params.session_id || 'zip_sess_' + crypto.randomUUID();
  const receiptId = 'zip_receipt_' + crypto.randomUUID();
  const dry = isDryRun(params, env);

  if (dry || !writeConfirmed(params, env)) {
    const receipt = await writeReceipt(method, sessionId, receiptId, target, {
      dry_run: true,
      planned_files: files.map((file) => file.path)
    }, env, ctx);

    return {
      method,
      ok: true,
      dry_run: true,
      session_id: sessionId,
      receipt_id: receiptId,
      target,
      planned_files: files.length,
      receipt
    };
  }

  const commits = [];

  for (const file of files) {
    const path = requireValue(file, 'path');
    const oldFile = await safeReadFile(target, path, env);
    const commit = await putGitHubFile(
      target,
      path,
      String(requireValue(file, 'content')),
      params.message || 'zip: write ' + path,
      env,
      oldFile ? oldFile.sha : undefined
    );

    commits.push(commit);
  }

  const receipt = await writeReceipt(method, sessionId, receiptId, target, {
    dry_run: false,
    commits
  }, env, ctx);

  return {
    method,
    ok: true,
    dry_run: false,
    session_id: sessionId,
    receipt_id: receiptId,
    target,
    changed: {
      files: files.map((file) => file.path),
      commits
    },
    receipt
  };
}

function planTextPatch(params) {
  const content = requireValue(params, 'content');
  const operations = requireValue(params, 'operations');
  const output = applyOperations(content, operations);
  const verify = runVerify(output, params.verify || []);

  return {
    method: 'zip.repo.planPatch',
    ok: verify.passed,
    dry_run: true,
    verify,
    content: params.return_content === false ? undefined : output
  };
}

async function applyRepoPatch(params, env, ctx) {
  const target = normalizeTarget(params, env);
  enforceOwner(target.owner, env);

  const path = requireValue(params, 'path');
  const current = await readGitHubFile(target, path, env);
  const content = applyOperations(current.content, requireValue(params, 'operations'));
  const verify = runVerify(content, params.verify || []);
  const dry = isDryRun(params, env);

  if (!verify.passed) {
    return {
      method: 'zip.repo.applyPatch',
      ok: false,
      dry_run: true,
      target,
      path,
      verify,
      reason: 'verify_failed',
      content: params.return_content ? content : undefined
    };
  }

  if (dry || !writeConfirmed(params, env)) {
    return {
      method: 'zip.repo.applyPatch',
      ok: true,
      dry_run: true,
      target,
      path,
      verify,
      content: params.return_content ? content : undefined
    };
  }

  const commit = await putGitHubFile(
    target,
    path,
    content,
    params.message || 'zip: patch ' + path,
    env,
    current.sha
  );

  const sessionId = params.session_id || 'zip_sess_' + crypto.randomUUID();
  const receiptId = 'zip_receipt_' + crypto.randomUUID();
  const receipt = await writeReceipt('zip.repo.applyPatch', sessionId, receiptId, target, {
    path,
    verify,
    commit,
    rollback: {
      type: 'restore_file',
      path,
      previous_sha: current.sha,
      previous_content: current.content
    }
  }, env, ctx);

  return {
    method: 'zip.repo.applyPatch',
    ok: true,
    dry_run: false,
    session_id: sessionId,
    receipt_id: receiptId,
    target,
    changed: {
      files: [path],
      commit
    },
    receipt
  };
}

async function applyPatchBatch(params, env, ctx) {
  const defaults = params.defaults || {};
  const patches = requireValue(params, 'patches');

  if (!Array.isArray(patches) || patches.length === 0) {
    throw makeError('patches must be a non-empty array', -32602);
  }

  const sessionId = params.session_id || 'zip_sess_' + crypto.randomUUID();
  const results = [];

  for (const patch of patches) {
    results.push(await applyRepoPatch({
      ...defaults,
      ...patch,
      session_id: sessionId,
      dry_run: params.dry_run ?? patch.dry_run ?? defaults.dry_run,
      confirm_write: params.confirm_write ?? patch.confirm_write ?? defaults.confirm_write
    }, env, ctx));
  }

  const ok = results.every((result) => result.ok);
  return {
    method: 'zip.repo.applyPatchBatch',
    ok,
    dry_run: results.every((result) => result.dry_run),
    session_id: sessionId,
    results
  };
}

async function artifact(method, params, env, ctx) {
  const bucket = requireBucket(env);

  if (method === 'zip.artifact.list') {
    const listed = await bucket.list({
      prefix: params.prefix || '',
      limit: Number(params.limit || 100)
    });

    return {
      method,
      ok: true,
      objects: listed.objects.map((object) => ({
        key: object.key,
        size: object.size,
        uploaded: object.uploaded
      }))
    };
  }

  if (method === 'zip.artifact.get') {
    const key = requireValue(params, 'key');
    const object = await bucket.get(key);

    return object ? {
      method,
      ok: true,
      key,
      size: object.size,
      content: await object.text()
    } : {
      method,
      ok: false,
      key,
      reason: 'not_found'
    };
  }

  if (method === 'zip.artifact.put') {
    const key = requireValue(params, 'key');
    await bucket.put(key, requireValue(params, 'content'), {
      httpMetadata: {
        contentType: params.content_type || 'application/octet-stream'
      }
    });

    const sessionId = params.session_id || 'zip_sess_' + crypto.randomUUID();
    const receiptId = 'zip_receipt_' + crypto.randomUUID();
    const receipt = await writeReceipt(method, sessionId, receiptId, {
      bucket: params.bucket || env.DEFAULT_BUCKET || null,
      key
    }, {
      key,
      content_type: params.content_type || 'application/octet-stream'
    }, env, ctx);

    return {
      method,
      ok: true,
      key,
      session_id: sessionId,
      receipt_id: receiptId,
      receipt
    };
  }

  if (method === 'zip.artifact.delete') {
    const key = requireValue(params, 'key');
    if (env.ZIP_DELETE_ENABLED !== 'true' && params.confirm_delete !== true) {
      throw makeError('delete disabled', 403);
    }

    await bucket.delete(key);
    return {
      method,
      ok: true,
      key
    };
  }

  if (method === 'zip.artifact.head') {
    const key = requireValue(params, 'key');
    const object = await bucket.head(key);

    return object ? {
      method,
      ok: true,
      key,
      size: object.size,
      uploaded: object.uploaded
    } : {
      method,
      ok: false,
      key,
      reason: 'not_found'
    };
  }

  if (method === 'zip.artifact.presign') {
    return {
      method,
      ok: false,
      status: 'delegated',
      reason: 'Native R2 bindings do not generate S3 presigned URLs. Route presign to CloudZip R2 v1 or bind S3 credentials in v2.1.'
    };
  }

  throw makeError('Unhandled artifact method ' + method, -32603);
}

async function listReceipts(params, env) {
  const bucket = requireBucket(env);
  const sessionId = requireValue(params, 'session_id');
  const listed = await bucket.list({
    prefix: `zip/receipts/${sessionId}/`,
    limit: Number(params.limit || 100)
  });

  return {
    method: 'zip.receipt',
    ok: true,
    session_id: sessionId,
    receipts: listed.objects.map((object) => ({
      key: object.key,
      size: object.size,
      uploaded: object.uploaded
    }))
  };
}

async function rollback(params, env, ctx) {
  const action = params.action || 'restore_file';

  if (action !== 'restore_file') {
    return {
      method: 'zip.rollback',
      ok: false,
      status: 'delegated',
      reason: 'Only restore_file rollback is implemented in v2 core. Advanced rollback should route to the specialized Zip engines.',
      supported_actions: ['restore_file']
    };
  }

  const target = normalizeTarget(params, env);
  enforceOwner(target.owner, env);

  const path = requireValue(params, 'path');
  const content = requireValue(params, 'content');
  const current = await safeReadFile(target, path, env);
  const dry = isDryRun(params, env);

  if (dry || !writeConfirmed(params, env)) {
    return {
      method: 'zip.rollback',
      ok: true,
      dry_run: true,
      target,
      path
    };
  }

  const commit = await putGitHubFile(
    target,
    path,
    content,
    params.message || 'zip: rollback ' + path,
    env,
    current ? current.sha : undefined
  );

  const sessionId = params.session_id || 'zip_sess_' + crypto.randomUUID();
  const receiptId = 'zip_receipt_' + crypto.randomUUID();
  const receipt = await writeReceipt('zip.rollback', sessionId, receiptId, target, {
    action,
    path,
    commit
  }, env, ctx);

  return {
    method: 'zip.rollback',
    ok: true,
    dry_run: false,
    session_id: sessionId,
    receipt_id: receiptId,
    target,
    changed: {
      files: [path],
      commit
    },
    receipt
  };
}

function cloneDelegation(method, params) {
  const map = {
    'zip.clone.plan': 'plan_zip_clone',
    'zip.clone.runBatch': 'run_zip_clone_batch',
    'zip.clone.resume': 'resume_zip_clone',
    'zip.clone.verify': 'verify_zip_clone',
    'zip.clone.receipt': 'clone_receipt'
  };

  return {
    method,
    ok: true,
    status: 'delegated',
    downstream_engine: 'afo-gitzip-clone-mcp',
    downstream_tool: map[method],
    params,
    reason: 'Zip Gateway v2 exposes the unified clone namespace. Use the existing clone engine for chunked session execution until v2.1 direct adapter routing is enabled.'
  };
}

async function writeReceipt(method, sessionId, receiptId, target, details, env, ctx) {
  const receipt = {
    ok: true,
    version: VERSION,
    method,
    session_id: sessionId,
    receipt_id: receiptId,
    target,
    details,
    created_at: new Date().toISOString(),
    receipt_key: `zip/receipts/${sessionId}/${receiptId}.json`
  };

  const bucket = getBucket(env);
  if (bucket) {
    const put = bucket.put(receipt.receipt_key, JSON.stringify(receipt, null, 2), {
      httpMetadata: {
        contentType: 'application/json'
      }
    });

    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(put);
    } else {
      await put;
    }
  }

  return receipt;
}

async function putGitHubFile(target, path, content, message, env, sha) {
  const body = {
    message,
    content: encodeBase64(content),
    branch: target.branch
  };

  if (sha) body.sha = sha;

  const data = await github(env, 'PUT', `/repos/${target.owner}/${target.repo}/contents/${encodePath(path)}`, body);

  return {
    path,
    sha: data.commit && data.commit.sha,
    content_sha: data.content && data.content.sha,
    url: data.content && data.content.html_url
  };
}

async function readGitHubFile(target, path, env) {
  const data = await github(env, 'GET', `/repos/${target.owner}/${target.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(target.branch)}`);

  return {
    path,
    sha: data.sha,
    content: decodeBase64(data.content || '')
  };
}

async function safeReadFile(target, path, env) {
  try {
    return await readGitHubFile(target, path, env);
  } catch (error) {
    if (String(error.message).includes('GitHub 404')) return null;
    throw error;
  }
}

async function github(env, method, path, body) {
  if (!env.GITHUB_TOKEN) {
    throw makeError('GITHUB_TOKEN not configured', 500);
  }

  const response = await fetch('https://api.github.com' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + env.GITHUB_TOKEN,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'afo-zip-gateway-v2',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw makeError('GitHub ' + response.status + ': ' + (data && data.message ? data.message : text), response.status, data);
  }

  return data;
}

function applyOperations(source, operations) {
  if (!Array.isArray(operations)) {
    throw makeError('operations must be an array', -32602);
  }

  let output = String(source);

  for (const operation of operations) {
    const type = operation.type || 'replace';

    if (type === 'replace') {
      const oldText = requireValue(operation, 'old_text', operation.find);
      const newText = requireValue(operation, 'new_text', operation.text);

      if (!output.includes(oldText) && operation.required !== false) {
        throw makeError('replace text not found', -32602, { old_text: oldText });
      }

      output = output.replace(oldText, newText);
    } else if (type === 'append') {
      output += requireValue(operation, 'text');
    } else if (type === 'prepend') {
      output = requireValue(operation, 'text') + output;
    } else {
      throw makeError('unsupported patch op ' + type, -32602);
    }
  }

  return output;
}

function runVerify(content, checks) {
  const results = checks.map((check) => {
    if (check.contains) {
      return {
        check: 'contains',
        value: check.contains,
        passed: content.includes(check.contains)
      };
    }

    if (check.not_contains) {
      return {
        check: 'not_contains',
        value: check.not_contains,
        passed: !content.includes(check.not_contains)
      };
    }

    return {
      check: 'noop',
      passed: true
    };
  });

  return {
    passed: results.every((result) => result.passed),
    results
  };
}

function normalizeTarget(params, env) {
  return {
    owner: params.owner || env.DEFAULT_OWNER,
    repo: requireValue(params, 'repo'),
    branch: params.branch || env.DEFAULT_BRANCH || 'main'
  };
}

function isDryRun(params, env) {
  return params.dry_run ?? dryRunDefault(env);
}

function dryRunDefault(env) {
  return env.ZIP_DRY_RUN_DEFAULT !== 'false';
}

function writeConfirmed(params, env) {
  return params.confirm_write === true || env.ZIP_WRITE_ENABLED === 'true';
}

function enforceOwner(owner, env) {
  const allowed = env.ZIP_ALLOWED_OWNER || env.DEFAULT_OWNER || '*';
  if (allowed !== '*' && owner !== allowed) {
    throw makeError('owner not allowed', 403, { owner, allowed });
  }
}

function environmentFor(method) {
  if (method.includes('.artifact.')) return 'cloudflare';
  if (method.includes('.repo.') || method.includes('.clone.')) return 'github';
  return 'worker';
}

function roleFor(method) {
  const risk = RISK[method] || 'read';
  if (risk === 'read') return 'read';
  if (risk === 'destructive') return 'owner';
  return 'operator';
}

function getBucket(env) {
  return env.ZIP_ARTIFACTS || env.ZIP_BUCKET || env.ARTIFACTS || null;
}

function requireBucket(env) {
  const bucket = getBucket(env);
  if (!bucket) {
    throw makeError('R2 binding not configured', 500);
  }
  return bucket;
}

function requireValue(object, key, fallback) {
  const value = fallback !== undefined ? fallback : object && object[key];

  if (value === undefined || value === null || value === '') {
    throw makeError('missing ' + key, -32602);
  }

  return value;
}

function encodePath(path) {
  return String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

function encodeBase64(value) {
  let binary = '';
  for (const byte of new TextEncoder().encode(String(value))) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(String(value).replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function makeError(message, code = -32000, details) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function json(value, status = 200) {
  return withCors(new Response(JSON.stringify(value, null, 2), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  }));
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
