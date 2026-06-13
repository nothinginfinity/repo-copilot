const VERSION = '0.1.0';
const PAYLOAD_THRESHOLD_BYTES = 2048;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};

const TOOLS = [
  { name: 'ledger_status', description: 'Health check. Returns version, all binding statuses, and active project count.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'start_session', description: 'Start a new project session in the ledger. Returns a session_id. Call at the start of any significant work block.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, description: { type: 'string' }, context_tags: { type: 'array', items: { type: 'string' } } }, required: ['project_id'] } },
  { name: 'log_execution', description: 'Record a tool execution into the ledger. Large payloads automatically offloaded to R2.', inputSchema: { type: 'object', properties: { session_id: { type: 'string' }, tool_name: { type: 'string' }, status: { type: 'string', enum: ['success','failure','partial','skipped'] }, input_summary: { type: 'string' }, output_summary: { type: 'string' }, payload: { type: 'object' }, mutations: { type: 'array', items: { type: 'string' } }, commit_sha: { type: 'string' }, duration_ms: { type: 'number' } }, required: ['session_id','tool_name','status','output_summary'] } },
  { name: 'record_mutation', description: 'Record a significant state mutation (file write, deploy, schema change) without a full tool execution context.', inputSchema: { type: 'object', properties: { session_id: { type: 'string' }, resource: { type: 'string' }, mutation_type: { type: 'string', enum: ['create','update','delete','deploy','schema_change','config_change'] }, description: { type: 'string' }, commit_sha: { type: 'string' } }, required: ['session_id','resource','mutation_type','description'] } },
  { name: 'get_project_handoff', description: 'Generate a dense Markdown handoff report synthesizing session history, tool executions, mutations, and pending items (~2000 token footprint).', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, limit_events: { type: 'number' }, include_payload_refs: { type: 'boolean' } }, required: ['project_id'] } },
  { name: 'search_history', description: 'Semantic search across tool execution history using Vectorize. Falls back to keyword search if no vector match.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, project_id: { type: 'string' }, top_k: { type: 'number' } }, required: ['query'] } },
  { name: 'list_sessions', description: 'List recent sessions for a project or across all projects.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, limit: { type: 'number' } }, required: [] } },
  { name: 'get_session_detail', description: 'Get full execution log for a specific session including all tool calls, mutations, and payload references.', inputSchema: { type: 'object', properties: { session_id: { type: 'string' } }, required: ['session_id'] } },
  { name: 'resolve_payload', description: 'Fetch a large payload offloaded to R2 by its URI reference.', inputSchema: { type: 'object', properties: { payload_uri: { type: 'string' } }, required: ['payload_uri'] } }
];

function rpc(id, r)        { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function errResp(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r)       { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }
function genId(prefix)     { return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }
function now()              { return new Date().toISOString(); }
function byteLength(str)    { return new TextEncoder().encode(str).length; }

async function ensureSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS project_sessions (session_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, description TEXT, context_tags TEXT, status TEXT DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_project ON project_sessions(project_id)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS tool_executions (execution_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, project_id TEXT NOT NULL, tool_name TEXT NOT NULL, status TEXT NOT NULL, input_summary TEXT, output_summary TEXT, payload_uri TEXT, mutations TEXT, commit_sha TEXT, duration_ms INTEGER, vector_id TEXT, created_at TEXT NOT NULL)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_executions_session ON tool_executions(session_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_executions_project ON tool_executions(project_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_executions_tool ON tool_executions(tool_name)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS state_mutations (mutation_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, project_id TEXT NOT NULL, resource TEXT NOT NULL, mutation_type TEXT NOT NULL, description TEXT, commit_sha TEXT, created_at TEXT NOT NULL)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_mutations_session ON state_mutations(session_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_mutations_resource ON state_mutations(resource)`).run();
}

async function kvSet(kv, key, value) { await kv.put(key, typeof value === 'string' ? value : JSON.stringify(value)); }
async function kvGet(kv, key) { const v = await kv.get(key); if (v === null) return null; try { return JSON.parse(v); } catch { return v; } }

async function r2Put(r2, key, payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  await r2.put(key, body, { httpMetadata: { contentType: 'application/json' } });
  return 'r2://' + key;
}
async function r2Get(r2, key) {
  const obj = await r2.get(key);
  if (!obj) return null;
  const text = await obj.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function embedAndStore(vectorize, ai, executionId, projectId, text) {
  if (!vectorize || !ai) return null;
  try {
    const result = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [text.slice(0, 512)] });
    const vector = result.data && result.data[0];
    if (!vector) return null;
    await vectorize.upsert([{ id: executionId, values: vector, metadata: { project_id: projectId, execution_id: executionId } }]);
    return executionId;
  } catch { return null; }
}

async function vectorSearch(vectorize, ai, query, topK) {
  if (!vectorize || !ai) return [];
  try {
    const result = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [query.slice(0, 512)] });
    const vector = result.data && result.data[0];
    if (!vector) return [];
    const res = await vectorize.query(vector, { topK: topK || 5, returnMetadata: true });
    return res.matches || [];
  } catch { return []; }
}

async function dbRun(db, sql, params) { const s = db.prepare(sql); return params ? s.bind(...params).run() : s.run(); }
async function dbFirst(db, sql, params) { const s = db.prepare(sql); return params ? s.bind(...params).first() : s.first(); }
async function dbAll(db, sql, params) { const s = db.prepare(sql); const r = params ? await s.bind(...params).all() : await s.all(); return r.results || []; }

function statusBadge(s) { return ({ success: '✅', failure: '❌', partial: '⚠️', skipped: '⏭️' })[s] || s; }

function buildHandoffReport(project_id, sessions, executions, mutations, activeSession) {
  const lines = [];
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  lines.push('# Context Ledger Handoff — ' + project_id);
  lines.push('_Generated: ' + ts + '_\n');
  if (activeSession) {
    lines.push('## Active Session');
    lines.push('- **ID:** `' + activeSession.session_id + '`');
    lines.push('- **Started:** ' + activeSession.created_at.slice(0, 16).replace('T', ' '));
    if (activeSession.description) lines.push('- **Focus:** ' + activeSession.description);
    if (activeSession.context_tags) { try { const tags = JSON.parse(activeSession.context_tags); if (tags.length) lines.push('- **Tags:** ' + tags.map(function(t){return '`'+t+'`';}).join(', ')); } catch {} }
    lines.push('');
  }
  if (executions.length > 0) {
    lines.push('## Recent Tool Executions (' + executions.length + ')\n');
    lines.push('| # | Tool | Status | Summary | Mutations |');
    lines.push('|---|------|--------|---------|-----------|');
    executions.forEach(function(e, i) {
      const muts = e.mutations ? JSON.parse(e.mutations || '[]') : [];
      const mutStr = muts.length ? muts.slice(0, 2).join(', ') + (muts.length > 2 ? ' +' + (muts.length - 2) : '') : '—';
      const summary = (e.output_summary || '').slice(0, 80) + ((e.output_summary || '').length > 80 ? '…' : '');
      const payNote = e.payload_uri ? ' _(→R2)_' : '';
      lines.push('| ' + (i+1) + ' | `' + e.tool_name + '` | ' + statusBadge(e.status) + ' | ' + summary + payNote + ' | ' + mutStr + ' |');
    });
    lines.push('');
  }
  if (mutations.length > 0) {
    lines.push('## State Mutations (' + mutations.length + ')\n');
    const grouped = {};
    mutations.forEach(function(m){ if (!grouped[m.mutation_type]) grouped[m.mutation_type] = []; grouped[m.mutation_type].push(m); });
    Object.keys(grouped).forEach(function(type) {
      lines.push('**' + type.toUpperCase() + '**');
      grouped[type].slice(0, 8).forEach(function(m) {
        const sha = m.commit_sha ? ' `' + m.commit_sha.slice(0,7) + '`' : '';
        lines.push('- `' + m.resource + '`' + sha + ' — ' + (m.description || '').slice(0, 100));
      });
      lines.push('');
    });
  }
  if (sessions.length > 1) {
    lines.push('## Session History (' + sessions.length + ' sessions)');
    sessions.slice(0, 5).forEach(function(s) {
      lines.push('- ' + (s.status === 'active' ? '🟢' : '⚪') + ' `' + s.session_id + '` — ' + s.created_at.slice(0, 10) + ' — ' + (s.description || 'no description'));
    });
    lines.push('');
  }
  const failed = executions.filter(function(e){return e.status==='failure'||e.status==='partial';});
  if (failed.length > 0) {
    lines.push('## ⚠️ Needs Attention');
    failed.forEach(function(e){ lines.push('- **' + e.tool_name + '** (' + e.status + '): ' + (e.output_summary||'').slice(0,120)); });
    lines.push('');
  }
  lines.push('---');
  lines.push('_Ledger v' + VERSION + ' — resolve full payloads with `resolve_payload {payload_uri}`_');
  return lines.join('\n');
}

async function handle(name, args, env, ctx) {

  if (name === 'ledger_status') {
    let dbOk=false, kvOk=false, r2Ok=false, vecOk=false, aiOk=false, activeCount=0;
    try { await ensureSchema(env.DB); const r=await dbFirst(env.DB,"SELECT COUNT(*) as n FROM project_sessions WHERE status='active'"); activeCount=r?r.n:0; dbOk=true; } catch {}
    try { await env.KV.put('_ping','1',{expirationTtl:60}); kvOk=true; } catch {}
    try { await env.R2.head('_ping'); r2Ok=true; } catch { r2Ok=!!env.R2; }
    vecOk=!!env.VECTORIZE; aiOk=!!env.AI;
    return { status:'ok', worker:'afo-context-ledger-mcp', version:VERSION, bindings:{DB:dbOk,KV:kvOk,R2:r2Ok,VECTORIZE:vecOk,AI:aiOk}, active_sessions:activeCount, payload_threshold_bytes:PAYLOAD_THRESHOLD_BYTES, tools:TOOLS.map(function(t){return t.name;}) };
  }

  if (name === 'start_session') {
    const{project_id,description,context_tags}=args;if(!project_id)throw new Error('project_id required');
    await ensureSchema(env.DB);
    const session_id=genId('sess');const timestamp=now();
    await dbRun(env.DB,'INSERT INTO project_sessions VALUES (?,?,?,?,?,?,?)',[session_id,project_id,description||null,JSON.stringify(context_tags||[]),'active',timestamp,timestamp]);
    await kvSet(env.KV,'project:'+project_id+':active_session',session_id);
    await kvSet(env.KV,'project:'+project_id+':last_updated',timestamp);
    return{ok:true,session_id,project_id,created_at:timestamp,message:'Session started. Use session_id in log_execution calls.'};
  }

  if (name === 'log_execution') {
    const{session_id,tool_name,status,input_summary,output_summary,payload,mutations,commit_sha,duration_ms}=args;
    if(!session_id)throw new Error('session_id required');if(!tool_name)throw new Error('tool_name required');if(!status)throw new Error('status required');if(!output_summary)throw new Error('output_summary required');
    await ensureSchema(env.DB);
    const session=await dbFirst(env.DB,'SELECT project_id FROM project_sessions WHERE session_id = ?',[session_id]);
    if(!session)throw new Error('Session not found: '+session_id);
    const project_id=session.project_id;const execution_id=genId('exec');const timestamp=now();const mutationsJson=JSON.stringify(mutations||[]);
    let payload_uri=null;
    if(payload){const ps=JSON.stringify(payload);if(byteLength(ps)>PAYLOAD_THRESHOLD_BYTES){const r2Key='payloads/'+project_id+'/'+session_id+'/'+execution_id+'.json';payload_uri=await r2Put(env.R2,r2Key,payload);}}
    const embeddingText=[tool_name,status,output_summary,(mutations||[]).join(' ')].join(' | ').slice(0,512);
    if(ctx&&env.VECTORIZE&&env.AI){ctx.waitUntil(embedAndStore(env.VECTORIZE,env.AI,execution_id,project_id,embeddingText).then(function(vid){if(vid){env.DB.prepare('UPDATE tool_executions SET vector_id=? WHERE execution_id=?').bind(vid,execution_id).run().catch(function(){});}}).catch(function(){}));}
    await dbRun(env.DB,'INSERT INTO tool_executions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[execution_id,session_id,project_id,tool_name,status,input_summary||null,output_summary,payload_uri,mutationsJson,commit_sha||null,duration_ms||null,null,timestamp]);
    await kvSet(env.KV,'project:'+project_id+':head',execution_id);
    await kvSet(env.KV,'project:'+project_id+':last_updated',timestamp);
    await dbRun(env.DB,'UPDATE project_sessions SET updated_at=? WHERE session_id=?',[timestamp,session_id]);
    return{ok:true,execution_id,session_id,project_id,tool_name,status,payload_offloaded:!!payload_uri,payload_uri,created_at:timestamp};
  }

  if (name === 'record_mutation') {
    const{session_id,resource,mutation_type,description,commit_sha}=args;
    if(!session_id)throw new Error('session_id required');if(!resource)throw new Error('resource required');if(!mutation_type)throw new Error('mutation_type required');if(!description)throw new Error('description required');
    await ensureSchema(env.DB);
    const session=await dbFirst(env.DB,'SELECT project_id FROM project_sessions WHERE session_id=?',[session_id]);
    if(!session)throw new Error('Session not found: '+session_id);
    const mutation_id=genId('mut');const timestamp=now();
    await dbRun(env.DB,'INSERT INTO state_mutations VALUES (?,?,?,?,?,?,?,?)',[mutation_id,session_id,session.project_id,resource,mutation_type,description,commit_sha||null,timestamp]);
    await dbRun(env.DB,'UPDATE project_sessions SET updated_at=? WHERE session_id=?',[timestamp,session_id]);
    return{ok:true,mutation_id,session_id,resource,mutation_type,created_at:timestamp};
  }

  if (name === 'get_project_handoff') {
    const{project_id,limit_events,include_payload_refs}=args;if(!project_id)throw new Error('project_id required');const limit=limit_events||20;
    await ensureSchema(env.DB);
    const activeSessionId=await kvGet(env.KV,'project:'+project_id+':active_session');
    const sessions=await dbAll(env.DB,'SELECT * FROM project_sessions WHERE project_id=? ORDER BY created_at DESC LIMIT 10',[project_id]);
    if(!sessions.length)return{ok:false,error:'No sessions found for project: '+project_id};
    const activeSession=sessions.find(function(s){return s.session_id===activeSessionId;})||sessions[0];
    const executions=await dbAll(env.DB,'SELECT * FROM tool_executions WHERE project_id=? ORDER BY created_at DESC LIMIT ?',[project_id,limit]);
    const mutations=await dbAll(env.DB,'SELECT * FROM state_mutations WHERE project_id=? ORDER BY created_at DESC LIMIT 40',[project_id]);
    if(!include_payload_refs)executions.forEach(function(e){delete e.payload_uri;});
    const report=buildHandoffReport(project_id,sessions,executions.reverse(),mutations.reverse(),activeSession);
    return{ok:true,project_id,active_session_id:activeSession.session_id,session_count:sessions.length,execution_count:executions.length,mutation_count:mutations.length,handoff_report:report,last_updated:await kvGet(env.KV,'project:'+project_id+':last_updated')};
  }

  if (name === 'search_history') {
    const{query,project_id,top_k}=args;if(!query)throw new Error('query required');
    await ensureSchema(env.DB);
    const vecMatches=await vectorSearch(env.VECTORIZE,env.AI,query,top_k||5);
    if(!vecMatches.length){
      const keyword='%'+query.split(' ').slice(0,3).join('%')+'%';
      const fallback=await dbAll(env.DB,'SELECT execution_id,tool_name,status,output_summary,created_at FROM tool_executions WHERE output_summary LIKE ?'+(project_id?' AND project_id=? ':'')+'ORDER BY created_at DESC LIMIT 10',project_id?[keyword,project_id]:[keyword]);
      return{ok:true,method:'keyword_fallback',results:fallback,query};
    }
    const ids=vecMatches.map(function(m){return m.id;});const placeholders=ids.map(function(){return '?';}).join(',');
    const rows=await dbAll(env.DB,'SELECT execution_id,tool_name,status,output_summary,input_summary,mutations,created_at,project_id FROM tool_executions WHERE execution_id IN ('+placeholders+')',ids);
    const rowMap={};rows.forEach(function(r){rowMap[r.execution_id]=r;});
    const results=vecMatches.map(function(m){return Object.assign({similarity:m.score},rowMap[m.id]||{execution_id:m.id});}).filter(function(r){return r.tool_name;});
    return{ok:true,method:'vector_search',results,query};
  }

  if (name === 'list_sessions') {
    const{project_id,limit}=args;await ensureSchema(env.DB);
    const sessions=await dbAll(env.DB,'SELECT session_id,project_id,description,context_tags,status,created_at,updated_at FROM project_sessions'+(project_id?' WHERE project_id=? ':' ')+'ORDER BY created_at DESC LIMIT ?',project_id?[project_id,limit||10]:[limit||10]);
    return{ok:true,sessions,count:sessions.length};
  }

  if (name === 'get_session_detail') {
    const{session_id}=args;if(!session_id)throw new Error('session_id required');
    await ensureSchema(env.DB);
    const session=await dbFirst(env.DB,'SELECT * FROM project_sessions WHERE session_id=?',[session_id]);if(!session)throw new Error('Session not found: '+session_id);
    const executions=await dbAll(env.DB,'SELECT * FROM tool_executions WHERE session_id=? ORDER BY created_at ASC',[session_id]);
    const mutations=await dbAll(env.DB,'SELECT * FROM state_mutations WHERE session_id=? ORDER BY created_at ASC',[session_id]);
    return{ok:true,session,executions,mutations,execution_count:executions.length,mutation_count:mutations.length};
  }

  if (name === 'resolve_payload') {
    const{payload_uri}=args;if(!payload_uri)throw new Error('payload_uri required');if(!payload_uri.startsWith('r2://'))throw new Error('Invalid payload_uri. Must start with r2://');
    const key=payload_uri.slice(5);const payload=await r2Get(env.R2,key);if(payload===null)throw new Error('Payload not found in R2: '+key);
    return{ok:true,payload_uri,payload};
  }

  throw new Error('Unknown tool: ' + name);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'afo-context-ledger-mcp', version: VERSION }, { headers: CORS });
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body; try { body = await request.json(); } catch { return errResp(null, -32700, 'Parse error'); }
    const { id, method, params } = body;
    if (method === 'initialize') return rpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'afo-context-ledger-mcp', version: VERSION } });
    if (method === 'notifications/initialized') return new Response(null, { status: 204, headers: CORS });
    if (method === 'ping') return rpc(id, {});
    if (method === 'tools/list') return rpc(id, { tools: TOOLS });
    if (method === 'tools/call') {
      try { return tool(id, await handle(params?.name, params?.arguments || {}, env, ctx)); }
      catch (e) { return errResp(id, -32603, 'Tool error: ' + e.message); }
    }
    return errResp(id, -32601, 'Method not found: ' + method);
  }
};
