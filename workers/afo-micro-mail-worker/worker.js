const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization,x-message-os-token'
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: JSON_HEADERS });

    try {
      const url = new URL(request.url);
      const route = matchRoute(request.method, url.pathname);

      if (route.name === 'home') return jsonResponse(serviceCard(env));
      if (route.name === 'health') return jsonResponse({ ok: true, service: 'afo-micro-mail-worker', at: nowIso(), message_os_bridge: bridgeEnabled(env) });
      if (route.name === 'createMailbox') return createMailbox(request, env);
      if (route.name === 'listMailboxes') return listMailboxes(env);
      if (route.name === 'getMailbox') return getMailbox(env, route.params.id);
      if (route.name === 'createMessage') return createMessageFromHttp(request, env, route.params.id, ctx);
      if (route.name === 'listMessages') return listMessages(env, route.params.id);
      if (route.name === 'exportMailbox') return exportMailbox(env, route.params.id);
      if (route.name === 'closeMailbox') return closeMailbox(env, route.params.id);
      if (route.name === 'ask') return askMailbox(request, env);
      if (route.name === 'emitMessageOsTest') return emitMessageOsTest(request, env);

      return jsonResponse({ error: 'not_found' }, 404);
    } catch (error) {
      console.error(error);
      return jsonResponse({ error: 'internal_error', message: error.message }, 500);
    }
  },

  async email(message, env, ctx) {
    const to = normalizeEmail(message.to || '');
    const slug = to.split('@')[0];
    const mailbox = await findMailboxBySlug(env, slug);

    if (!mailbox || mailbox.status !== 'active') {
      message.setReject('Mailbox is not active.');
      return;
    }

    const raw = await streamToArrayBuffer(message.raw);
    const rawText = new TextDecoder().decode(raw.slice(0, 256000));
    const subject = headerValue(rawText, 'subject') || '(no subject)';
    const from = headerValue(rawText, 'from') || message.from || '';

    const payload = {
      from_addr: from,
      to_addr: to,
      subject,
      text: stripMimeForPreview(rawText),
      html: null,
      headers_json: JSON.stringify({ from: message.from, to: message.to, subject })
    };

    ctx.waitUntil(storeMessage(env, mailbox, payload, raw, ctx));
  }
};

function matchRoute(method, pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (method === 'GET' && clean === '/') return { name: 'home', params: {} };
  if (method === 'GET' && clean === '/health') return { name: 'health', params: {} };
  if (method === 'POST' && clean === '/api/mailboxes') return { name: 'createMailbox', params: {} };
  if (method === 'GET' && clean === '/api/mailboxes') return { name: 'listMailboxes', params: {} };
  if (parts[0] === 'api' && parts[1] === 'mailboxes' && parts[2] && parts.length === 3 && method === 'GET') return { name: 'getMailbox', params: { id: parts[2] } };
  if (parts[0] === 'api' && parts[1] === 'mailboxes' && parts[2] && parts[3] === 'messages' && method === 'POST') return { name: 'createMessage', params: { id: parts[2] } };
  if (parts[0] === 'api' && parts[1] === 'mailboxes' && parts[2] && parts[3] === 'messages' && method === 'GET') return { name: 'listMessages', params: { id: parts[2] } };
  if (parts[0] === 'api' && parts[1] === 'mailboxes' && parts[2] && parts[3] === 'export' && method === 'GET') return { name: 'exportMailbox', params: { id: parts[2] } };
  if (parts[0] === 'api' && parts[1] === 'mailboxes' && parts[2] && parts.length === 3 && method === 'DELETE') return { name: 'closeMailbox', params: { id: parts[2] } };
  if (method === 'POST' && clean === '/api/ask') return { name: 'ask', params: {} };
  if (method === 'POST' && clean === '/api/message-os/test') return { name: 'emitMessageOsTest', params: {} };

  return { name: 'notFound', params: {} };
}

function serviceCard(env) {
  return {
    service: 'afo-micro-mail-worker',
    purpose: 'AI-native project and ephemeral email capsules on Cloudflare Workers.',
    domain: env.MAIL_DOMAIN || 'example.com',
    message_os_bridge: {
      enabled: bridgeEnabled(env),
      ingest_url_configured: Boolean(env.MESSAGE_OS_INGEST_URL),
      target_user: env.MESSAGE_OS_TARGET_USER || null,
      mode: env.MESSAGE_OS_BRIDGE_MODE || 'notify'
    },
    endpoints: [
      'GET /health',
      'POST /api/mailboxes',
      'GET /api/mailboxes',
      'GET /api/mailboxes/:id',
      'POST /api/mailboxes/:id/messages',
      'GET /api/mailboxes/:id/messages',
      'GET /api/mailboxes/:id/export',
      'DELETE /api/mailboxes/:id',
      'POST /api/ask',
      'POST /api/message-os/test'
    ]
  };
}

