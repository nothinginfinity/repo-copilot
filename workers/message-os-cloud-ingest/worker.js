const VERSION = '0.1.0';

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
      if (url.pathname === '/health') return json({ ok: true, worker: 'message-os-cloud-ingest', version: VERSION, db: Boolean(env.DB) });
      if (url.pathname !== '/api/ingest' || request.method !== 'POST') return json({ error: 'not_found' }, 404);

      const rawToken = extractToken(request, url);
      if (!rawToken) return json({ error: 'unauthorized', message: 'Missing Message OS connector token.' }, 401);

      const token = await resolveToken(env, rawToken);
      if (!token) return json({ error: 'unauthorized', message: 'Invalid or inactive Message OS connector token.' }, 401);

      const input = await request.json().catch(() => ({}));
      const messageId = await ingestExternalMessage(env, token, input);
      return json({ ok: true, worker: 'message-os-cloud-ingest', message_id: messageId, to: '@' + token.handle });
    } catch (error) {
      return json({ error: 'internal_error', message: error.message }, 500);
    }
  }
};

async function ingestExternalMessage(env, token, input) {
  const id = uid('msg');
  const subject = clean(input.subject || input.title || '📬 New email');
  const body = buildBody(input);
  const fromHandle = safeHandle(input.from_handle || input.project || input.source || 'micro-mail');
  const toHandle = token.handle || 'inbox';

  await env.DB.prepare(`
    INSERT INTO user_messages(id, from_user_id, to_user_id, from_handle, to_handle, subject, body, thread_id, parent_message_id, status, notification_sent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unread', 0, ?)
  `).bind(
    id,
    String(input.source_user_id || 'external:afo-micro-mail-worker'),
    token.uid || token.user_id,
    fromHandle,
    toHandle,
    subject,
    body,
    clean(input.thread_id || input.metadata?.mailbox_slug || input.project || null),
    clean(input.parent_message_id || null),
    new Date().toISOString()
  ).run();

  return id;
}

function buildBody(input) {
  const metadata = input.metadata || {};
  const lines = [
    input.summary ? 'Summary:\n' + clean(input.summary) : null,
    'Source: ' + clean(input.source || 'afo-micro-mail-worker'),
    input.type ? 'Type: ' + clean(input.type) : null,
    input.project ? 'Mailbox/Project: ' + clean(input.project) : null,
    metadata.from_addr ? 'From: ' + clean(metadata.from_addr) : null,
    metadata.to_addr ? 'To: ' + clean(metadata.to_addr) : null,
    metadata.r2_key ? 'R2 key: ' + clean(metadata.r2_key) : null,
    metadata.message_id ? 'Micro-mail message ID: ' + clean(metadata.message_id) : null,
    '',
    clean(input.body || input.text || input.clean_text || '')
  ].filter((x) => x !== null).join('\n');
  return lines.slice(0, 24000);
}

async function resolveToken(env, raw) {
  const hash = await sha256(raw);
  return env.DB.prepare(`
    SELECT ct.*, u.email, u.display_name, u.id as uid, p.handle, p.address
    FROM connector_tokens ct
    JOIN users u ON u.id = ct.user_id
    LEFT JOIN profiles p ON p.user_id = ct.user_id
    WHERE ct.token_hash = ? AND ct.status = 'active'
    LIMIT 1
  `).bind(hash).first();
}

function extractToken(request, url) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  const headerToken = request.headers.get('x-message-os-token');
  if (headerToken) return headerToken.trim();
  return (url.searchParams.get('token') || '').trim();
}

async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function uid(prefix) {
  return prefix + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 18);
}

function safeHandle(value) {
  return String(value || 'micro-mail').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 31) || 'micro-mail';
}

function clean(value) {
  if (value === null || value === undefined) return null;
  return String(value).replace(/\s+/g, ' ').trim();
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-message-os-token'
  };
}

function json(payload, status = 200) {
  return Response.json(payload, { status, headers: cors() });
}
