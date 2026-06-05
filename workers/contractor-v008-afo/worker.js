// contractor-v008-afo — Summit Ridge Roofing & Exterior — v0.1.0
// Full operational demo: D1 + Vectorize + R2 + Chat + Articles + Frontend
// Preview-only. No production routes.

const VERSION = '0.1.0';
const COMPANY = 'Summit Ridge Roofing & Exterior';
const V008_DB = 'CONTRACTOR_V008_DB';
const V008_INDEX = 'contractor-v008-afo-vector';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// ── Utilities ──────────────────────────────────────────────────────────────
function uid() {
  return 'v8-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}
function now() { return new Date().toISOString(); }
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
function html(content, status = 200) {
  return new Response(content, { status, headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
async function parseBody(req) {
  try { return await req.json(); } catch { return {}; }
}

// ── Embedding ──────────────────────────────────────────────────────────────
async function embed(env, text) {
  const result = await env.AI.run(EMBEDDING_MODEL, { text: [text] });
  return result.data[0];
}

// ── Vectorize search ───────────────────────────────────────────────────────
async function vectorSearch(env, query, topK = 5) {
  const vec = await embed(env, query);
  const results = await env.CONTRACTOR_V008_VECTORIZE.query(vec, { topK, returnMetadata: 'all' });
  return results.matches || [];
}

// ── D1 helpers ─────────────────────────────────────────────────────────────
async function dbRun(env, sql, params = []) {
  return env.CONTRACTOR_V008_DB.prepare(sql).bind(...params).run();
}
async function dbAll(env, sql, params = []) {
  const r = await env.CONTRACTOR_V008_DB.prepare(sql).bind(...params).all();
  return r.results || [];
}
async function dbFirst(env, sql, params = []) {
  return env.CONTRACTOR_V008_DB.prepare(sql).bind(...params).first();
}

// ── Vectorize upsert ───────────────────────────────────────────────────────
async function upsertVector(env, id, text, metadata) {
  const vec = await embed(env, text);
  await env.CONTRACTOR_V008_VECTORIZE.upsert([{ id, values: vec, metadata }]);
  return { id, dims: vec.length };
}

// ── API: Status ────────────────────────────────────────────────────────────
async function handleStatus(env) {
  let d1Ok = false, vecOk = false, r2Ok = false;
  let seedCount = 0, articleCount = 0, receiptCount = 0, vectorCount = null;

  try {
    const r = await dbFirst(env, 'SELECT COUNT(*) as c FROM knowledge_seeds');
    seedCount = r?.c || 0; d1Ok = true;
  } catch {}

  try {
    const r = await dbFirst(env, 'SELECT COUNT(*) as c FROM generated_articles');
    articleCount = r?.c || 0;
  } catch {}

  try {
    const r = await dbFirst(env, 'SELECT COUNT(*) as c FROM receipts');
    receiptCount = r?.c || 0;
  } catch {}

  try {
    const testVec = await embed(env, 'status check');
    vecOk = testVec.length === 768;
    vectorCount = 768;
  } catch {}

  try {
    const list = await env.CONTRACTOR_V008_R2.list({ prefix: 'contractor-v008/', limit: 1 });
    r2Ok = true;
  } catch {}

  return json({
    worker: 'contractor-v008-afo',
    version: VERSION,
    company: COMPANY,
    preview_only: true,
    d1_connected: d1Ok,
    vectorize_connected: vecOk,
    r2_connected: r2Ok,
    embedding_model: EMBEDDING_MODEL,
    embedding_dimensions: 768,
    vectorize_index: V008_INDEX,
    seed_count: seedCount,
    article_count: articleCount,
    receipt_count: receiptCount,
    timestamp: now()
  });
}

// ── API: Knowledge Search ──────────────────────────────────────────────────
async function handleKnowledgeSearch(req, env) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return json({ error: 'q parameter required' }, 400);

  const matches = await vectorSearch(env, q, 5);
  return json({
    query: q,
    results: matches.map(m => ({
      id: m.id,
      score: m.score,
      title: m.metadata?.title || m.id,
      source: m.metadata?.source || 'unknown',
      snippet: m.metadata?.snippet || ''
    }))
  });
}

// ── API: Chat ──────────────────────────────────────────────────────────────
async function handleChat(req, env) {
  const body = await parseBody(req);
  const message = body.message || body.user_input || '';
  if (!message) return json({ error: 'message required' }, 400);

  const reqId = uid();
  const matches = await vectorSearch(env, message, 5);
  const context = matches.map((m, i) =>
    `[${i+1}] ${m.metadata?.title || m.id}: ${m.metadata?.snippet || '(no snippet)'}`
  ).join('\n');

  let response = '', model = 'fallback', isFallback = false;

  try {
    const systemPrompt = `You are a helpful assistant for ${COMPANY}, a roofing and exterior contractor serving Thousand Oaks, Simi Valley, Westlake Village, and Moorpark, CA. Use the provided context to answer questions accurately. Always recommend professional inspection for safety. Never quote prices without an on-site estimate. Be professional, warm, and helpful.\n\nContext from knowledge base:\n${context}`;
    const result = await env.AI.run(CHAT_MODEL, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 512
    });
    response = result.response || result.choices?.[0]?.message?.content || '';
    model = CHAT_MODEL;
  } catch (e) {
    isFallback = true;
    model = 'deterministic-fallback';
    if (matches.length > 0) {
      const top = matches[0];
      response = `[DEMO FALLBACK MODE] Based on our knowledge base regarding "${top.metadata?.title || 'your question'}": ${top.metadata?.snippet || 'Please contact Summit Ridge directly for assistance.'} For emergencies, our team responds within 2-4 hours across all service areas.`;
    } else {
      response = `[DEMO FALLBACK MODE] Thank you for contacting ${COMPANY}. We serve Thousand Oaks, Simi Valley, Westlake Village, and Moorpark, CA with emergency roof repair, replacement, storm damage, gutter installation, siding, and inspections. Please call us directly for immediate assistance.`;
    }
  }

  const contextJson = JSON.stringify(matches.map(m => ({ id: m.id, score: m.score, title: m.metadata?.title })));
  await dbRun(env,
    'INSERT INTO prompt_requests (id, request_type, user_input, retrieved_context, model, response, created_at) VALUES (?,?,?,?,?,?,?)',
    [reqId, 'chat', message, contextJson, model, response, now()]
  );

  const receiptId = uid();
  await dbRun(env,
    'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [receiptId, 'chat', JSON.stringify({ prompt_request_id: reqId, message, model, fallback: isFallback }), now()]
  );

  return json({
    response,
    model,
    fallback: isFallback,
    sources: matches.map(m => ({ id: m.id, score: m.score, title: m.metadata?.title || m.id })),
    prompt_request_id: reqId,
    receipt_id: receiptId
  });
}

// ── API: Generate Article ──────────────────────────────────────────────────
async function handleGenerateArticle(req, env) {
  const body = await parseBody(req);
  const { topic, service, city, tone = 'helpful expert', keywords = [] } = body;
  if (!topic) return json({ error: 'topic required' }, 400);

  const searchQuery = [topic, service, city].filter(Boolean).join(' ');
  const matches = await vectorSearch(env, searchQuery, 5);
  const context = matches.map((m, i) =>
    `[${i+1}] ${m.metadata?.title || m.id}: ${m.metadata?.snippet || ''}`
  ).join('\n');

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  const artId = uid();
  let title = topic, articleBody = '', articleModel = 'fallback';

  try {
    const prompt = `You are a content writer for ${COMPANY}. Write a helpful article for homeowners about: "${topic}"${city ? ' in ' + city : ''}${service ? ' covering ' + service : ''}. Tone: ${tone}.\n\nUse this retrieved knowledge as your source:\n${context}\n\nWrite 400-600 words with: headline (H1), intro paragraph, 2-3 body sections, and a call-to-action. Include specific city and services. Return the article starting with the H1 title.`;
    const result = await env.AI.run(CHAT_MODEL, {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700
    });
    articleBody = result.response || result.choices?.[0]?.message?.content || '';
    const titleMatch = articleBody.match(/^#\s+(.+)/m);
    if (titleMatch) title = titleMatch[1].trim();
    articleModel = CHAT_MODEL;
  } catch {
    articleModel = 'deterministic-fallback';
    title = topic + (city ? ' in ' + city : '');
    const contextSnippets = matches.map(m => m.metadata?.snippet || '').filter(Boolean).slice(0, 3);
    articleBody = `# ${title}\n\n[DEMO FALLBACK] This article was generated using retrieved context from the ${COMPANY} knowledge base.\n\n## About This Topic\n\n${contextSnippets[0] || 'Summit Ridge Roofing & Exterior serves Ventura County homeowners with emergency roof repair, replacement, storm damage, gutter installation, and siding services.'}\n\n## Key Information\n\n${contextSnippets[1] || 'We serve Thousand Oaks, Simi Valley, Westlake Village, and Moorpark, CA with fast response times and licensed crews.'}\n\n## Contact Summit Ridge\n\nReady to get started? Summit Ridge Roofing & Exterior offers free inspections and 24/7 emergency response. Contact us today for your roofing and exterior needs in Ventura County.`;
  }

  const sourceContext = JSON.stringify(matches.map(m => ({ id: m.id, score: m.score, title: m.metadata?.title })));
  await dbRun(env,
    'INSERT INTO generated_articles (id, title, slug, topic, body, source_context, status, created_at) VALUES (?,?,?,?,?,?,?,?)',
    [artId, title, slug, topic, articleBody, sourceContext, 'draft', now()]
  );

  const receiptId = uid();
  await dbRun(env,
    'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [receiptId, 'article_generation', JSON.stringify({ article_id: artId, title, slug, model: articleModel, topic, city, service }), now()]
  );

  return json({
    article_id: artId,
    title,
    slug,
    body: articleBody,
    model: articleModel,
    sources: matches.map(m => ({ id: m.id, score: m.score, title: m.metadata?.title || m.id })),
    receipt_id: receiptId
  });
}

// ── API: Articles list ─────────────────────────────────────────────────────
async function handleArticlesList(env) {
  const rows = await dbAll(env, 'SELECT id, title, slug, topic, status, created_at FROM generated_articles ORDER BY created_at DESC LIMIT 50');
  return json({ articles: rows });
}

// ── API: Article by slug ───────────────────────────────────────────────────
async function handleArticleBySlug(slug, env) {
  const row = await dbFirst(env, 'SELECT * FROM generated_articles WHERE slug = ?', [slug]);
  if (!row) return json({ error: 'not found' }, 404);
  return json(row);
}

// ── API: Seed ──────────────────────────────────────────────────────────────
async function handleSeed(req, env) {
  const body = await parseBody(req);
  const { table = 'knowledge_seeds', limit = 20 } = body;

  const allowedTables = {
    knowledge_seeds: { text_cols: ['title', 'body'], meta_cols: ['source_type', 'source_id'] },
    faqs: { text_cols: ['question', 'answer'], meta_cols: ['category'] },
    service_areas: { text_cols: ['city', 'state', 'service', 'body'], meta_cols: ['city', 'state'] },
    generated_articles: { text_cols: ['title', 'topic', 'body'], meta_cols: [] }
  };

  const config = allowedTables[table];
  if (!config) return json({ error: 'unsupported table' }, 400);

  const rows = await dbAll(env, `SELECT * FROM ${table} WHERE vector_status = 'pending' OR vector_status IS NULL LIMIT ?`, [limit]);
  const results = [];

  for (const row of rows) {
    try {
      const text = config.text_cols.map(c => row[c] || '').join(' ').trim().slice(0, 2000);
      const metadata = { source: table, source_id: row.id, title: row.title || row.question || row.city || row.id, snippet: text.slice(0, 200) };
      config.meta_cols.forEach(c => { if (row[c]) metadata[c] = row[c]; });
      const r = await upsertVector(env, row.id, text, metadata);
      if (table !== 'generated_articles') {
        await dbRun(env, `UPDATE ${table} SET vector_status = 'indexed', indexed_at = ? WHERE id = ?`, [now(), row.id]);
      } else {
        await dbRun(env, `UPDATE ${table} SET status = 'indexed' WHERE id = ?`, [row.id]);
      }
      results.push({ id: row.id, dims: r.dims, ok: true });
    } catch (e) {
      results.push({ id: row.id, ok: false, error: e.message });
    }
  }

  const receiptId = uid();
  await dbRun(env,
    'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [receiptId, 'seed', JSON.stringify({ table, total: results.length, ok: results.filter(r=>r.ok).length, fail: results.filter(r=>!r.ok).length }), now()]
  );

  return json({ table, total: results.length, results, receipt_id: receiptId });
}

// ── API: Upload manifest ───────────────────────────────────────────────────
async function handleUploadManifest(req, env) {
  const body = await parseBody(req);
  const { r2_key, site_id, customer_id, filename, content_type, route, title, summary, transcript, extracted_text } = body;
  if (!r2_key || !filename) return json({ error: 'r2_key and filename required' }, 400);

  const textContent = extracted_text || transcript || summary || null;
  if (!textContent) return json({ error: 'No vectorizable text: provide extracted_text, transcript, or summary' }, 400);

  const id = uid();
  await dbRun(env,
    'INSERT OR REPLACE INTO upload_metadata (id, r2_key, site_id, customer_id, filename, content_type, route, title, summary, transcript, extracted_text, created_at, vector_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [id, r2_key, site_id||'', customer_id||'', filename, content_type||'', route||'', title||filename, summary||'', transcript||'', extracted_text||'', now(), 'pending']
  );

  const metadata = { source: 'upload_metadata', source_id: id, title: title || filename, snippet: textContent.slice(0, 200) };
  await upsertVector(env, id, textContent.slice(0, 2000), metadata);
  await dbRun(env, "UPDATE upload_metadata SET vector_status = 'indexed' WHERE id = ?", [id]);

  const receiptId = uid();
  await dbRun(env, 'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [receiptId, 'upload_manifest', JSON.stringify({ upload_id: id, r2_key, filename, vectorized: true }), now()]
  );

  return json({ upload_id: id, vectorized: true, receipt_id: receiptId });
}

// ── API: Receipts ──────────────────────────────────────────────────────────
async function handleReceipts(req, env) {
  const body = await parseBody(req);
  const { receipt_type, payload } = body;
  const id = uid();
  await dbRun(env, 'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [id, receipt_type || 'manual', JSON.stringify(payload || body), now()]
  );
  return json({ receipt_id: id, ok: true });
}

// ── API: Lead form ─────────────────────────────────────────────────────────
async function handleLeadSubmit(req, env) {
  const body = await parseBody(req);
  const { name, email, phone, service_needed, company } = body;
  if (!name || !email) return json({ error: 'name and email required' }, 400);
  const id = uid();
  await dbRun(env, 'INSERT INTO customers (id, name, email, phone, company, service_needed, created_at) VALUES (?,?,?,?,?,?,?)',
    [id, name, email, phone||'', company||'', service_needed||'', now()]
  );
  const receiptId = uid();
  await dbRun(env, 'INSERT INTO receipts (id, receipt_type, payload_json, created_at) VALUES (?,?,?,?)',
    [receiptId, 'lead', JSON.stringify({ customer_id: id, name, email, service_needed }), now()]
  );
  return json({ customer_id: id, receipt_id: receiptId, message: 'Thank you! Summit Ridge will be in touch shortly.' });
}

// ── Frontend HTML ──────────────────────────────────────────────────────────
function buildFrontend() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Summit Ridge Roofing & Exterior</title>
<meta name="description" content="Emergency roof repair, replacement, storm damage, gutter installation, and siding services in Thousand Oaks, Simi Valley, Westlake Village, and Moorpark, CA.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --slate:#0f172a;--slate-mid:#1e293b;--slate-soft:#334155;
  --amber:#f59e0b;--amber-light:#fbbf24;--amber-pale:#fffbeb;
  --cream:#fafaf9;--warm-white:#f5f5f0;
  --text:#0f172a;--muted:#64748b;
  --radius:6px;--shadow:0 4px 24px rgba(15,23,42,.08);
}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text);line-height:1.6}

