const VERSION = '0.1.0';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};

const CF_BASE = 'https://api.cloudflare.com/client/v4';

const TOOLS = [
  {
    name: 'kv_status',
    description: 'Health check. Returns version, account binding status, and available tools.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'kv_put',
    description: 'Write a value to a KV namespace. Supports optional TTL and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        key:          { type: 'string', description: 'Key to write' },
        value:        { type: 'string', description: 'Value to store (string). Objects should be JSON.stringify\'d before passing.' },
        ttl_seconds:  { type: 'number', description: 'Optional TTL in seconds. Key auto-expires after this time.' },
        metadata:     { type: 'object', description: 'Optional metadata object to attach to the key.' }
      },
      required: ['namespace_id', 'key', 'value']
    }
  },
  {
    name: 'kv_get',
    description: 'Read a value from a KV namespace by key. Returns value and optional metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        key:          { type: 'string', description: 'Key to read' }
      },
      required: ['namespace_id', 'key']
    }
  },
  {
    name: 'kv_delete',
    description: 'Delete a key from a KV namespace.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        key:          { type: 'string', description: 'Key to delete' }
      },
      required: ['namespace_id', 'key']
    }
  },
  {
    name: 'kv_list',
    description: 'List keys in a KV namespace. Supports prefix filtering and pagination cursor.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        prefix:       { type: 'string', description: 'Optional key prefix filter (e.g. "project:watersedge:")' },
        limit:        { type: 'number', description: 'Max keys to return (default: 100, max: 1000)' },
        cursor:       { type: 'string', description: 'Pagination cursor from a previous kv_list response' }
      },
      required: ['namespace_id']
    }
  },
  {
    name: 'kv_bulk_put',
    description: 'Write multiple key-value pairs to a KV namespace in one operation. More efficient than repeated kv_put calls.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        pairs: {
          type: 'array',
          description: 'Array of key-value pairs to write',
          items: {
            type: 'object',
            properties: {
              key:         { type: 'string' },
              value:       { type: 'string' },
              ttl_seconds: { type: 'number' },
              metadata:    { type: 'object' }
            },
            required: ['key', 'value']
          }
        }
      },
      required: ['namespace_id', 'pairs']
    }
  },
  {
    name: 'kv_bulk_delete',
    description: 'Delete multiple keys from a KV namespace in one operation.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        keys:         { type: 'array', items: { type: 'string' }, description: 'Array of keys to delete' }
      },
      required: ['namespace_id', 'keys']
    }
  },
  {
    name: 'kv_get_with_metadata',
    description: 'Read a value and its metadata from a KV namespace. Use when you need both the value and attached metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        namespace_id: { type: 'string', description: 'KV namespace ID' },
        key:          { type: 'string', description: 'Key to read' }
      },
      required: ['namespace_id', 'key']
    }
  },
  {
    name: 'kv_list_namespaces',
    description: 'List all KV namespaces in the Cloudflare account. Returns namespace IDs and titles.',
    inputSchema: {
      type: 'object',
      properties: {
        page:     { type: 'number', description: 'Page number for pagination (default: 1)' },
        per_page: { type: 'number', description: 'Results per page (default: 20, max: 100)' }
      },
      required: []
    }
  }
];

// --- Helpers -----------------------------------------------------------------

