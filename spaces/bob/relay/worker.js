/**
 * Bob GitHub Relay — Cloudflare Worker v1
 * Routes Bob-native operations to the GitHub Contents API.
 *
 * Endpoints:
 *   GET  /health
 *   POST /get_file          { path }
 *   POST /push_files        { files: [{path, content}], message }
 *   POST /append_mail       { content, mark_read_id? }
 *   POST /push_turn_bundle  { turn_json, mail_update? }
 *
 * Env vars (set in Cloudflare dashboard → Workers → Settings → Variables):
 *   GITHUB_PAT    — fine-grained PAT, repo: nothinginfinity/repo-copilot, contents R+W
 *   RELAY_SECRET  — Bearer token Bob’s GPT Action sends in Authorization header
 */

const REPO   = 'nothinginfinity/repo-copilot';
const BRANCH = 'main';
const GH_API = 'https://api.github.com';

// Paths Bob is never allowed to write
const DENY_PATTERNS = [
  /^\.github\/workflows\//,
  /^\.github\/actions\//,
  /secrets/i,
  /\.env/i,
];

// Max files per push_files call
const MAX_FILES = 10;

// Max content length per file (bytes, before base64)
const MAX_FILE_BYTES = 80_000;

// ---- Auth ----------------------------------------------------------------

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token === env.RELAY_SECRET;
}

// ---- GitHub helpers ------------------------------------------------------

async function ghGet(path, env) {
  const url = `${GH_API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'repo-copilot-bob-relay/1.0',
    },
  });
  return res;
}

async function ghPut(path, contentBase64, message, sha, env) {
  const url = `${GH_API}/repos/${REPO}/contents/${path}`;
  const body = {
    message,
    content: contentBase64,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_PAT}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'repo-copilot-bob-relay/1.0',
    },
    body: JSON.stringify(body),
  });
  return res;
}

function toBase64(str) {
  // Cloudflare Workers support btoa for ASCII; use TextEncoder for UTF-8
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function isDenied(path) {
  return DENY_PATTERNS.some(p => p.test(path));
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---- Endpoint handlers ---------------------------------------------------

async function handleHealth() {
  return jsonResponse({ status: 'ok', relay: 'bob-github-relay', version: '1.0' });
}

async function handleGetFile(body, env) {
  const { path } = body;
  if (!path) return jsonResponse({ error: 'path required' }, 400);

  const res = await ghGet(path, env);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return jsonResponse({ error: `GitHub ${res.status}`, detail: err }, res.status);
  }
  const data = await res.json();
  const content = fromBase64(data.content.replace(/\n/g, ''));
  return jsonResponse({ path, content, sha: data.sha });
}

async function handlePushFiles(body, env) {
  const { files, message } = body;
  if (!files || !Array.isArray(files) || files.length === 0)
    return jsonResponse({ error: 'files array required' }, 400);
  if (files.length > MAX_FILES)
    return jsonResponse({ error: `max ${MAX_FILES} files per call` }, 400);
  if (!message)
    return jsonResponse({ error: 'message required' }, 400);

  const results = [];
  for (const file of files) {
    const { path, content } = file;
    if (!path || content === undefined)
      return jsonResponse({ error: `each file needs path and content` }, 400);
    if (isDenied(path))
      return jsonResponse({ error: `path not allowed: ${path}` }, 403);
    if (new TextEncoder().encode(content).length > MAX_FILE_BYTES)
      return jsonResponse({ error: `file too large: ${path}` }, 400);

    // Get current SHA if file exists
    let sha;
    const existing = await ghGet(path, env);
    if (existing.ok) {
      const existingData = await existing.json();
      sha = existingData.sha;
    }

    const res = await ghPut(path, toBase64(content), message, sha, env);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return jsonResponse({ error: `GitHub ${res.status} on ${path}`, detail: err }, res.status);
    }
    const data = await res.json();
    results.push({ path, sha: data.content.sha, commit: data.commit.sha });
  }

  return jsonResponse({ ok: true, files: results });
}

async function handleAppendMail(body, env) {
  const { content, mark_read_id } = body;
  if (!content) return jsonResponse({ error: 'content required' }, 400);

  // Read current mail.md
  const res = await ghGet('spaces/mail.md', env);
  if (!res.ok) return jsonResponse({ error: 'could not read mail.md' }, 500);
  const data = await res.json();
  let current = fromBase64(data.content.replace(/\n/g, ''));
  const sha = data.sha;

  // Optionally mark a message as read
  if (mark_read_id) {
    const pattern = new RegExp(
      `(## 📨 ${mark_read_id}[\\s\\S]*?\\*\\*status:\\*\\* )unread`,
      'g'
    );
    current = current.replace(pattern, '$1read');
  }

  // Append new content
  const updated = current.trimEnd() + '\n\n---\n\n' + content.trim() + '\n';

  const putRes = await ghPut('spaces/mail.md', toBase64(updated), 'mail: append message (bob-relay)', sha, env);
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return jsonResponse({ error: `GitHub ${putRes.status}`, detail: err }, putRes.status);
  }
  const putData = await putRes.json();
  return jsonResponse({ ok: true, commit: putData.commit.sha });
}

async function handlePushTurnBundle(body, env) {
  const { turn_json, mail_update } = body;
  if (!turn_json) return jsonResponse({ error: 'turn_json required' }, 400);

  const { cid, session } = turn_json;
  if (!cid || !session) return jsonResponse({ error: 'turn_json must include cid and session' }, 400);

  const turnPath = `.github/turns/${session}/${cid}/turn.json`;
  const turnContent = JSON.stringify(turn_json, null, 2);

  // Get SHA if exists
  let sha;
  const existing = await ghGet(turnPath, env);
  if (existing.ok) {
    const existingData = await existing.json();
    sha = existingData.sha;
  }

  const turnRes = await ghPut(turnPath, toBase64(turnContent), `feat(turn): ${turn_json.title || cid} (bob-relay)`, sha, env);
  if (!turnRes.ok) {
    const err = await turnRes.json().catch(() => ({}));
    return jsonResponse({ error: `GitHub ${turnRes.status} on turn.json`, detail: err }, turnRes.status);
  }
  const turnData = await turnRes.json();
  const result = { turn_commit: turnData.commit.sha };

  // Optional mail update
  if (mail_update) {
    const mailRes = await handleAppendMail(mail_update, env);
    const mailData = await mailRes.json();
    if (!mailData.ok) return jsonResponse({ error: 'turn.json pushed but mail failed', detail: mailData }, 207);
    result.mail_commit = mailData.commit;
  }

  return jsonResponse({ ok: true, ...result });
}

// ---- Router --------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://chat.openai.com',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        },
      });
    }

    // Health check — no auth required
    if (method === 'GET' && url.pathname === '/health') {
      return handleHealth();
    }

    // All other routes require auth
    if (!checkAuth(request, env)) {
      return jsonResponse({ error: 'unauthorized' }, 401);
    }

    let body = {};
    if (method === 'POST') {
      try { body = await request.json(); }
      catch { return jsonResponse({ error: 'invalid JSON body' }, 400); }
    }

    if (method === 'POST' && url.pathname === '/get_file')         return handleGetFile(body, env);
    if (method === 'POST' && url.pathname === '/push_files')       return handlePushFiles(body, env);
    if (method === 'POST' && url.pathname === '/append_mail')      return handleAppendMail(body, env);
    if (method === 'POST' && url.pathname === '/push_turn_bundle') return handlePushTurnBundle(body, env);

    return jsonResponse({ error: 'not found' }, 404);
  },
};