/* NAV */
nav{position:sticky;top:0;z-index:100;background:var(--slate);border-bottom:2px solid var(--amber)}
.nav-inner{max-width:1140px;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:#fff;letter-spacing:-.01em;line-height:1.2}
.nav-logo span{color:var(--amber);display:block;font-size:.7rem;font-family:'DM Sans',sans-serif;font-weight:400;letter-spacing:.12em;text-transform:uppercase}
.nav-links{display:flex;gap:1.5rem;list-style:none}
.nav-links a{color:#94a3b8;text-decoration:none;font-size:.875rem;font-weight:500;letter-spacing:.02em;transition:color .2s}
.nav-links a:hover{color:var(--amber)}
.nav-cta{background:var(--amber);color:var(--slate);font-weight:600;font-size:.875rem;padding:.5rem 1.25rem;border-radius:var(--radius);text-decoration:none;transition:background .2s}
.nav-cta:hover{background:var(--amber-light)}

/* HERO */
.hero{background:var(--slate);color:#fff;padding:6rem 1.5rem 5rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 60% 40%, rgba(245,158,11,.12) 0%, transparent 70%);pointer-events:none}
.hero-inner{max-width:1140px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.hero-eyebrow{font-size:.75rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--amber);margin-bottom:1rem}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.4rem,5vw,3.8rem);font-weight:900;line-height:1.1;margin-bottom:1.5rem}
.hero h1 em{color:var(--amber);font-style:normal}
.hero-sub{font-size:1.1rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.7;font-weight:300}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap}
.btn-primary{background:var(--amber);color:var(--slate);font-weight:700;font-size:1rem;padding:.875rem 2rem;border-radius:var(--radius);text-decoration:none;border:none;cursor:pointer;transition:background .2s,transform .15s;display:inline-block}
.btn-primary:hover{background:var(--amber-light);transform:translateY(-1px)}
.btn-outline{background:transparent;color:#fff;font-weight:600;font-size:1rem;padding:.875rem 2rem;border-radius:var(--radius);border:1.5px solid #334155;cursor:pointer;transition:border-color .2s,color .2s;display:inline-block;text-decoration:none}
.btn-outline:hover{border-color:var(--amber);color:var(--amber)}
.hero-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}
.stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius);padding:1.5rem}
.stat-num{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;color:var(--amber)}
.stat-label{font-size:.8rem;color:#64748b;margin-top:.25rem;text-transform:uppercase;letter-spacing:.05em}

/* SECTIONS */
section{padding:5rem 1.5rem}
.section-inner{max-width:1140px;margin:0 auto}
.section-label{font-size:.7rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--amber);margin-bottom:.75rem}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:700;margin-bottom:1.5rem;line-height:1.2}
.section-sub{color:var(--muted);font-size:1.05rem;max-width:56ch;margin-bottom:3rem;line-height:1.7}