function rpc(id, r)        { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function errResp(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r)       { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }

// --- Cloudflare API helpers --------------------------------------------------

async function cfRequest(env, method, path, body) {
  const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + path;
  const opts = {
    method,
    headers: {
      'Authorization': 'Bearer ' + env.CF_API_TOKEN,
      'Content-Type': 'application/json',
      'User-Agent': 'afo-kv-admin-mcp/' + VERSION
    }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!json.success) {
    const msg = json.errors && json.errors[0] ? json.errors[0].message : 'Cloudflare API error';
    throw new Error(msg + ' (HTTP ' + res.status + ')');
  }
  return json;
}

// KV value endpoint uses form data for PUT (Cloudflare requirement for metadata support)
async function cfKvPut(env, namespace_id, key, value, ttl_seconds, metadata) {
  const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/values/' + encodeURIComponent(key);
  const params = new URLSearchParams();
  if (ttl_seconds) params.set('expiration_ttl', String(ttl_seconds));

  // Use multipart form if metadata present, plain text body otherwise
  let body, contentType;
  if (metadata) {
    const form = new FormData();
    form.append('value', value);
    form.append('metadata', JSON.stringify(metadata));
    body = form;
    contentType = undefined; // let fetch set multipart boundary
  } else {
    body = value;
    contentType = 'text/plain';
  }

  const headers = {
    'Authorization': 'Bearer ' + env.CF_API_TOKEN,
    'User-Agent': 'afo-kv-admin-mcp/' + VERSION
  };
  if (contentType) headers['Content-Type'] = contentType;

  const urlWithParams = url + (params.toString() ? '?' + params.toString() : '');
  const res = await fetch(urlWithParams, { method: 'PUT', headers, body });
  const json = await res.json();
  if (!json.success) {
    const msg = json.errors && json.errors[0] ? json.errors[0].message : 'KV PUT failed';
    throw new Error(msg + ' (HTTP ' + res.status + ')');
  }
  return json;
}

async function cfKvGet(env, namespace_id, key) {
  const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/values/' + encodeURIComponent(key);
  const res = await fetch(url, {
    headers: { 'Authorization': 'Bearer ' + env.CF_API_TOKEN, 'User-Agent': 'afo-kv-admin-mcp/' + VERSION }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('KV GET failed: HTTP ' + res.status);
  return res.text();
}

async function cfKvGetMetadata(env, namespace_id, key) {
  const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/metadata/' + encodeURIComponent(key);
  const res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + env.CF_API_TOKEN,
      'Content-Type': 'application/json',
      'User-Agent': 'afo-kv-admin-mcp/' + VERSION
    }
  });
  if (res.status === 404) return null;
  const json = await res.json();
  if (!json.success) return null;
  return json.result;
}

async function cfKvDelete(env, namespace_id, key) {
  const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/values/' + encodeURIComponent(key);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + env.CF_API_TOKEN, 'User-Agent': 'afo-kv-admin-mcp/' + VERSION }
  });
  const json = await res.json();
  if (!json.success) {
    const msg = json.errors && json.errors[0] ? json.errors[0].message : 'KV DELETE failed';
    throw new Error(msg + ' (HTTP ' + res.status + ')');
  }
  return json;
}

// --- Tool handlers -----------------------------------------------------------