async function createMailbox(request, env) {
  const input = await readJson(request);
  const slug = safeSlug(input.slug || randomId('box'));
  const id = slug;
  const ttl = Number(input.ttl_seconds || env.DEFAULT_TTL_SECONDS || 604800);
  const created = nowIso();
  const expires = ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null;
  const address = `${slug}@${env.MAIL_DOMAIN || 'example.com'}`;

  await env.DB.prepare(`
    INSERT INTO mailboxes (id, slug, address, purpose, status, llm_enabled, ttl_seconds, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
  `).bind(id, slug, address, input.purpose || null, input.llm_enabled === false ? 0 : 1, ttl, expires, created, created).run();

  if (env.MAIL_KV) {
    await env.MAIL_KV.put(`mailbox:${slug}`, JSON.stringify({ id, slug, address, status: 'active', expires_at: expires }));
  }

  await logAgentEvent(env, id, null, 'mailbox.created', { slug, address, expires_at: expires });
  return jsonResponse({ id, slug, address, status: 'active', expires_at: expires }, 201);
}

async function listMailboxes(env) {
  const { results } = await env.DB.prepare(`
    SELECT id, slug, address, purpose, status, llm_enabled, expires_at, created_at, updated_at, closed_at
    FROM mailboxes
    ORDER BY created_at DESC
    LIMIT 100
  `).all();
  return jsonResponse({ mailboxes: results || [] });
}

async function getMailbox(env, idOrSlug) {
  const mailbox = await findMailbox(env, idOrSlug);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);
  return jsonResponse({ mailbox });
}

async function createMessageFromHttp(request, env, idOrSlug, ctx) {
  const mailbox = await findMailbox(env, idOrSlug);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);
  if (mailbox.status !== 'active') return jsonResponse({ error: 'mailbox_not_active' }, 409);

  const input = await readJson(request);
  const stored = await storeMessage(env, mailbox, input, null, ctx);
  return jsonResponse(stored, 201);
}

async function listMessages(env, idOrSlug) {
  const mailbox = await findMailbox(env, idOrSlug);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);

  const { results } = await env.DB.prepare(`
    SELECT id, mailbox_id, r2_key, vector_id, from_addr, to_addr, subject, clean_text, summary, intent, received_at, created_at
    FROM messages
    WHERE mailbox_id = ?
    ORDER BY received_at DESC
    LIMIT 100
  `).bind(mailbox.id).all();

  return jsonResponse({ mailbox: mailbox.slug, messages: results || [] });
}