/* TABS (Services) */
.tab-nav{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:2rem}
.tab-btn{background:var(--warm-white);border:1.5px solid #e2e8f0;color:var(--slate-soft);font-size:.875rem;font-weight:500;padding:.5rem 1.25rem;border-radius:30px;cursor:pointer;transition:all .2s;white-space:nowrap}
.tab-btn.active{background:var(--slate);color:#fff;border-color:var(--slate)}
.tab-btn:hover:not(.active){border-color:var(--amber);color:var(--amber)}
.service-panel{display:none;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.service-panel.active{display:grid}
.service-content h3{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:1rem}
.service-content p{color:var(--muted);line-height:1.75;margin-bottom:1.25rem}
.service-highlights{list-style:none;margin-bottom:2rem}
.service-highlights li{padding:.5rem 0;padding-left:1.5rem;position:relative;color:var(--slate-soft)}
.service-highlights li::before{content:'✓';position:absolute;left:0;color:var(--amber);font-weight:700}
.service-img-area{background:var(--slate-mid);border-radius:8px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-size:3rem}

/* FAQ */
.faq-grid{display:grid;gap:1rem}
.faq-item{background:#fff;border:1px solid #e2e8f0;border-radius:var(--radius);overflow:hidden;transition:border-color .2s}
.faq-item:hover{border-color:var(--amber)}
.faq-q{width:100%;text-align:left;background:none;border:none;padding:1.25rem 1.5rem;font-size:1rem;font-weight:600;color:var(--slate);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:1rem}
.faq-q .arrow{color:var(--amber);font-size:1.2rem;transition:transform .25s;flex-shrink:0}
.faq-item.open .arrow{transform:rotate(180deg)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease}
.faq-item.open .faq-a{max-height:300px}
.faq-a-inner{padding:0 1.5rem 1.25rem;color:var(--muted);line-height:1.75}

/* CHAT */
.chat-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:var(--shadow)}
.chat-header{background:var(--slate);padding:1.25rem 1.5rem;display:flex;align-items:center;gap:.875rem}
.chat-avatar{width:40px;height:40px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.chat-header-text h4{color:#fff;font-weight:600;font-size:1rem}
.chat-header-text p{color:#64748b;font-size:.8rem}
.chat-messages{height:380px;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
.chat-msg{max-width:80%;padding:.875rem 1.125rem;border-radius:12px;font-size:.9375rem;line-height:1.6}
.chat-msg.bot{background:var(--warm-white);border:1px solid #e2e8f0;align-self:flex-start;border-bottom-left-radius:2px}
.chat-msg.user{background:var(--slate);color:#fff;align-self:flex-end;border-bottom-right-radius:2px}
.chat-sources{font-size:.75rem;color:var(--muted);margin-top:.5rem;padding:.5rem .75rem;background:#f8fafc;border-radius:4px;border-left:2px solid var(--amber)}
.chat-input-row{display:flex;gap:.75rem;padding:1.25rem 1.5rem;border-top:1px solid #e2e8f0;background:#fafaf9}
.chat-input{flex:1;border:1.5px solid #e2e8f0;border-radius:var(--radius);padding:.75rem 1rem;font-size:.9375rem;font-family:inherit;outline:none;transition:border-color .2s}
.chat-input:focus{border-color:var(--amber)}
.chat-send{background:var(--amber);color:var(--slate);font-weight:700;border:none;border-radius:var(--radius);padding:.75rem 1.5rem;cursor:pointer;font-size:.9375rem;transition:background .2s}
.chat-send:hover{background:var(--amber-light)}
.chat-send:disabled{opacity:.5;cursor:not-allowed}

/* ARTICLE GENERATOR */
.article-gen-form{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:2rem;margin-bottom:2rem;box-shadow:var(--shadow)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.form-group{display:flex;flex-direction:column;gap:.4rem}
.form-group label{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.form-group input,.form-group select{border:1.5px solid #e2e8f0;border-radius:var(--radius);padding:.7rem 1rem;font-size:.9375rem;font-family:inherit;outline:none;transition:border-color .2s}
.form-group input:focus,.form-group select:focus{border-color:var(--amber)}
.article-result{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:2rem;white-space:pre-wrap;font-size:.9375rem;line-height:1.75;color:var(--text);box-shadow:var(--shadow)}
.article-result h1,.article-result h2,.article-result h3{font-family:'Playfair Display',serif;font-weight:700;margin:.5em 0}
.article-result h1{font-size:1.6rem;border-bottom:2px solid var(--amber);padding-bottom:.5rem;margin-bottom:1rem}

/* AREAS */
.areas-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.area-card{background:#fff;border:1px solid #e2e8f0;border-radius:var(--radius);padding:2rem;transition:border-color .2s,transform .2s}
.area-card:hover{border-color:var(--amber);transform:translateY(-3px)}
.area-city{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;margin-bottom:.5rem}
.area-tag{display:inline-block;background:var(--amber-pale);color:#92400e;font-size:.75rem;font-weight:600;padding:.25rem .75rem;border-radius:30px;margin-bottom:.875rem;letter-spacing:.04em}
.area-desc{color:var(--muted);font-size:.875rem;line-height:1.65}

/* LEAD FORM */
.lead-form-wrap{background:var(--slate);color:#fff;border-radius:10px;padding:3rem;box-shadow:var(--shadow)}
.lead-form-wrap .section-label{color:var(--amber)}
.lead-form-wrap .section-title{color:#fff}
.lead-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.lead-input{width:100%;border:1.5px solid #334155;background:rgba(255,255,255,.05);border-radius:var(--radius);padding:.8rem 1rem;font-size:.9375rem;font-family:inherit;color:#fff;outline:none;transition:border-color .2s}
.lead-input:focus{border-color:var(--amber)}
.lead-input::placeholder{color:#475569}
.lead-input option{background:var(--slate);color:#fff}

/* STATUS */
.status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.status-card{background:#fff;border:1px solid #e2e8f0;border-radius:var(--radius);padding:1.5rem}
.status-card h4{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.5rem;font-weight:600}
.status-val{font-size:1.3rem;font-weight:700;color:var(--slate)}
.status-ok{color:#16a34a}
.status-err{color:#dc2626}
.status-raw{background:#1e293b;color:#94a3b8;border-radius:var(--radius);padding:1.5rem;font-size:.8rem;font-family:monospace;white-space:pre-wrap;margin-top:1.5rem;overflow:auto;max-height:320px}

/* FOOTER */
footer{background:var(--slate);color:#64748b;padding:3rem 1.5rem;text-align:center;border-top:1px solid #1e293b}
footer strong{color:var(--amber)}

/* LOADING */
.loading{display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.alert{padding:1rem 1.25rem;border-radius:var(--radius);margin-top:1rem;font-size:.9rem}
.alert-success{background:#f0fdf4;border:1px solid #86efac;color:#15803d}
.alert-error{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c}

@media(max-width:768px){
  .hero-inner,.service-panel.active,.form-row,.lead-form-grid{grid-template-columns:1fr}
  .nav-links{display:none}
  .hero{padding:4rem 1.5rem 3rem}
}
</style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <div class="nav-logo">Summit Ridge<span>Roofing & Exterior</span></div>
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#areas">Service Areas</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a href="#chat">Chat</a></li>
      <li><a href="#articles">Articles</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#status">Status</a></li>
    </ul>
    <a href="#contact" class="nav-cta">Free Inspection</a>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-eyebrow">Ventura County's Trusted Roofers</div>
      <h1>When Storms Hit,<br><em>We're There</em></h1>
      <p class="hero-sub">Emergency roof repair, full replacements, storm damage restoration, and exterior services across Thousand Oaks, Simi Valley, Westlake Village, and Moorpark.</p>
      <div class="hero-actions">
        <a href="#chat" class="btn-primary">Ask Our AI Assistant</a>
        <a href="#contact" class="btn-outline">Free Inspection</a>
      </div>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">24/7</div><div class="stat-label">Emergency Response</div></div>
      <div class="stat"><div class="stat-num">2–4hr</div><div class="stat-label">Arrival Time</div></div>
      <div class="stat"><div class="stat-num">100%</div><div class="stat-label">Licensed & Insured</div></div>
      <div class="stat"><div class="stat-num">4 Cities</div><div class="stat-label">Service Area</div></div>
    </div>
  </div>
</div>

<!-- SERVICES -->
<section id="services" style="background:var(--warm-white)">
  <div class="section-inner">
    <div class="section-label">What We Do</div>
    <h2 class="section-title">Roofing & Exterior Services</h2>
    <div class="tab-nav">
      <button class="tab-btn active" data-tab="emergency">Emergency Repair</button>
      <button class="tab-btn" data-tab="replacement">Roof Replacement</button>
      <button class="tab-btn" data-tab="storm">Storm Damage</button>
      <button class="tab-btn" data-tab="gutters">Gutters</button>
      <button class="tab-btn" data-tab="siding">Siding</button>
      <button class="tab-btn" data-tab="inspection">Inspections</button>
    </div>
    <div class="service-panel active" id="tab-emergency">
      <div class="service-content">
        <h3>Emergency Roof Repair</h3>
        <p>Active leak? Don't wait. Summit Ridge dispatches crews within 2–4 hours for emergency calls across all service areas. We tarp, seal, and secure vulnerable areas immediately.</p>
        <ul class="service-highlights">
          <li>24/7 emergency response</li>
          <li>2–4 hour arrival for Ventura County</li>
          <li>Immediate weatherproofing and tarping</li>
          <li>Full damage documentation for insurance</li>
          <li>Written estimate before permanent repair</li>
        </ul>
        <a href="#contact" class="btn-primary">Call Now — We Answer 24/7</a>
      </div>
      <div class="service-img-area">🚨</div>
    </div>
    <div class="service-panel" id="tab-replacement">
      <div class="service-content">
        <h3>Roof Replacement</h3>
        <p>Full tear-off and replacement for residential and commercial roofs. We work with asphalt shingles, tile, and flat roof systems. Average residential replacement takes 1–3 days.</p>
        <ul class="service-highlights">
          <li>Free inspection and detailed estimate</li>
          <li>Insurance coordination for storm damage</li>
          <li>Asphalt, tile, and flat roof systems</li>
          <li>Permit acquisition included</li>
          <li>New underlayment and ice barrier</li>
        </ul>
        <a href="#contact" class="btn-primary">Schedule Free Inspection</a>
      </div>
      <div class="service-img-area">🏠</div>
    </div>
    <div class="service-panel" id="tab-storm">
      <div class="service-content">
        <h3>Storm Damage Repair</h3>
        <p>Wind, hail, and water damage experts. We document everything, coordinate with your insurance adjuster, and restore your roof to pre-storm condition.</p>
        <ul class="service-highlights">
          <li>Full photographic damage documentation</li>
          <li>Adjuster inspection attendance</li>
          <li>Works with all major insurers</li>
          <li>No deductible waiving or claim sign-over</li>
          <li>2–4 week typical claim approval</li>
        </ul>
        <a href="#contact" class="btn-primary">Start My Insurance Claim</a>
      </div>
      <div class="service-img-area">⛈️</div>
    </div>
    <div class="service-panel" id="tab-gutters">
      <div class="service-content">
        <h3>Gutter Installation</h3>
        <p>Protect your roof, siding, and foundation with properly installed seamless gutters. We offer standard and oversized widths with leaf guard options and annual cleaning packages.</p>
        <ul class="service-highlights">
          <li>Seamless aluminum gutters</li>
          <li>Leaf guard options available</li>
          <li>Annual cleaning packages</li>
          <li>Fascia and soffit repair</li>
          <li>Proper pitch and drainage guaranteed</li>
        </ul>
        <a href="#contact" class="btn-primary">Get Gutter Estimate</a>
      </div>
      <div class="service-img-area">💧</div>
    </div>
    <div class="service-panel" id="tab-siding">
      <div class="service-content">
        <h3>Siding Repair & Replacement</h3>
        <p>Wood, fiber cement (Hardie board), vinyl, and stucco siding. We match existing materials wherever possible. Common issues include UV damage, woodpecker holes, and moisture intrusion.</p>
        <ul class="service-highlights">
          <li>Wood, fiber cement, vinyl, stucco</li>
          <li>Material matching for repairs</li>
          <li>Trim, fascia, and soffit work</li>
          <li>Combined with full exterior inspection</li>
          <li>HOA-compliant color matching</li>
        </ul>
        <a href="#contact" class="btn-primary">Get Siding Estimate</a>
      </div>
      <div class="service-img-area">🏡</div>
    </div>
    <div class="service-panel" id="tab-inspection">
      <div class="service-content">
        <h3>Roof Inspections</h3>
        <p>Free inspections for Ventura County homeowners. We recommend twice per year — October before rainy season and April after. Includes a full photographic condition report.</p>
        <ul class="service-highlights">
          <li>Free for Ventura County residents</li>
          <li>Surface, flashing, and gutter assessment</li>
          <li>Attic ventilation check</li>
          <li>Written photographic report</li>
          <li>Recommended for new homebuyers</li>
        </ul>
        <a href="#contact" class="btn-primary">Book Free Inspection</a>
      </div>
      <div class="service-img-area">🔍</div>
    </div>
  </div>
</section>

<!-- SERVICE AREAS -->
<section id="areas">
  <div class="section-inner">
    <div class="section-label">Where We Work</div>
    <h2 class="section-title">Service Areas</h2>
    <p class="section-sub">Summit Ridge serves homeowners across Ventura County with fast response times and local expertise.</p>
    <div class="areas-grid" id="areas-grid">
      <div class="area-card"><div class="area-city">Thousand Oaks</div><div class="area-tag">All Services</div><div class="area-desc">Including Newbury Park and Oak Park. Same-day emergency response. Licensed in Ventura County.</div></div>
      <div class="area-card"><div class="area-city">Simi Valley</div><div class="area-tag">Emergency & Storm</div><div class="area-desc">From Wood Ranch to Knollwood. Familiar with local permits and HOA guidelines.</div></div>
      <div class="area-card"><div class="area-city">Westlake Village</div><div class="area-tag">Premium Roofing</div><div class="area-desc">Tile, architectural shingles, flat roofs. HOA color and material compliance.</div></div>
      <div class="area-card"><div class="area-city">Moorpark</div><div class="area-tag">Full Services</div><div class="area-desc">New construction and established homes. Gutter and siding services available.</div></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section id="faq" style="background:var(--warm-white)">
  <div class="section-inner">
    <div class="section-label">Common Questions</div>
    <h2 class="section-title">Frequently Asked Questions</h2>
    <div class="faq-grid" id="faq-list">
      <div class="faq-item">
        <button class="faq-q">What should I do if my roof is leaking right now? <span class="arrow">▾</span></button>
        <div class="faq-a"><div class="faq-a-inner">Call Summit Ridge immediately at our emergency line. While waiting, place buckets under active drips, move valuables away from the area, and do not go on the roof yourself. We will dispatch a crew within 2–4 hours to assess and temporarily stop the leak. We also document damage for your insurance claim.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">Does my homeowner insurance cover storm roof damage? <span class="arrow">▾</span></button>
        <div class="faq-a"><div class="faq-a-inner">Most standard homeowner policies in California cover sudden storm damage from wind, hail, and falling debris. Summit Ridge can help you file your claim and attend the adjuster inspection. We work with all major insurers including State Farm, Allstate, Farmers, and USAA. There is no cost to you for the inspection and claim documentation.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">How often should I get a roof inspection? <span class="arrow">▾</span></button>
        <div class="faq-a"><div class="faq-a-inner">We recommend twice per year: in October before rainy season and in April after storm season. You should also inspect after any significant wind event or hailstorm. Our inspections are free for Ventura County residents and include a written photographic report.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">When should I repair vs replace my roof? <span class="arrow">▾</span></button>
        <div class="faq-a"><div class="faq-a-inner">Repair is appropriate for localized damage covering less than 25–30% of the roof surface and when the existing roof is less than 15 years old. Replacement is better when the roof is 20+ years old, damage is widespread, or you are experiencing recurring leaks. Summit Ridge provides honest assessments.</div></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">Why are my gutters causing roof problems? <span class="arrow">▾</span></button>
        <div class="faq-a"><div class="faq-a-inner">Clogged or improperly pitched gutters cause water to back up under roof shingles, rotting the fascia board and decking. Overflowing gutters also erode soil around the foundation. Summit Ridge inspects gutters during every roof visit and offers seamless gutter installation and annual cleaning services.</div></div>
      </div>
    </div>
  </div>
</section>

<!-- CHAT -->
<section id="chat">
  <div class="section-inner">
    <div class="section-label">AI Assistant</div>
    <h2 class="section-title">Ask Summit Ridge Anything</h2>
    <p class="section-sub">Our AI assistant is trained on Summit Ridge knowledge — emergency procedures, services, insurance guidance, and local expertise.</p>
    <div class="chat-wrap">
      <div class="chat-header">
        <div class="chat-avatar">🏠</div>
        <div class="chat-header-text"><h4>Summit Ridge Assistant</h4><p>Powered by contractor knowledge base + AI</p></div>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-msg bot">Hi! I'm the Summit Ridge Roofing assistant. Ask me about emergency repairs, roof replacement, storm damage, gutters, siding, or anything roofing-related for Ventura County. How can I help?</div>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-input" placeholder="Ask about emergency roof repair, storm damage..." />
        <button class="chat-send" id="chat-send">Send</button>
      </div>
    </div>
  </div>
</section>

<!-- ARTICLE GENERATOR -->
<section id="articles" style="background:var(--warm-white)">
  <div class="section-inner">
    <div class="section-label">Content Engine</div>
    <h2 class="section-title">AI Article Generator</h2>
    <p class="section-sub">Generate SEO articles grounded in Summit Ridge's knowledge base. Each article is stored and retrievable.</p>
    <div class="article-gen-form">
      <div class="form-row">
        <div class="form-group"><label>Topic *</label><input id="art-topic" placeholder="Emergency Roof Repair in Simi Valley" /></div>
        <div class="form-group"><label>Service</label><input id="art-service" placeholder="emergency roof repair" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>City</label><input id="art-city" placeholder="Simi Valley" /></div>
        <div class="form-group"><label>Tone</label>
          <select id="art-tone"><option>helpful expert</option><option>urgent and action-oriented</option><option>educational</option><option>friendly and conversational</option></select>
        </div>
      </div>
      <button class="btn-primary" id="art-generate">Generate Article</button>
      <div id="art-status"></div>
    </div>
    <div id="art-result" style="display:none">
      <div id="art-output" class="article-result"></div>
      <div id="art-meta" style="margin-top:1rem;font-size:.8rem;color:var(--muted)"></div>
    </div>
    <div style="margin-top:2.5rem">
      <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:1rem">Saved Articles</h3>
      <div id="articles-list"></div>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact" style="background:var(--slate-mid)">
  <div class="section-inner">
    <div class="lead-form-wrap">
      <div class="section-label">Get Started</div>
      <h2 class="section-title">Request a Free Inspection</h2>
      <form id="lead-form">
        <div class="lead-form-grid" style="margin-bottom:1rem">
          <input class="lead-input" id="lead-name" placeholder="Full Name *" required />
          <input class="lead-input" id="lead-email" type="email" placeholder="Email Address *" required />
          <input class="lead-input" id="lead-phone" placeholder="Phone Number" />
          <select class="lead-input" id="lead-service">
            <option value="">Service Needed</option>
            <option>Emergency Roof Repair</option>
            <option>Roof Replacement</option>
            <option>Storm Damage</option>
            <option>Gutter Installation</option>
            <option>Siding Repair</option>
            <option>Roof Inspection</option>
          </select>
        </div>
        <button type="submit" class="btn-primary" id="lead-submit">Request Free Inspection</button>
        <div id="lead-status"></div>
      </form>
    </div>
  </div>
</section>

<!-- STATUS -->
<section id="status">
  <div class="section-inner">
    <div class="section-label">Demo Diagnostics</div>
    <h2 class="section-title">System Status</h2>
    <p class="section-sub">Live status panel for the contractor-v008-afo demo worker.</p>
    <div class="status-grid" id="status-grid">
      <div class="status-card"><h4>Loading...</h4><div class="status-val"><span class="loading"></span></div></div>
    </div>
    <div id="status-raw" class="status-raw" style="display:none"></div>
    <button class="btn-outline" id="status-refresh" style="margin-top:1.5rem">Refresh Status</button>
    <button class="btn-primary" id="status-seed" style="margin-top:1.5rem;margin-left:1rem">Seed Knowledge Base</button>
    <div id="seed-status"></div>
  </div>
</section>

<footer>
  <strong>Summit Ridge Roofing & Exterior</strong> — Ventura County, CA<br>
  <span style="font-size:.8rem">Demo powered by contractor-v008-afo · Preview only · Not a production deployment</span>
</footer>

<script>
const BASE = '';

// ── Tab handling ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.service-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── FAQ accordion ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ── Chat ──
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

function appendMsg(text, role, sources) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  if (sources && sources.length) {
    const src = document.createElement('div');
    src.className = 'chat-sources';
    src.textContent = 'Sources: ' + sources.map(s => s.title || s.id).slice(0,3).join(', ');
    div.appendChild(src);
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  chatInput.value = '';
  chatSend.disabled = true;
  appendMsg(msg, 'user');
  const thinking = document.createElement('div');
  thinking.className = 'chat-msg bot';
  thinking.innerHTML = '<span class="loading"></span> Thinking...';
  chatMessages.appendChild(thinking);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  try {
    const res = await fetch(BASE + '/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) });
    const data = await res.json();
    chatMessages.removeChild(thinking);
    appendMsg(data.response || data.error || 'No response', 'bot', data.sources);
  } catch(e) {
    chatMessages.removeChild(thinking);
    appendMsg('Error: ' + e.message, 'bot');
  }
  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) sendChat(); });

// ── Article generation ──
document.getElementById('art-generate').addEventListener('click', async () => {
  const topic = document.getElementById('art-topic').value.trim();
  if (!topic) { document.getElementById('art-status').innerHTML = '<div class="alert alert-error">Topic is required.</div>'; return; }
  document.getElementById('art-status').innerHTML = '<div class="alert"><span class="loading"></span> Generating article...</div>';
  document.getElementById('art-result').style.display = 'none';
  try {
    const res = await fetch(BASE + '/api/generate-article', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ topic, service: document.getElementById('art-service').value, city: document.getElementById('art-city').value, tone: document.getElementById('art-tone').value })
    });
    const data = await res.json();
    document.getElementById('art-status').innerHTML = '<div class="alert alert-success">✓ Article generated · Receipt: ' + data.receipt_id + '</div>';
    document.getElementById('art-output').textContent = data.body || data.error;
    document.getElementById('art-meta').textContent = 'Slug: ' + data.slug + ' · Model: ' + data.model + ' · Sources: ' + (data.sources||[]).length;
    document.getElementById('art-result').style.display = 'block';
    loadArticles();
  } catch(e) {
    document.getElementById('art-status').innerHTML = '<div class="alert alert-error">Error: ' + e.message + '</div>';
  }
});

async function loadArticles() {
  try {
    const res = await fetch(BASE + '/api/articles');
    const data = await res.json();
    const el = document.getElementById('articles-list');
    if (!data.articles || !data.articles.length) { el.innerHTML = '<p style="color:var(--muted)">No articles yet. Generate one above.</p>'; return; }
    el.innerHTML = data.articles.map(a =>
      `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:1rem 1.25rem;margin-bottom:.75rem;display:flex;justify-content:space-between;align-items:center">
        <div><strong style="font-family:'Playfair Display',serif">${a.title}</strong><br><span style="font-size:.8rem;color:var(--muted)">${a.topic} · ${a.status} · ${a.created_at.slice(0,10)}</span></div>
        <span style="font-size:.75rem;color:var(--muted);font-family:monospace">${a.slug}</span>
      </div>`
    ).join('');
  } catch {}
}
loadArticles();

// ── Lead form ──
document.getElementById('lead-form').addEventListener('submit', async e => {
  e.preventDefault();
  document.getElementById('lead-status').innerHTML = '<div class="alert"><span class="loading"></span> Submitting...</div>';
  try {
    const res = await fetch(BASE + '/api/leads', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, phone: document.getElementById('lead-phone').value, service_needed: document.getElementById('lead-service').value })
    });
    const data = await res.json();
    document.getElementById('lead-status').innerHTML = '<div class="alert alert-success">✓ ' + (data.message || 'Submitted!') + '</div>';
    document.getElementById('lead-form').reset();
  } catch(e) {
    document.getElementById('lead-status').innerHTML = '<div class="alert alert-error">Error: ' + e.message + '</div>';
  }
});

// ── Status panel ──
async function loadStatus() {
  try {
    const res = await fetch(BASE + '/api/status');
    const data = await res.json();
    const grid = document.getElementById('status-grid');
    grid.innerHTML = [
      ['Worker', data.worker, false],
      ['Version', data.version, false],
      ['D1 Connected', data.d1_connected, true],
      ['Vectorize', data.vectorize_connected, true],
      ['R2', data.r2_connected, true],
      ['Embedding Model', data.embedding_model, false],
      ['Dimensions', data.embedding_dimensions, false],
      ['Seeds', data.seed_count, false],
      ['Articles', data.article_count, false],
      ['Receipts', data.receipt_count, false],
    ].map(([label, val, isBool]) => {
      const cls = isBool ? (val ? 'status-ok' : 'status-err') : '';
      const disp = isBool ? (val ? '✓ Yes' : '✗ No') : (val ?? '—');
      return `<div class="status-card"><h4>${label}</h4><div class="status-val ${cls}">${disp}</div></div>`;
    }).join('');
    document.getElementById('status-raw').textContent = JSON.stringify(data, null, 2);
    document.getElementById('status-raw').style.display = 'block';
  } catch(e) {
    document.getElementById('status-grid').innerHTML = '<div class="status-card"><h4>Error</h4><div class="status-val status-err">' + e.message + '</div></div>';
  }
}

document.getElementById('status-refresh').addEventListener('click', loadStatus);

document.getElementById('status-seed').addEventListener('click', async () => {
  const el = document.getElementById('seed-status');
  el.innerHTML = '<div class="alert"><span class="loading"></span> Seeding knowledge base...</div>';
  const tables = ['knowledge_seeds', 'faqs', 'service_areas', 'generated_articles'];
  const results = [];
  for (const table of tables) {
    try {
      const res = await fetch(BASE + '/api/knowledge/seed', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ table, limit: 20 }) });
      const data = await res.json();
      results.push(table + ': ' + (data.total||0) + ' processed');
    } catch(e) { results.push(table + ': error'); }
  }
  el.innerHTML = '<div class="alert alert-success">✓ Seeding complete: ' + results.join(' | ') + '</div>';
  loadStatus();
});

loadStatus();
</script>
</body>
</html>`;
}

// ── Router ──────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
    }

    // API routes
    if (path === '/api/status') return handleStatus(env);
    if (path === '/api/knowledge/search') return handleKnowledgeSearch(request, env);
    if (path === '/api/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/api/generate-article' && method === 'POST') return handleGenerateArticle(request, env);
    if (path === '/api/articles' && method === 'GET') return handleArticlesList(env);
    if (path.startsWith('/api/articles/') && method === 'GET') return handleArticleBySlug(path.replace('/api/articles/', ''), env);
    if (path === '/api/knowledge/seed' && method === 'POST') return handleSeed(request, env);
    if (path === '/api/upload/manifest' && method === 'POST') return handleUploadManifest(request, env);
    if (path === '/api/receipts' && method === 'POST') return handleReceipts(request, env);
    if (path === '/api/leads' && method === 'POST') return handleLeadSubmit(request, env);

    // Frontend
    if (path === '/' || path === '') return html(buildFrontend());

    return json({ error: 'not found', path }, 404);
  }
};