async function handle(name, args, env) {

  if (name === 'kv_status') {
    const hasToken  = !!env.CF_API_TOKEN;
    const hasAcct   = !!env.CF_ACCOUNT_ID;
    let apiReachable = false;
    if (hasToken && hasAcct) {
      try {
        await cfRequest(env, 'GET', '/storage/kv/namespaces?per_page=1');
        apiReachable = true;
      } catch {}
    }
    return {
      status: 'ok',
      worker: 'afo-kv-admin-mcp',
      version: VERSION,
      bindings: { CF_API_TOKEN: hasToken, CF_ACCOUNT_ID: hasAcct },
      api_reachable: apiReachable,
      tools: TOOLS.map(function(t) { return t.name; })
    };
  }

  // All other tools require credentials
  if (!env.CF_API_TOKEN) throw new Error('CF_API_TOKEN secret not set');
  if (!env.CF_ACCOUNT_ID) throw new Error('CF_ACCOUNT_ID secret not set');

  // ── kv_put ──────────────────────────────────────────────────────────────────
  if (name === 'kv_put') {
    const { namespace_id, key, value, ttl_seconds, metadata } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!key)          throw new Error('key required');
    if (value === undefined || value === null) throw new Error('value required');
    await cfKvPut(env, namespace_id, key, String(value), ttl_seconds, metadata);
    return {
      ok: true,
      namespace_id,
      key,
      bytes: new TextEncoder().encode(String(value)).length,
      ttl_seconds: ttl_seconds || null,
      has_metadata: !!metadata
    };
  }

  // ── kv_get ──────────────────────────────────────────────────────────────────
  if (name === 'kv_get') {
    const { namespace_id, key } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!key)          throw new Error('key required');
    const value = await cfKvGet(env, namespace_id, key);
    if (value === null) return { ok: true, namespace_id, key, found: false, value: null };
    // Auto-parse JSON if possible
    let parsed = value;
    try { parsed = JSON.parse(value); } catch {}
    return { ok: true, namespace_id, key, found: true, value: parsed, raw_value: value };
  }

  // ── kv_delete ────────────────────────────────────────────────────────────────
  if (name === 'kv_delete') {
    const { namespace_id, key } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!key)          throw new Error('key required');
    await cfKvDelete(env, namespace_id, key);
    return { ok: true, namespace_id, key, deleted: true };
  }

  // ── kv_list ──────────────────────────────────────────────────────────────────
  if (name === 'kv_list') {
    const { namespace_id, prefix, limit, cursor } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (limit)  params.set('limit', String(Math.min(limit, 1000)));
    if (cursor) params.set('cursor', cursor);
    const path = '/storage/kv/namespaces/' + namespace_id + '/keys' + (params.toString() ? '?' + params.toString() : '');
    const json = await cfRequest(env, 'GET', path);
    return {
      ok: true,
      namespace_id,
      keys: json.result || [],
      count: (json.result || []).length,
      cursor: json.result_info && json.result_info.cursor ? json.result_info.cursor : null,
      has_more: !!(json.result_info && json.result_info.cursor)
    };
  }

  // ── kv_bulk_put ──────────────────────────────────────────────────────────────
  if (name === 'kv_bulk_put') {
    const { namespace_id, pairs } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!pairs || !pairs.length) throw new Error('pairs array required and must not be empty');

    // Cloudflare bulk write API accepts up to 10,000 pairs
    const body = pairs.map(function(p) {
      const entry = { key: p.key, value: String(p.value) };
      if (p.ttl_seconds) entry.expiration_ttl = p.ttl_seconds;
      if (p.metadata) entry.metadata = p.metadata;
      return entry;
    });

    const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/bulk';
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + env.CF_API_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'afo-kv-admin-mcp/' + VERSION
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.success) {
      const msg = json.errors && json.errors[0] ? json.errors[0].message : 'KV bulk PUT failed';
      throw new Error(msg + ' (HTTP ' + res.status + ')');
    }
    return { ok: true, namespace_id, pairs_written: pairs.length };
  }

  // ── kv_bulk_delete ───────────────────────────────────────────────────────────
  if (name === 'kv_bulk_delete') {
    const { namespace_id, keys } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!keys || !keys.length) throw new Error('keys array required and must not be empty');

    const url = CF_BASE + '/accounts/' + env.CF_ACCOUNT_ID + '/storage/kv/namespaces/' + namespace_id + '/bulk';
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + env.CF_API_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'afo-kv-admin-mcp/' + VERSION
      },
      body: JSON.stringify(keys)
    });
    const json = await res.json();
    if (!json.success) {
      const msg = json.errors && json.errors[0] ? json.errors[0].message : 'KV bulk DELETE failed';
      throw new Error(msg + ' (HTTP ' + res.status + ')');
    }
    return { ok: true, namespace_id, keys_deleted: keys.length };
  }

  // ── kv_get_with_metadata ─────────────────────────────────────────────────────
  if (name === 'kv_get_with_metadata') {
    const { namespace_id, key } = args;
    if (!namespace_id) throw new Error('namespace_id required');
    if (!key)          throw new Error('key required');
    const [rawValue, metadata] = await Promise.all([
      cfKvGet(env, namespace_id, key),
      cfKvGetMetadata(env, namespace_id, key)
    ]);
    if (rawValue === null) return { ok: true, namespace_id, key, found: false, value: null, metadata: null };
    let value = rawValue;
    try { value = JSON.parse(rawValue); } catch {}
    return { ok: true, namespace_id, key, found: true, value, raw_value: rawValue, metadata };
  }

  // ── kv_list_namespaces ───────────────────────────────────────────────────────
  if (name === 'kv_list_namespaces') {
    const params = new URLSearchParams();
    if (args.page)     params.set('page', String(args.page));
    if (args.per_page) params.set('per_page', String(Math.min(args.per_page, 100)));
    const path = '/storage/kv/namespaces' + (params.toString() ? '?' + params.toString() : '');
    const json = await cfRequest(env, 'GET', path);
    return {
      ok: true,
      namespaces: (json.result || []).map(function(ns) {
        return { id: ns.id, title: ns.title, supports_url_encoding: ns.supports_url_encoding };
      }),
      count: (json.result || []).length,
      total: json.result_info && json.result_info.total_count ? json.result_info.total_count : null
    };
  }

  throw new Error('Unknown tool: ' + name);
}

// --- Main fetch handler ------------------------------------------------------

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'afo-kv-admin-mcp', version: VERSION }, { headers: CORS });
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body;
    try { body = await request.json(); } catch { return errResp(null, -32700, 'Parse error'); }
    const { id, method, params } = body;
    if (method === 'initialize') return rpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'afo-kv-admin-mcp', version: VERSION } });
    if (method === 'notifications/initialized') return new Response(null, { status: 204, headers: CORS });
    if (method === 'ping') return rpc(id, {});
    if (method === 'tools/list') return rpc(id, { tools: TOOLS });
    if (method === 'tools/call') {
      try { return tool(id, await handle(params?.name, params?.arguments || {}, env)); }
      catch (e) { return errResp(id, -32603, 'Tool error: ' + e.message); }
    }
    return errResp(id, -32601, 'Method not found: ' + method);
  }
};