async function storeMessage(env, mailbox, input, rawArrayBuffer = null, ctx = null) {
  const id = randomId('msg');
  const received = input.received_at || nowIso();
  const text = cleanText(input.text || input.body || input.html || '');
  const rawBody = rawArrayBuffer || new TextEncoder().encode(JSON.stringify(input, null, 2)).buffer;
  const r2Key = `mailboxes/${mailbox.slug}/messages/${id}.eml`;
  const vectorId = `${mailbox.id}:${id}`;

  let summary = input.summary || null;
  let intent = input.intent || null;

  if (!summary && env.AI && mailbox.llm_enabled) {
    try {
      const aiResult = await summarizeMessage(env, input.subject || '(no subject)', text);
      summary = aiResult.summary;
      intent = aiResult.intent;
    } catch (error) {
      summary = null;
      intent = 'unclassified';
      console.warn('summary_failed', error.message);
    }
  }

  if (env.MAIL_R2) {
    await env.MAIL_R2.put(r2Key, rawBody, {
      httpMetadata: { contentType: 'message/rfc822' },
      customMetadata: { mailbox: mailbox.slug, message_id: id }
    });
  }

  await env.DB.prepare(`
    INSERT INTO messages (id, mailbox_id, r2_key, vector_id, from_addr, to_addr, subject, clean_text, summary, intent, headers_json, received_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    mailbox.id,
    r2Key,
    vectorId,
    input.from_addr || input.from || null,
    input.to_addr || input.to || mailbox.address,
    input.subject || '(no subject)',
    text,
    summary,
    intent,
    input.headers_json || JSON.stringify(input.headers || {}),
    received,
    nowIso()
  ).run();

  const vectorTask = maybeUpsertVector(env, vectorId, text, {
    mailbox_id: mailbox.id,
    message_id: id,
    subject: input.subject || '(no subject)',
    from_addr: input.from_addr || input.from || ''
  });

  if (ctx && ctx.waitUntil) ctx.waitUntil(vectorTask);
  else await vectorTask;

  const messageRecord = {
    id,
    mailbox_id: mailbox.id,
    mailbox_slug: mailbox.slug,
    mailbox_address: mailbox.address,
    r2_key: r2Key,
    vector_id: vectorId,
    from_addr: input.from_addr || input.from || null,
    to_addr: input.to_addr || input.to || mailbox.address,
    subject: input.subject || '(no subject)',
    clean_text: text,
    summary,
    intent,
    received_at: received
  };

  await logAgentEvent(env, mailbox.id, id, 'message.ingested', { subject: messageRecord.subject, summary, intent });

  const bridgeTask = emitMessageOsEvent(env, mailbox, messageRecord);
  if (ctx && ctx.waitUntil) ctx.waitUntil(bridgeTask);
  else await bridgeTask;

  return { id, mailbox_id: mailbox.id, r2_key: r2Key, vector_id: vectorId, summary, intent, message_os_bridge: bridgeEnabled(env) };
}

async function exportMailbox(env, idOrSlug) {
  const mailbox = await findMailbox(env, idOrSlug);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);

  const { results: messages } = await env.DB.prepare(`
    SELECT id, from_addr, to_addr, subject, clean_text, summary, intent, r2_key, vector_id, received_at, created_at
    FROM messages
    WHERE mailbox_id = ?
    ORDER BY received_at ASC
  `).bind(mailbox.id).all();

  const bundle = { exported_at: nowIso(), mailbox, messages: messages || [] };
  const exportId = randomId('exp');
  const r2Key = `mailboxes/${mailbox.slug}/exports/${exportId}.json`;

  if (env.MAIL_R2) {
    await env.MAIL_R2.put(r2Key, JSON.stringify(bundle, null, 2), { httpMetadata: { contentType: 'application/json' } });
  }

  await env.DB.prepare(`
    INSERT INTO exports (id, mailbox_id, r2_key, format, status, created_at)
    VALUES (?, ?, ?, 'json', 'ready', ?)
  `).bind(exportId, mailbox.id, r2Key, nowIso()).run();

  return jsonResponse({ export_id: exportId, r2_key: r2Key, bundle });
}

async function closeMailbox(env, idOrSlug) {
  const mailbox = await findMailbox(env, idOrSlug);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);

  const at = nowIso();
  const { results: messageRows } = await env.DB.prepare(`SELECT id, r2_key, vector_id FROM messages WHERE mailbox_id = ?`).bind(mailbox.id).all();
  const messages = messageRows || [];

  if (env.MAIL_KV) await env.MAIL_KV.delete(`mailbox:${mailbox.slug}`);

  let r2ObjectCount = 0;
  if (env.MAIL_R2) {
    for (const row of messages) {
      if (row.r2_key) {
        await env.MAIL_R2.delete(row.r2_key);
        r2ObjectCount += 1;
      }
    }
  }

  let vectorCount = 0;
  if (env.MAIL_VECTORIZE && messages.length) {
    const ids = messages.map((row) => row.vector_id).filter(Boolean);
    if (ids.length && env.MAIL_VECTORIZE.deleteByIds) {
      await env.MAIL_VECTORIZE.deleteByIds(ids);
      vectorCount = ids.length;
    }
  }

  await env.DB.prepare(`UPDATE mailboxes SET status = 'closed', closed_at = ?, updated_at = ? WHERE id = ?`).bind(at, at, mailbox.id).run();

  const receipt = {
    mailbox_id: mailbox.id,
    slug: mailbox.slug,
    action: 'closed',
    message_count: messages.length,
    r2_object_count: r2ObjectCount,
    vector_count: vectorCount,
    action_at: at
  };

  await env.DB.prepare(`
    INSERT INTO lifecycle_receipts (id, mailbox_id, slug, r2_object_count, message_count, vector_count, action_at, receipt_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(randomId('life'), mailbox.id, mailbox.slug, r2ObjectCount, messages.length, vectorCount, at, JSON.stringify(receipt)).run();

  await logAgentEvent(env, mailbox.id, null, 'mailbox.closed', receipt);
  return jsonResponse({ ok: true, receipt });
}

async function askMailbox(request, env) {
  const input = await readJson(request);
  if (!input.mailbox_id || !input.question) return jsonResponse({ error: 'mailbox_id_and_question_required' }, 400);

  const mailbox = await findMailbox(env, input.mailbox_id);
  if (!mailbox) return jsonResponse({ error: 'mailbox_not_found' }, 404);

  const { results } = await env.DB.prepare(`
    SELECT subject, from_addr, clean_text, summary, intent, received_at
    FROM messages
    WHERE mailbox_id = ?
    ORDER BY received_at DESC
    LIMIT 20
  `).bind(mailbox.id).all();

  const context = (results || []).map((m, index) => {
    return `Message ${index + 1}\nFrom: ${m.from_addr || ''}\nSubject: ${m.subject || ''}\nSummary: ${m.summary || ''}\nText: ${(m.clean_text || '').slice(0, 1200)}`;
  }).join('\n\n');

  if (!env.AI) return jsonResponse({ answer: 'AI binding is not configured. Returning recent context only.', context });

  const prompt = `You are an email project assistant. Answer using only this mailbox context.\n\nQuestion: ${input.question}\n\nContext:\n${context}`;
  const result = await env.AI.run(env.SUMMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'Be concise, cite which message subjects support your answer, and include action items when obvious.' },
      { role: 'user', content: prompt }
    ]
  });

  return jsonResponse({ answer: result.response || result.result || result, mailbox: mailbox.slug });
}

