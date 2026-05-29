// AFO Client Site Pipeline MCP
// Canonical editable source seed for v0.1.3-prep.
// Purpose: unblock safe patching without relying on Cloudflare source read.
// Worker: afo-client-site-pipeline-mcp
// Last known deployed behavior: v0.1.2 with project registry, artifacts, bundle export,
// publisher manifest, catalog payload, and static review.
// v0.1.3-prep target: preserve v0.1.2 behavior, add latest-only export and one-call profile runner.

const NAME = 'afo-client-site-pipeline-mcp';
const VERSION = '0.1.3-prep';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};
const J = {...CORS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'};
const json = (v, s = 200) => new Response(JSON.stringify(v, null, 2), {status: s, headers: J});
const html = v => new Response(v, {headers: {...CORS, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}});
const text = v => new Response(v, {headers: {...CORS, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store'}});
const now = () => new Date().toISOString();
const pack = x => { try { return JSON.stringify(x); } catch { return '{}'; } };
const unpack = (s, d = {}) => { try { return JSON.parse(s || ''); } catch { return d; } };
const clamp = (n, min, max, d) => Math.min(Math.max(Number(n) || d, min), max);
const hasDB = e => !!(e && e.DB && e.DB.prepare);
const slug = s => String(s || 'client').toLowerCase().replace(/https?:\/\//, '').replace(/www\./, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'client';

async function ensure(env) {
  if (!hasDB(env)) return {ok:false, error:'DB missing'};
  const stmts = [
    `CREATE TABLE IF NOT EXISTS client_site_projects (id TEXT PRIMARY KEY,tenant_id TEXT DEFAULT 'default',workspace_id TEXT DEFAULT 'default',client_name TEXT,business_name TEXT,source_url TEXT,target_subdomain TEXT,preview_url TEXT,status TEXT,stage TEXT,service_area TEXT,primary_services TEXT,cta_type TEXT,phone TEXT,email TEXT,brand_voice TEXT,notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS client_site_artifacts (id TEXT PRIMARY KEY,project_id TEXT,artifact_type TEXT,title TEXT,status TEXT,json_data TEXT,html_text TEXT,notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS client_site_qa_checks (id TEXT PRIMARY KEY,project_id TEXT,check_type TEXT,status TEXT,details TEXT,created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS client_site_steps (id TEXT PRIMARY KEY,project_id TEXT,step_name TEXT,workspace_tool TEXT,status TEXT,input_json TEXT,expected_result TEXT,result_ref TEXT,notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS client_site_exports (id TEXT PRIMARY KEY,project_id TEXT,export_type TEXT,status TEXT,json_data TEXT,text_data TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`
  ];
  for (const s of stmts) await env.DB.prepare(s).run();
  return {ok:true, steps:['db_binding_ok','tables_ready']};
}
async function one(env, sql, b = []) { return env.DB.prepare(sql).bind(...b).first(); }
async function all(env, sql, b = []) { return env.DB.prepare(sql).bind(...b).all(); }
async function getProject(env, id) { return one(env, 'SELECT * FROM client_site_projects WHERE id=?', [id]); }

async function addArtifact(env, pid, type, title, data = {}, markup = '', status = 'draft', notes = '') {
  const id = 'artifact_' + crypto.randomUUID();
  const ts = now();
  await env.DB.prepare('INSERT INTO client_site_artifacts (id,project_id,artifact_type,title,status,json_data,html_text,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, pid, type, title, status, pack(data), markup, notes, ts, ts).run();
  return {id, project_id:pid, artifact_type:type, title, status, data, has_markup:!!markup};
}

async function pipelineStatus(env) {
  await ensure(env);
  const p = await one(env, 'SELECT COUNT(*) c FROM client_site_projects');
  const a = await one(env, 'SELECT COUNT(*) c FROM client_site_artifacts');
  const q = await one(env, 'SELECT COUNT(*) c FROM client_site_qa_checks');
  const s = await one(env, 'SELECT COUNT(*) c FROM client_site_steps');
  const e = await one(env, 'SELECT COUNT(*) c FROM client_site_exports');
  return {ok:true,status:'ok',worker:NAME,version:VERSION,db:hasDB(env),counts:{projects:p?.c||0,artifacts:a?.c||0,qa_checks:q?.c||0,steps:s?.c||0,exports:e?.c||0},tools:TOOLS.map(t=>t.name)};
}

async function createClientSiteProject(env, a = {}) {
  await ensure(env);
  const id = a.id || 'clientsite_' + crypto.randomUUID();
  const ts = now();
  const sub = a.target_subdomain || slug(a.business_name || a.client_name || a.source_url);
  const preview = a.preview_url || 'https://' + sub + '.agentfeedoptimization.com/';
  await env.DB.prepare('INSERT INTO client_site_projects (id,tenant_id,workspace_id,client_name,business_name,source_url,target_subdomain,preview_url,status,stage,service_area,primary_services,cta_type,phone,email,brand_voice,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, a.tenant_id||'default', a.workspace_id||'default', a.client_name||'', a.business_name||'', a.source_url||'', sub, preview, 'created', 'intake', a.service_area||'', Array.isArray(a.primary_services)?a.primary_services.join(', '):(a.primary_services||''), a.cta_type||'contact', a.phone||'', a.email||'', a.brand_voice||'helpful, clear, local, trustworthy', a.notes||'', ts, ts).run();
  return {ok:true,project_id:id,status:'created',stage:'intake',target_subdomain:sub,preview_url:preview,worker:NAME,version:VERSION};
}

async function updateClientSiteProject(env, a = {}) {
  await ensure(env);
  const id = a.project_id || a.id;
  const p = await getProject(env, id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const fields = ['client_name','business_name','source_url','target_subdomain','preview_url','service_area','cta_type','phone','email','brand_voice','notes'];
  const vals = {};
  for (const f of fields) if (a[f] != null) vals[f] = a[f];
  if (a.primary_services != null) vals.primary_services = Array.isArray(a.primary_services) ? a.primary_services.join(', ') : a.primary_services;
  if (vals.target_subdomain && !vals.preview_url) vals.preview_url = 'https://' + vals.target_subdomain + '.agentfeedoptimization.com/';
  const keys = Object.keys(vals);
  if (!keys.length) return {ok:true,changed:false,project:p,worker:NAME,version:VERSION};
  const sets = keys.map(k => k + '=?').join(', ');
  await env.DB.prepare(`UPDATE client_site_projects SET ${sets}, stage=?, updated_at=? WHERE id=?`).bind(...keys.map(k=>vals[k]), 'updated', now(), id).run();
  return {ok:true,project_id:id,changed:true,updated:vals,worker:NAME,version:VERSION};
}

async function buildSiteIntakeProfile(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const services = String(p.primary_services||'').split(',').map(x=>x.trim()).filter(Boolean);
  const profile = {business_name:p.business_name,client_name:p.client_name,source_url:p.source_url,service_area:p.service_area,primary_services:services,cta:{type:p.cta_type,phone:p.phone,email:p.email},brand_voice:p.brand_voice,target_subdomain:p.target_subdomain,preview_url:p.preview_url,profile_status:a.profile_status||'manual_or_refined_v0_1_3_prep',workspace_tool_plan:['parse source page','shape article content','format page draft','assemble sample bundle','register in catalog']};
  const art = await addArtifact(env, p.id, 'intake_profile', 'Client Site Intake Profile', profile, '', 'ready', 'v0.1.3-prep structured profile');
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,updated_at=? WHERE id=?').bind('profile_ready', now(), p.id).run();
  return {ok:true,project_id:p.id,artifact:art,profile,worker:NAME,version:VERSION};
}
async function refineIntakeProfile(env, a = {}) { const upd = await updateClientSiteProject(env, a); if (!upd.ok) return upd; return buildSiteIntakeProfile(env, {project_id:a.project_id||a.id,profile_status:'refined_v0_1_3_prep'}); }

async function latestProfile(env, pid, p) {
  const row = (await all(env, "SELECT * FROM client_site_artifacts WHERE project_id=? AND artifact_type='intake_profile' ORDER BY created_at DESC LIMIT 1", [pid])).results?.[0];
  return row ? unpack(row.json_data) : {business_name:p.business_name,primary_services:String(p.primary_services||'').split(',').map(x=>x.trim()).filter(Boolean),service_area:p.service_area,cta:{type:p.cta_type,phone:p.phone,email:p.email}};
}
function sitePlanFrom(profile) {
  const services = profile.primary_services && profile.primary_services.length ? profile.primary_services : ['services','local expertise','common questions'];
  const topics = services.slice(0,6).map(s => ({title:`${profile.business_name||'Business'} ${s} Guide`, intent:'educate + convert', cta:'Request a free estimate'}));
  return {site_type:'simple_client_preview_site',homepage:{sections:['hero','trust_intro','services','media_block','content_cards','faq','contact_cta','footer'],primary_cta:profile.cta||{}},pages:[{slug:'/',type:'landing',title:`${profile.business_name||'Business'} | ${profile.service_area||'Local'} Services`},...topics.map(t=>({slug:'/articles/'+slug(t.title),type:'content_landing',title:t.title}))],content_topics:topics,media_slots:['hero visual','project gallery','optional video','content page visuals'],review_requirements:['homepage has CTA','at least 3 content cards','contact info present','mobile-friendly sections','metadata present','catalog record ready']};
}
async function generateSitePlan(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const profile = await latestProfile(env, p.id, p);
  const plan = sitePlanFrom(profile);
  const art = await addArtifact(env, p.id, 'site_plan', 'Client Site Plan', plan, '', 'ready', 'Generated v0.1.3-prep site plan');
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,updated_at=? WHERE id=?').bind('site_plan_ready', now(), p.id).run();
  return {ok:true,project_id:p.id,artifact:art,plan,worker:NAME,version:VERSION};
}
function landingMarkup(p, pl) {
  const services = String(p.primary_services||'').split(',').map(x=>x.trim()).filter(Boolean);
  const cards = (pl.content_topics||[]).map(t => `<article class="card"><h3>${t.title}</h3><p>A helpful guide for customers comparing options, planning budgets, and deciding when to request an estimate.</p><a href="/articles/${slug(t.title)}">Read guide</a></article>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.business_name}</title><style>body{font-family:system-ui;margin:0;color:#111827}.hero{padding:72px 24px;background:#f8fafc}.wrap{max-width:1040px;margin:auto}.btn{display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:white;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{border:1px solid #e5e7eb;border-radius:14px;padding:18px;background:white}.section{padding:40px 24px}.muted{color:#4b5563}</style></head><body><section class="hero"><div class="wrap"><p class="muted">${p.service_area||'Local'} services</p><h1>${p.business_name||'Local Business'}</h1><p>Professional, trustworthy help for ${services.slice(0,3).join(', ')||'your next project'}.</p><a class="btn" href="#contact">${p.cta_type||'Request a quote'}</a></div></section><section class="section"><div class="wrap"><h2>Services</h2><div class="grid">${services.map(s=>`<div class="card"><h3>${s}</h3><p>Clear planning, practical guidance, and a straightforward path to getting started.</p></div>`).join('')}</div></div></section><section class="section"><div class="wrap"><h2>Helpful Guides</h2><div class="grid">${cards}</div></div></section><section id="contact" class="section"><div class="wrap"><h2>Request an Estimate</h2><p>Phone: ${p.phone||'Add phone'}<br>Email: ${p.email||'Add email'}</p></div></section></body></html>`;
}
async function generateLandingPageDraft(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const profile = await latestProfile(env, p.id, p);
  const plan = sitePlanFrom(profile);
  const markup = landingMarkup(p, plan);
  const art = await addArtifact(env, p.id, 'landing_page_draft', 'Landing Page Draft', {title:`${p.business_name} landing page`,sections:plan.homepage.sections,preview_url:p.preview_url}, markup, 'draft', 'Page draft generated v0.1.3-prep');
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,updated_at=? WHERE id=?').bind('landing_draft_ready', now(), p.id).run();
  return {ok:true,project_id:p.id,artifact:art,markup_preview:markup.slice(0,1200),worker:NAME,version:VERSION};
}
async function createContentPageDrafts(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const profile = await latestProfile(env, p.id, p);
  const pl = sitePlanFrom(profile);
  const count = clamp(a.count, 1, 10, 3);
  const drafts = [];
  for (const topic of (pl.content_topics||[]).slice(0,count)) {
    const markup = `<article><h1>${topic.title}</h1><p>This guide helps customers understand options, planning steps, and what to ask before starting a project with ${p.business_name||'a service provider'}.</p><h2>What to know</h2><p>Use this section for practical local advice, common questions, timelines, materials, budget factors, and project planning tips.</p><h2>Next step</h2><p>${topic.cta}</p></article>`;
    drafts.push(await addArtifact(env, p.id, 'content_page_draft', topic.title, {topic, slug:slug(topic.title), workspace_step:'content_shape'}, markup, 'draft', 'Content page draft v0.1.3-prep'));
  }
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,updated_at=? WHERE id=?').bind('content_drafts_ready', now(), p.id).run();
  return {ok:true,project_id:p.id,count:drafts.length,artifacts:drafts,worker:NAME,version:VERSION};
}
async function buildSampleSiteBundle(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const arts = (await all(env, 'SELECT id,artifact_type,title,status,created_at FROM client_site_artifacts WHERE project_id=? ORDER BY created_at', [p.id])).results||[];
  const data = {project_id:p.id,business_name:p.business_name,preview_url:p.preview_url,target_subdomain:p.target_subdomain,artifacts:arts,manual_next_steps:['Review source page details','Shape content pages','Assemble sample bundle','Create catalog record'],ready_for_review:arts.some(x=>x.artifact_type==='landing_page_draft')&&arts.some(x=>x.artifact_type==='content_page_draft')};
  const art = await addArtifact(env, p.id, 'sample_site_bundle', 'Sample Site Bundle', data, '', 'ready', 'Bundle manifest v0.1.3-prep');
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,updated_at=? WHERE id=?').bind('sample_bundled', now(), p.id).run();
  return {ok:true,project_id:p.id,artifact:art,bundle:data,worker:NAME,version:VERSION};
}
async function runClientSiteReview(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const arts = (await all(env, 'SELECT * FROM client_site_artifacts WHERE project_id=?', [p.id])).results||[];
  const checks = [['has_intake_profile',arts.some(x=>x.artifact_type==='intake_profile')],['has_site_plan',arts.some(x=>x.artifact_type==='site_plan')],['has_landing_page',arts.some(x=>x.artifact_type==='landing_page_draft')],['has_content_pages',arts.some(x=>x.artifact_type==='content_page_draft')],['has_contact_path',!!(p.phone||p.email||p.cta_type)],['has_preview_url',!!p.preview_url],['has_sample_bundle',arts.some(x=>x.artifact_type==='sample_site_bundle')]];
  const passed = checks.filter(x=>x[1]).length, failed = checks.length - passed, status = failed ? 'needs_review' : 'passed', id = 'qa_' + crypto.randomUUID();
  await env.DB.prepare('INSERT INTO client_site_qa_checks (id,project_id,check_type,status,details,created_at) VALUES (?,?,?,?,?,?)').bind(id,p.id,'v0.1.3_prep_static_review',status,pack({checks:checks.map(x=>({name:x[0],passed:x[1]})),passed,failed}),now()).run();
  await env.DB.prepare('UPDATE client_site_projects SET stage=?,status=?,updated_at=? WHERE id=?').bind('review_checked',status,now(),p.id).run();
  return {ok:true,project_id:p.id,review_id:id,status,passed,failed,checks:checks.map(x=>({name:x[0],passed:x[1]})),worker:NAME,version:VERSION};
}

async function listClientSiteProjects(env, a = {}) {
  await ensure(env);
  const q = a.q || '';
  const r = await all(env, 'SELECT * FROM client_site_projects WHERE business_name LIKE ? OR client_name LIKE ? OR source_url LIKE ? ORDER BY created_at DESC LIMIT ?', ['%'+q+'%','%'+q+'%','%'+q+'%',clamp(a.limit,1,200,50)]);
  return {ok:true,count:(r.results||[]).length,items:r.results||[],worker:NAME,version:VERSION};
}
async function clientSiteProjectStatus(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const artifacts = (await all(env, 'SELECT id,artifact_type,title,status,created_at FROM client_site_artifacts WHERE project_id=? ORDER BY created_at', [p.id])).results||[];
  const qa = (await all(env, 'SELECT * FROM client_site_qa_checks WHERE project_id=? ORDER BY created_at DESC LIMIT 10', [p.id])).results||[];
  const steps = (await all(env, 'SELECT * FROM client_site_steps WHERE project_id=? ORDER BY created_at DESC LIMIT 20', [p.id])).results||[];
  return {ok:true,project:p,artifacts,qa,steps,worker:NAME,version:VERSION};
}
async function getSiteArtifact(env, a = {}) {
  await ensure(env);
  const row = await one(env, 'SELECT * FROM client_site_artifacts WHERE id=?', [a.artifact_id || a.id]);
  if (!row) return {ok:false,error:'artifact not found',worker:NAME,version:VERSION};
  return {ok:true,artifact:{id:row.id,project_id:row.project_id,artifact_type:row.artifact_type,title:row.title,status:row.status,json_data:unpack(row.json_data,{}),markup:row.html_text||'',notes:row.notes,created_at:row.created_at,updated_at:row.updated_at},worker:NAME,version:VERSION};
}
async function listSiteArtifacts(env, a = {}) {
  await ensure(env);
  const pid = a.project_id || a.id, type = a.artifact_type || '%';
  const r = await all(env, 'SELECT id,project_id,artifact_type,title,status,notes,created_at,updated_at,LENGTH(html_text) markup_bytes FROM client_site_artifacts WHERE project_id=? AND artifact_type LIKE ? ORDER BY created_at DESC LIMIT ?', [pid,type,clamp(a.limit,1,200,50)]);
  return {ok:true,count:(r.results||[]).length,items:r.results||[],worker:NAME,version:VERSION};
}
function latestRows(rows) {
  let landing = null;
  const contentBySlug = new Map();
  for (const r of rows) {
    if (r.artifact_type === 'landing_page_draft') landing = r;
    if (r.artifact_type === 'content_page_draft') {
      const data = unpack(r.json_data, {});
      const s = data.slug || slug(r.title);
      contentBySlug.set(s, r);
    }
  }
  return [landing, ...contentBySlug.values()].filter(Boolean);
}
async function exportSiteBundle(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const rowsAll = (await all(env, 'SELECT * FROM client_site_artifacts WHERE project_id=? ORDER BY created_at', [p.id])).results||[];
  const rows = a.latest_only === false ? rowsAll.filter(x=>['landing_page_draft','content_page_draft'].includes(x.artifact_type)) : latestRows(rowsAll);
  const pages = rows.map(r => ({artifact_id:r.id,type:r.artifact_type,title:r.title,slug:r.artifact_type==='landing_page_draft'?'':(unpack(r.json_data,{}).slug||slug(r.title)),markup:r.html_text||'',data:unpack(r.json_data,{})}));
  const bundle = {project:{id:p.id,business_name:p.business_name,source_url:p.source_url,preview_url:p.preview_url,target_subdomain:p.target_subdomain,service_area:p.service_area,primary_services:String(p.primary_services||'').split(',').map(x=>x.trim()).filter(Boolean),cta_type:p.cta_type,phone:p.phone,email:p.email},pages,exported_at:now(),format:'client_site_sample_bundle_v0_1_3_prep',latest_only:a.latest_only !== false};
  const id = 'export_' + crypto.randomUUID();
  await env.DB.prepare('INSERT INTO client_site_exports (id,project_id,export_type,status,json_data,text_data,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,p.id,'sample_bundle_json','ready',pack({page_count:pages.length,format:bundle.format,latest_only:bundle.latest_only}),JSON.stringify(bundle,null,2),now(),now()).run();
  return {ok:true,export_id:id,project_id:p.id,page_count:pages.length,bundle,worker:NAME,version:VERSION};
}
async function createPublisherManifest(env, a = {}) {
  const ex = await exportSiteBundle(env, {...a, latest_only:a.latest_only !== false});
  if (!ex.ok) return ex;
  const manifest = {project_id:ex.project_id,export_id:ex.export_id,site_name:ex.bundle.project.business_name,target_subdomain:ex.bundle.project.target_subdomain,preview_url:ex.bundle.project.preview_url,pages:ex.bundle.pages.map(p=>({title:p.title,type:p.type,slug:p.type==='landing_page_draft'?'/':'/articles/'+p.slug,artifact_id:p.artifact_id,markup_bytes:p.markup.length})),recommended_next_step:'Use existing formatter/publisher workspace tools with this export bundle.',created_at:now()};
  return {ok:true,project_id:ex.project_id,export_id:ex.export_id,manifest,worker:NAME,version:VERSION};
}
async function createCatalogPayload(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const payload = {id:'client-'+p.target_subdomain,title:p.business_name+' Sample Site',url:p.preview_url,product:'Client Sample Sites',page_type:'landing',visibility:'private_preview',status:'draft',white_label_ready:1,paywall_tier:'none',target_audience:'Prospective client / business owner',conversion_hypothesis:'Show a live sample site with landing page and helpful project guides.',tags:'client-site,sample,landing-page,content-pages',notes:'Generated by Client Site Pipeline '+VERSION};
  return {ok:true,project_id:p.id,catalog_payload:payload,worker:NAME,version:VERSION};
}
async function recordPipelineStep(env, a = {}) {
  await ensure(env);
  const p = await getProject(env, a.project_id || a.id);
  if (!p) return {ok:false,error:'project not found',worker:NAME,version:VERSION};
  const id = 'step_' + crypto.randomUUID(), ts = now();
  await env.DB.prepare('INSERT INTO client_site_steps (id,project_id,step_name,workspace_tool,status,input_json,expected_result,result_ref,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,p.id,a.step_name||'workspace_step',a.workspace_tool||'',a.status||'planned',pack(a.input||{}),a.expected_result||'',a.result_ref||'',a.notes||'',ts,ts).run();
  return {ok:true,step_id:id,project_id:p.id,status:a.status||'planned',worker:NAME,version:VERSION};
}
async function createSampleSiteFromProfile(env, a = {}) {
  const project = await createClientSiteProject(env, a);
  if (!project.ok) return project;
  const project_id = project.project_id;
  await buildSiteIntakeProfile(env, {project_id});
  await generateSitePlan(env, {project_id});
  await generateLandingPageDraft(env, {project_id});
  await createContentPageDrafts(env, {project_id, count:a.article_count||a.content_count||3});
  await buildSampleSiteBundle(env, {project_id});
  const review = await runClientSiteReview(env, {project_id});
  const exportResult = await exportSiteBundle(env, {project_id, latest_only:true});
  const manifest = await createPublisherManifest(env, {project_id, latest_only:true});
  const catalog = await createCatalogPayload(env, {project_id});
  return {ok:true,project_id,preview_url:project.preview_url,review_status:review.status,export_id:exportResult.export_id,page_count:exportResult.page_count,manifest:manifest.manifest,catalog_payload:catalog.catalog_payload,worker:NAME,version:VERSION};
}

const Sgen={type:'object',properties:{ok:{type:'boolean'},worker:{type:'string'},version:{type:'string'}},required:['ok','worker','version']};
const Slist={type:'object',properties:{ok:{type:'boolean'},count:{type:'integer'},items:{type:'array',items:{type:'object'}},worker:{type:'string'},version:{type:'string'}},required:['ok','worker','version']};
function tool(name,description,read,props={},output=Sgen){return{name,description,annotations:{readOnlyHint:!!read,destructiveHint:false,openWorldHint:false,idempotentHint:!!read},inputSchema:{type:'object',properties:props,additionalProperties:false},outputSchema:output}}
const projectProps={project_id:{type:'string'},id:{type:'string'}};
const projectCreateProps={client_name:{type:'string'},business_name:{type:'string'},source_url:{type:'string'},target_subdomain:{type:'string'},preview_url:{type:'string'},service_area:{type:'string'},primary_services:{type:'array',items:{type:'string'}},cta_type:{type:'string'},phone:{type:'string'},email:{type:'string'},brand_voice:{type:'string'},notes:{type:'string'}};
const TOOLS=[
  tool('pipeline_status','Read-only status for Client Site Pipeline MCP.',true,{}),
  tool('create_client_site_project','Internal D1 write: creates a client site project record. No network calls.',false,projectCreateProps),
  tool('update_client_site_project','Internal D1 write: updates a client site project record. No network calls.',false,{...projectProps,...projectCreateProps}),
  tool('refine_intake_profile','Internal D1 write: updates details and creates refined intake profile. No network calls.',false,{...projectProps,...projectCreateProps}),
  tool('build_site_intake_profile','Internal D1 write: builds profile from stored intake. No network calls.',false,projectProps),
  tool('generate_site_plan','Internal D1 write: creates landing/content page plan. No network calls.',false,projectProps),
  tool('generate_landing_page_draft','Internal D1 write: creates first page draft artifact. No network calls.',false,projectProps),
  tool('create_content_page_drafts','Internal D1 write: creates content page draft artifacts. No network calls.',false,{...projectProps,count:{type:'integer',minimum:1,maximum:10}}),
  tool('record_pipeline_step','Internal D1 write: records a planned workspace step. Does not run another tool.',false,{...projectProps,step_name:{type:'string'},workspace_tool:{type:'string'},status:{type:'string'},input:{type:'object'},expected_result:{type:'string'},result_ref:{type:'string'},notes:{type:'string'}}),
  tool('build_sample_site_bundle','Internal D1 write: creates sample site bundle record. No network calls.',false,projectProps),
  tool('run_client_site_review','Internal D1 write: runs static review checks on stored artifacts. No network calls.',false,projectProps),
  tool('list_client_site_projects','Read-only list/search client site projects.',true,{q:{type:'string'},limit:{type:'integer',minimum:1,maximum:200}},Slist),
  tool('client_site_project_status','Read-only project details, artifacts, review checks, and pipeline steps.',true,projectProps),
  tool('list_site_artifacts','Read-only list artifacts for a project.',true,{...projectProps,artifact_type:{type:'string'},limit:{type:'integer',minimum:1,maximum:200}},Slist),
  tool('get_site_artifact','Read-only retrieve one stored artifact including markup.',true,{artifact_id:{type:'string'},id:{type:'string'}}),
  tool('export_site_bundle','Internal D1 write: creates an export record. Defaults to latest-only pages. No network calls.',false,{...projectProps,latest_only:{type:'boolean'}}),
  tool('create_publisher_manifest','Internal D1 write: creates a manifest from latest stored pages. No network calls.',false,{...projectProps,latest_only:{type:'boolean'}}),
  tool('create_catalog_payload','Read-only creates suggested catalog record payload. Does not modify Catalog.',true,projectProps),
  tool('create_sample_site_from_profile','Internal D1 write: one-call structured profile to reviewed bundle/export/manifest/catalog payload. No network calls.',false,{...projectCreateProps,article_count:{type:'integer',minimum:1,maximum:10},content_count:{type:'integer',minimum:1,maximum:10}})
];
async function call(n,env,a){const m={pipeline_status:pipelineStatus,create_client_site_project:createClientSiteProject,update_client_site_project:updateClientSiteProject,refine_intake_profile:refineIntakeProfile,build_site_intake_profile:buildSiteIntakeProfile,generate_site_plan:generateSitePlan,generate_landing_page_draft:generateLandingPageDraft,create_content_page_drafts:createContentPageDrafts,record_pipeline_step:recordPipelineStep,build_sample_site_bundle:buildSampleSiteBundle,run_client_site_review:runClientSiteReview,list_client_site_projects:listClientSiteProjects,client_site_project_status:clientSiteProjectStatus,list_site_artifacts:listSiteArtifacts,get_site_artifact:getSiteArtifact,export_site_bundle:exportSiteBundle,create_publisher_manifest:createPublisherManifest,create_catalog_payload:createCatalogPayload,create_sample_site_from_profile:createSampleSiteFromProfile};return m[n]?m[n](env,a):{ok:false,error:'unknown tool',worker:NAME,version:VERSION}}
function out(id,v){return json({jsonrpc:'2.0',id,result:{structuredContent:v,content:[{type:'text',text:JSON.stringify(v,null,2)}]}})}
async function mcp(req,env){let b;try{b=await req.json()}catch{return json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid JSON'}})}const id=b.id??null,m=b.method,p=b.params||{};if(m==='initialize')return json({jsonrpc:'2.0',id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:NAME,version:VERSION}}});if(m==='notifications/initialized')return json({jsonrpc:'2.0',id,result:{}});if(m==='tools/list')return json({jsonrpc:'2.0',id,result:{tools:TOOLS}});if(m==='tools/call')return out(id,await call(p.name,env,p.arguments||{}));return json({jsonrpc:'2.0',id,error:{code:-32601,message:'Unknown method'}})}
export default{async fetch(req,env){const p=new URL(req.url).pathname.replace(/\/+$/,'')||'/';if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});try{if(req.method==='POST'&&p==='/mcp')return mcp(req,env);if(req.method==='GET'&&p==='/health')return json({status:'ok',worker:NAME,version:VERSION,db:hasDB(env),boot:await ensure(env)});if(req.method==='GET'&&p==='/capabilities.json')return json({ok:true,worker:NAME,version:VERSION,tools:TOOLS.map(t=>t.name),features:{latest_only_export:true,profile_to_preview:true,artifact_retrieval:true,bundle_export:true,publisher_manifest:true,catalog_payload:true,network_calls:false}});if(req.method==='GET'&&p==='/llms.txt')return text('# AFO Client Site Pipeline MCP v0.1.3-prep\nCanonical repo source seed. Adds latest-only export and create_sample_site_from_profile. MCP: /mcp');if(req.method==='GET'&&p==='/')return html(`<h1>AFO Client Site Pipeline MCP v${VERSION}</h1><p>Canonical repo source seed for safe patching.</p>`);return json({error:'not_found',worker:NAME,version:VERSION},404)}catch(e){return json({ok:false,error:e.message||String(e),worker:NAME,version:VERSION,path:p},500)}}};