async function emitMessageOsTest(request, env) {
  const input = await readJson(request);
  const mailbox = {
    id: input.mailbox_id || 'test-mailbox',
    slug: input.mailbox_slug || 'test-mailbox',
    address: input.to_addr || `test-mailbox@${env.MAIL_DOMAIN || 'example.com'}`
  };
  const message = {
    id: randomId('test'),
    mailbox_id: mailbox.id,
    mailbox_slug: mailbox.slug,
    mailbox_address: mailbox.address,
    from_addr: input.from_addr || 'sender@example.com',
    to_addr: mailbox.address,
    subject: input.subject || 'Message OS bridge test',
    clean_text: input.body || 'This is a test event from AFO Micro Mail Worker.',
    summary: input.summary || 'AFO Micro Mail Worker emitted a test event.',
    intent: 'bridge_test',
    r2_key: null,
    vector_id: null,
    received_at: nowIso()
  };
  const result = await emitMessageOsEvent(env, mailbox, message, { force: true });
  return jsonResponse({ ok: true, bridge_enabled: bridgeEnabled(env), result });
}

async function summarizeMessage(env, subject, text) {
  const result = await env.AI.run(env.SUMMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'Return compact JSON only with keys summary and intent.' },
      { role: 'user', content: `Subject: ${subject}\n\nMessage:\n${text.slice(0, 6000)}` }
    ]
  });

  const raw = result.response || result.result || '{}';
  const parsed = safeJson(typeof raw === 'string' ? raw : JSON.stringify(raw));
  return { summary: parsed.summary || String(raw).slice(0, 500), intent: parsed.intent || 'message' };
}

async function maybeUpsertVector(env, vectorId, text, metadata) {
  if (!env.AI || !env.MAIL_VECTORIZE || !text) return;

  try {
    const embedding = await env.AI.run(env.EMBEDDING_MODEL || '@cf/baai/bge-base-en-v1.5', { text: [text.slice(0, 8000)] });
    const values = embedding.data?.[0] || embedding.result?.data?.[0];
    if (!values) return;
    await env.MAIL_VECTORIZE.upsert([{ id: vectorId, values, metadata }]);
  } catch (error) {
    console.warn('vector_upsert_failed', error.message);
  }
}

async function emitMessageOsEvent(env, mailbox, message, options = {}) {
  if (!options.force && !bridgeEnabled(env)) return { skipped: true, reason: 'bridge_not_configured' };
  if (!env.MESSAGE_OS_INGEST_URL) return { skipped: true, reason: 'missing_MESSAGE_OS_INGEST_URL' };

  const subject = `📬 ${message.subject || '(no subject)'}`;
  const body = buildChatMailBody(env, mailbox, message);
  const payload = {
    source: 'afo-micro-mail-worker',
    type: 'email.received',
    to_user: env.MESSAGE_OS_TARGET_USER || 'jared',
    project: mailbox.slug,
    subject,
    body,
    summary: message.summary || `New email from ${message.from_addr || 'unknown sender'}`,
    priority: classifyPriority(message),
    tags: ['email', 'micro-mail', `mailbox:${mailbox.slug}`],
    metadata: {
      mailbox_id: mailbox.id,
      mailbox_slug: mailbox.slug,
      mailbox_address: mailbox.address,
      message_id: message.id,
      from_addr: message.from_addr,
      to_addr: message.to_addr,
      r2_key: message.r2_key,
      vector_id: message.vector_id,
      received_at: message.received_at,
      intent: message.intent
    }
  };

  const headers = { 'content-type': 'application/json' };
  if (env.MESSAGE_OS_TOKEN) headers.authorization = `Bearer ${env.MESSAGE_OS_TOKEN}`;
  if (env.MESSAGE_OS_TOKEN) headers['x-message-os-token'] = env.MESSAGE_OS_TOKEN;

  try {
    const res = await fetch(env.MESSAGE_OS_INGEST_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
    const text = await res.text();
    await logAgentEvent(env, mailbox.id, message.id, res.ok ? 'message_os.emit.ok' : 'message_os.emit.failed', {
      status: res.status,
      response: text.slice(0, 1000)
    });
    return { ok: res.ok, status: res.status, response: text.slice(0, 1000), payload };
  } catch (error) {
    console.warn('message_os_emit_failed', error.message);
    await logAgentEvent(env, mailbox.id, message.id, 'message_os.emit.error', { error: error.message });
    return { ok: false, error: error.message, payload };
  }
}

function buildChatMailBody(env, mailbox, message) {
  const lines = [
    `New email received in ${mailbox.slug}`,
    '',
    `From: ${message.from_addr || 'unknown'}`,
    `To: ${message.to_addr || mailbox.address || 'unknown'}`,
    `Subject: ${message.subject || '(no subject)'}`,
    `Mailbox: ${mailbox.slug}`,
    `Received: ${message.received_at || nowIso()}`,
    '',
    'Summary:',
    message.summary || 'No summary generated.',
    '',
    'Clean text:',
    (message.clean_text || '').slice(0, Number(env.MESSAGE_OS_BODY_LIMIT || 6000)),
    '',
    'Actions this should support in chat:',
    '- Show full email',
    '- Summarize thread',
    '- Draft reply',
    '- Export mailbox',
    '- Close mailbox'
  ];
  if (message.r2_key) lines.splice(8, 0, `R2 key: ${message.r2_key}`);
  return lines.join('\n');
}

function bridgeEnabled(env) {
  return Boolean(env.MESSAGE_OS_INGEST_URL);
}

function classifyPriority(message) {
  const text = `${message.subject || ''} ${message.clean_text || ''}`.toLowerCase();
  if (/(urgent|asap|immediately|emergency|past due|final notice)/.test(text)) return 'high';
  return 'normal';
}

async function findMailbox(env, idOrSlug) {
  return env.DB.prepare(`
    SELECT id, slug, address, purpose, status, llm_enabled, ttl_seconds, expires_at, created_at, updated_at, closed_at
    FROM mailboxes
    WHERE id = ? OR slug = ?
    LIMIT 1
  `).bind(idOrSlug, idOrSlug).first();
}

async function findMailboxBySlug(env, slug) {
  if (env.MAIL_KV) {
    const cached = await env.MAIL_KV.get(`mailbox:${slug}`, 'json');
    if (cached?.id) return findMailbox(env, cached.id);
  }
  return findMailbox(env, slug);
}

async function logAgentEvent(env, mailboxId, messageId, eventType, payload) {
  await env.DB.prepare(`
    INSERT INTO agent_events (id, mailbox_id, message_id, event_type, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(randomId('evt'), mailboxId, messageId, eventType, JSON.stringify(payload || {}), nowIso()).run();
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), { status, headers: JSON_HEADERS });
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

function safeSlug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || randomId('box');
}

function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function safeJson(value) {
  try {
    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');
    const sliced = start >= 0 && end >= start ? value.slice(start, end + 1) : value;
    return JSON.parse(sliced);
  } catch {
    return {};
  }
}

function headerValue(rawText, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escaped}:\\s*(.+)$`, 'im');
  const match = rawText.match(regex);
  return match ? match[1].trim() : null;
}

function stripMimeForPreview(rawText) {
  return rawText
    .replace(/^[\s\S]*?\r?\n\r?\n/, '')
    .replace(/--[A-Za-z0-9'_()+,./:=?-]+/g, ' ')
    .replace(/Content-[^\n]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}

async function streamToArrayBuffer(stream) {
  if (stream instanceof ArrayBuffer) return stream;
  const response = new Response(stream);
  return response.arrayBuffer();
}
