// contractor-v003-2-afo — CCS Services Group — v0.3.0
// Phase 3: lead_section tracking, status workflows, CSV export, budget/timeline, callback widget
// JS assembled via string arrays — never template literals (see handoff doc)

const VERSION = '0.3.0';
const WORKER = 'contractor-v003-2-afo';
const COMPANY = 'CCS Services Group';
const PHONE = '(818) 624-7212';
const PHONE_URL = 'tel:+18186247212';
const LICENSE = 'CSLB #890991';
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const ADMIN_PASS = 'demo';
const R2_PREFIX = 'contractor-v003-2/';

function uid() { return 'v2-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6); }
function now() { return new Date().toISOString(); }
function j(data, status=200) {
  return new Response(JSON.stringify(data, null, 2), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
function h(html) { return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } }); }
async function body(req) { try { return await req.json(); } catch { return {}; } }
async function dbRun(env, sql, p=[]) { return env.V003_2_DB.prepare(sql).bind(...p).run(); }
async function dbAll(env, sql, p=[]) { const r = await env.V003_2_DB.prepare(sql).bind(...p).all(); return r.results || []; }
async function dbFirst(env, sql, p=[]) { return env.V003_2_DB.prepare(sql).bind(...p).first(); }

async function embed(env, text) {
  const r = await env.AI.run(EMBED_MODEL, { text: [text.slice(0, 2000)] });
  return r.data[0];
}
async function vecSearch(env, query, topK=5) {
  const vec = await embed(env, query);
  const r = await env.V003_2_VECTORIZE.query(vec, { topK, returnMetadata: 'all' });
  return r.matches || [];
}

// ── CSV helpers ──────────────────────────────────────────────────────────────
function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
function csvRes(filename, text) {
  return new Response(text, { headers: {
    'Content-Type': 'text/csv;charset=utf-8',
    'Content-Disposition': 'attachment; filename="' + filename + '"'
  }});
}
function validLeadStatus(s) { return ['new','contacted','quoted','won','lost'].includes(String(s||'').toLowerCase()); }
function validCallbackStatus(s) { return ['pending','called','no_answer','scheduled'].includes(String(s||'').toLowerCase()); }

// ── Route handlers ───────────────────────────────────────────────────────────
async function handleStatus(env) {
  let db=false, vec=false, r2=false, leads=0, articles=0, callbacks=0;
  try { const r = await dbFirst(env,'SELECT COUNT(*) as c FROM leads'); leads=r?.c||0; db=true; } catch{}
  try { const r = await dbFirst(env,'SELECT COUNT(*) as c FROM articles'); articles=r?.c||0; } catch{}
  try { const r = await dbFirst(env,'SELECT COUNT(*) as c FROM callbacks'); callbacks=r?.c||0; } catch{}
  try { const v = await embed(env,'test'); vec=v.length===768; } catch{}
  try { await env.V003_2_R2.list({prefix:R2_PREFIX,limit:1}); r2=true; } catch{}
  return j({ ok:true, worker:WORKER, version:VERSION, company:COMPANY, db, vectorize:vec, r2, ai:true,
    embedding_model:EMBED_MODEL, leads, articles, callbacks, timestamp:now() });
}

async function handleLeads(req, env) {
  const b = await body(req);
  const { name, email, phone, service, project_type, message, lead_section, section, budget_range, budget, timeline, source='web' } = b;
  if (!name) return j({ ok:false, error:'name required' }, 400);
  const id = uid();
  const svc = service || project_type || '';
  const srcSection = lead_section || section || 'lead_form';
  const budgetValue = budget_range || budget || '';
  await dbRun(env,
    'INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [name, email||'', phone||'', svc, message||'', source, now(), srcSection, 'new', budgetValue, timeline||'']
  );
  return j({ ok:true, lead_id:id, message:'Thank you! CCS will follow up within one business day. You can also call '+PHONE+' directly.' });
}

async function handleCallback(req, env) {
  const b = await body(req);
  const { name, phone, preferred_time, preferred_date, project_type, notes, lead_section, section, source='web' } = b;
  if (!name || !phone) return j({ ok:false, error:'name and phone required' }, 400);
  const id = uid();
  const notesStr = [preferred_time, preferred_date, notes].filter(Boolean).join(' | ');
  const srcSection = lead_section || section || 'callback_widget';
  await dbRun(env,
    'INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, phone, preferred_time||'', project_type||'', notesStr, source, now(), srcSection, 'pending']
  ).catch(async () => {
    await dbRun(env, 'INSERT INTO callbacks (name,phone,created_at) VALUES (?,?,?)', [name, phone, now()]);
  });
  const timeMsg = preferred_time ? 'in the '+preferred_time : 'soon';
  return j({ ok:true, callback_id:id, message:'Got it! We will call you '+timeMsg+'. You can also reach us at '+PHONE+'.' });
}

async function handleChat(req, env) {
  const b = await body(req);
  const message = (b.message||'').trim();
  const state = b.state || 'init';
  const section = b.section || '';

  if (!message && state === 'init') {
    return j({ ok:true, state:'init',
      answer:'Hi! Welcome to CCS Services Group. Are you looking for a free estimate, or do you have a question about our services?',
      suggested_actions:[
        { type:'state', label:'Free Estimate', value:'estimate_start' },
        { type:'state', label:'Ask a Question', value:'qa' }
      ]
    });
  }
  if (state==='init' && (message.toLowerCase().includes('estimate')||message==='estimate_start')) {
    return j({ ok:true, state:'estimate_project',
      answer:'Great! What kind of project are you thinking about?',
      suggested_actions:[
        {type:'quick',label:'Kitchen'},{type:'quick',label:'Bathroom'},
        {type:'quick',label:'ADU'},{type:'quick',label:'Addition'},
        {type:'quick',label:'New Construction'},{type:'quick',label:'Other'}
      ]
    });
  }
  if (state==='estimate_project') {
    return j({ ok:true, state:'estimate_location',
      answer:'Got it. Where is the property located?',
      suggested_actions:[
        {type:'quick',label:'Silver Lake'},{type:'quick',label:'Burbank'},
        {type:'quick',label:'Glendale'},{type:'quick',label:'Pasadena'}
      ]
    });
  }
  if (state==='estimate_location') {
    return j({ ok:true, state:'estimate_contact',
      answer:'Perfect. How would you like to connect for your free estimate?',
      suggested_actions:[
        {type:'call',label:'Call us now — '+PHONE,url:PHONE_URL},
        {type:'state',label:'Request a Callback',value:'callback_start'},
        {type:'upload',label:'Upload photos — we will call you'}
      ]
    });
  }
  if (state==='estimate_contact'||message==='callback_start') {
    return j({ ok:true, state:'callback_name', answer:'Happy to arrange a callback. What is your name?' });
  }
  if (state==='callback_name') {
    return j({ ok:true, state:'callback_phone', answer:'Got it, '+message+'. What is the best number to reach you?' });
  }
  if (state==='callback_phone') {
    return j({ ok:true, state:'callback_time',
      answer:'And any preference for time of day?',
      suggested_actions:[
        {type:'quick',label:'Morning'},{type:'quick',label:'Afternoon'},
        {type:'quick',label:'Evening'},{type:'quick',label:'Anytime'}
      ]
    });
  }
  if (state==='callback_time') {
    try {
      await dbRun(env, 'INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)',
        ['Chat lead','',message,'','Preferred: '+message,'chat_estimate',now(),section||'chat_estimate','pending']);
    } catch(e){}
    return j({ ok:true, state:'done',
      answer:'Perfect — we will call you '+message.toLowerCase()+'. You can also reach us anytime at '+PHONE+'.',
      suggested_actions:[{type:'call',label:'Call '+PHONE+' now',url:PHONE_URL}]
    });
  }
  if (state==='estimate_upload') {
    try {
      await dbRun(env, 'INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        ['Chat lead','','','via chat',message,'chat_estimate',now(),section||'chat_estimate','new','','']);
    } catch(e){}
    return j({ ok:true, state:'done',
      answer:'Thank you! We have your info and will follow up within one business day. Call us anytime at '+PHONE+'.',
      suggested_actions:[{type:'call',label:'Call '+PHONE,url:PHONE_URL}]
    });
  }

  // QA / RAG
  let matches = [];
  try { matches = await vecSearch(env, message, 5); } catch(e){}
  const context = matches.map((m,i)=>'['+(i+1)+'] '+(m.metadata?.title||m.id)+': '+(m.metadata?.summary||'')).join('\n');
  let answer = '';
  try {
    const sys = 'You are a helpful assistant for CCS Services Group, a licensed general contractor in Los Angeles ('+LICENSE+', phone '+PHONE+'). Answer using the context below. Be concise and warm. Always mention the free estimate offer.\n\nContext:\n'+context;
    const r = await env.AI.run(CHAT_MODEL, {
      messages:[{role:'system',content:sys},{role:'user',content:message}], max_tokens:400
    });
    answer = r.response || r.choices?.[0]?.message?.content || '';
  } catch(e) {
    answer = matches.length > 0
      ? (matches[0].metadata?.summary||'')+' Call us at '+PHONE+' for details.'
      : 'CCS Services Group handles kitchens, bathrooms, ADUs, additions, and new construction in LA. Call '+PHONE+' for a free estimate.';
  }
  answer += '\n\nWant a free estimate? Call '+PHONE+' or let us know your project below.';
  try { await dbRun(env,'INSERT INTO chats (message,response,created_at) VALUES (?,?,?)',[message,answer,now()]); } catch(e){}
  return j({ ok:true, state:'qa', answer,
    matches: matches.slice(0,5).map(m=>({ title:m.metadata?.title||m.id, slug:m.metadata?.slug||'', summary:m.metadata?.summary||'', score:m.score })),
    suggested_actions:[
      {type:'call',label:'Call '+PHONE,url:PHONE_URL},
      {type:'state',label:'Get Free Estimate',value:'estimate_start'}
    ]
  });
}

async function handleArticlesList(env) {
  const rows = await dbAll(env,'SELECT slug,title,summary,created_at FROM articles ORDER BY id DESC LIMIT 50');
  return j({ ok:true, articles:rows });
}
async function handleArticle(slug, env) {
  const row = await dbFirst(env,'SELECT * FROM articles WHERE slug=?',[slug]);
  if (!row) return j({ ok:false, error:'not found' }, 404);
  return j({ ok:true, article:row });
}
async function handleSeed(env) {
  const rows = await dbAll(env,'SELECT * FROM articles');
  let embedded = 0;
  for (const row of rows) {
    try {
      const text = [row.title, row.summary, row.body].filter(Boolean).join(' ');
      const vec = await embed(env, text);
      await env.V003_2_VECTORIZE.upsert([{ id:'article-'+row.slug, values:vec, metadata:{ title:row.title, summary:row.summary||'', slug:row.slug } }]);
      embedded++;
    } catch(e){}
  }
  return j({ ok:true, embedded, total:rows.length });
}
async function handleUpload(req, env) {
  try {
    const fd = await req.formData();
    const file = fd.get('file');
    if (!file) return j({ ok:false, error:'no file' }, 400);
    const ext = (file.name.split('.').pop()||'').toLowerCase();
    const allowed = ['jpg','jpeg','png','gif','webp','mp4','mov','heic','pdf'];
    if (!allowed.includes(ext)) return j({ ok:false, error:'file type not allowed' }, 400);
    const key = R2_PREFIX+'uploads/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const buf = await file.arrayBuffer();
    await env.V003_2_R2.put(key, buf, { httpMetadata:{ contentType:file.type } });
    return j({ ok:true, r2_key:key });
  } catch(e) { return j({ ok:false, error:e.message }, 500); }
}

// ── Admin API handlers ────────────────────────────────────────────────────────
async function handleAdminLeads(req, env) {
  if (req.method === 'PATCH') {
    const b = await body(req);
    const status = String(b.status||'').toLowerCase();
    if (!validLeadStatus(status)) return j({ ok:false, error:'invalid status. Valid: new,contacted,quoted,won,lost' }, 400);
    if (!b.id) return j({ ok:false, error:'id required' }, 400);
    await dbRun(env, 'UPDATE leads SET status=? WHERE id=?', [status, b.id]);
    return j({ ok:true, id:b.id, status });
  }
  const url = new URL(req.url);
  if (url.searchParams.get('format') === 'csv') {
    const rows = await dbAll(env, 'SELECT id,name,email,phone,service,message,source,lead_section,status,budget_range,timeline,created_at FROM leads ORDER BY id DESC LIMIT 1000');
    const headers = ['id','name','email','phone','service','message','source','lead_section','status','budget_range','timeline','created_at'];
    return csvRes('leads.csv', [headers.join(','), ...rows.map(r => headers.map(hk => csvCell(r[hk])).join(','))].join('\n'));
  }
  const leads = await dbAll(env,'SELECT * FROM leads ORDER BY id DESC LIMIT 100');
  return j({ ok:true, leads });
}

async function handleAdminLeadById(req, env, id) {
  if (req.method === 'PATCH') {
    const b = await body(req);
    const status = String(b.status||'').toLowerCase();
    if (!validLeadStatus(status)) return j({ ok:false, error:'invalid status. Valid: new,contacted,quoted,won,lost' }, 400);
    await dbRun(env, 'UPDATE leads SET status=? WHERE id=?', [status, id]);
    return j({ ok:true, id, status });
  }
  return j({ ok:false, error:'method not allowed' }, 405);
}

async function handleAdminCallbacks(req, env) {
  if (req.method === 'PATCH') {
    const b = await body(req);
    const status = String(b.status||'').toLowerCase();
    if (!validCallbackStatus(status)) return j({ ok:false, error:'invalid status. Valid: pending,called,no_answer,scheduled' }, 400);
    if (!b.id) return j({ ok:false, error:'id required' }, 400);
    await dbRun(env, 'UPDATE callbacks SET status=? WHERE id=?', [status, b.id]);
    return j({ ok:true, id:b.id, status });
  }
  const url = new URL(req.url);
  if (url.searchParams.get('format') === 'csv') {
    const rows = await dbAll(env, 'SELECT id,name,phone,preferred_time,service,message,source,lead_section,status,created_at FROM callbacks ORDER BY id DESC LIMIT 1000');
    const headers = ['id','name','phone','preferred_time','service','message','source','lead_section','status','created_at'];
    return csvRes('callbacks.csv', [headers.join(','), ...rows.map(r => headers.map(hk => csvCell(r[hk])).join(','))].join('\n'));
  }
  const callbacks = await dbAll(env,'SELECT * FROM callbacks ORDER BY id DESC LIMIT 100');
  return j({ ok:true, callbacks });
}

async function handleAdminCallbackById(req, env, id) {
  if (req.method === 'PATCH') {
    const b = await body(req);
    const status = String(b.status||'').toLowerCase();
    if (!validCallbackStatus(status)) return j({ ok:false, error:'invalid status. Valid: pending,called,no_answer,scheduled' }, 400);
    await dbRun(env, 'UPDATE callbacks SET status=? WHERE id=?', [status, id]);
    return j({ ok:true, id, status });
  }
  return j({ ok:false, error:'method not allowed' }, 405);
}

// ── Public JS (string array — never template literals) ───────────────────────
function buildPublicJS() {
  return [
    'var chatState="init";',
    'var leadSection="";',
    'function openChat(initAction,section){',
    '  leadSection=section||"";',
    '  document.getElementById("chatDrawer").classList.add("open");',
    '  document.getElementById("chatFab").style.display="none";',
    '  document.body.style.overflow="hidden";',
    '  var msgs=document.getElementById("chatMsgs");',
    '  if(!msgs.children.length){sendChatMsg(initAction==="estimate_start"?"estimate_start":"",true);}',
    '  else if(initAction==="estimate_start"&&chatState==="init"){sendChatMsg("estimate_start",true);}',
    '}',
    'function closeChat(){',
    '  document.getElementById("chatDrawer").classList.remove("open");',
    '  document.getElementById("chatFab").style.display="flex";',
    '  document.body.style.overflow="";',
    '}',
    'function addBotMsg(text,actions){',
    '  var msgs=document.getElementById("chatMsgs");',
    '  var div=document.createElement("div");',
    '  div.className="cmsg bot";',
    '  var safe=text;',
    '  var boldRe=new RegExp("\\\\*\\\\*(.+?)\\\\*\\\\*","g");',
    '  safe=safe.replace(boldRe,"<strong>$1</strong>");',
    '  safe=safe.replace(/\\n/g,"<br>");',
    '  var html="<div class=\'bubble\'>"+safe+"</div>";',
    '  if(actions&&actions.length){',
    '    html+="<div class=\'actions\'>";',
    '    actions.forEach(function(a){',
    '      if(a.type==="call"){html+="<a class=\'chip call\' href=\'"+a.url+"\'>"+a.label+"</a>";}',
    '      else if(a.type==="upload"){html+="<button class=\'chip\' onclick=\'showUpload()\'>"+a.label+"</button>";}',
    '      else if(a.type==="state"){html+="<button class=\'chip\' onclick=\'sendQuick(\\\""+a.value+"\\\")\'>"+a.label+"</button>";}',
    '      else if(a.type==="quick"){var q=a.label.replace(/[^a-zA-Z0-9 ]/g,"");html+="<button class=\'chip\' onclick=\'sendQuick(\\\""+q+"\\\")\'>"+a.label+"</button>";}',
    '    });',
    '    html+="</div>";',
    '  }',
    '  div.innerHTML=html;msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;',
    '}',
    'function addUserMsg(t){var msgs=document.getElementById("chatMsgs");var d=document.createElement("div");d.className="cmsg user";d.innerHTML="<div class=\'bubble\'>"+t+"</div>";msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}',
    'function addThinking(){var msgs=document.getElementById("chatMsgs");var d=document.createElement("div");d.id="think";d.className="cmsg bot";d.innerHTML="<div class=\'bubble\' style=\'color:#aaa\'>Typing...</div>";msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}',
    'function removeThinking(){var t=document.getElementById("think");if(t)t.remove();}',
    'function sendQuick(v){sendChatMsg(v,true);}',
    'function showUpload(){document.getElementById("uploadArea").style.display="block";}',
    'async function sendChatMsg(text,isQuick){',
    '  var input=document.getElementById("chatInput");',
    '  var msg=isQuick?text:(input?input.value.trim():"");',
    '  if(!msg&&chatState!=="init")return;',
    '  if(!isQuick&&msg){addUserMsg(msg);if(input)input.value="";}',
    '  else if(msg&&msg!=="estimate_start"&&msg!=="qa"){addUserMsg(msg);}',
    '  var btn=document.getElementById("chatSend");if(btn)btn.disabled=true;',
    '  addThinking();',
    '  try{',
    '    var res=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},',
    '      body:JSON.stringify({message:msg,state:chatState,section:leadSection})});',
    '    var data=await res.json();',
    '    removeThinking();',
    '    chatState=data.state||chatState;',
    '    addBotMsg(data.answer||"Sorry, something went wrong.",data.suggested_actions);',
    '    if(chatState==="estimate_upload")showUpload();',
    '  }catch(e){removeThinking();addBotMsg("Connection issue — please call us at (818) 624-7212.",[{type:"call",label:"Call Now",url:"tel:+18186247212"}]);}',
    '  if(btn)btn.disabled=false;',
    '}',
    'function toggleMenu(){var m=document.getElementById("mobileMenu");m.style.display=m.style.display==="flex"?"none":"flex";}',
    'function submitCallback(){',
    '  var name=(document.getElementById("cbName").value||"").trim();',
    '  var phone=(document.getElementById("cbPhone").value||"").trim();',
    '  var time=document.getElementById("cbTime").value;',
    '  var note=(document.getElementById("cbNote").value||"").trim();',
    '  var res=document.getElementById("cbResult");',
    '  if(!name||!phone){res.textContent="Name and phone are required.";res.className="lfr err";res.style.display="block";return;}',
    '  res.textContent="Submitting...";res.className="lfr";res.style.display="block";',
    '  fetch("/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({',
    '    name:name,phone:phone,preferred_time:time,notes:note,lead_section:"callback_widget",source:"web"',
    '  })}).then(function(r){return r.json();}).then(function(d){',
    '    res.textContent=d.message||"We will call you soon!";',
    '    res.className="lfr "+(d.ok?"ok":"err");',
    '    res.style.display="block";',
    '    if(d.ok){["cbName","cbPhone","cbNote"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";});document.getElementById("cbTime").selectedIndex=0;}',
    '  }).catch(function(){res.textContent="Failed. Please call (818) 624-7212.";res.className="lfr err";res.style.display="block";});',
    '}',
    'document.addEventListener("DOMContentLoaded",function(){',
    '  document.querySelectorAll(".svc-tab").forEach(function(tab){',
    '    tab.addEventListener("click",function(){',
    '      document.querySelectorAll(".svc-tab").forEach(function(t){t.classList.remove("active");});',
    '      document.querySelectorAll(".svc-panel").forEach(function(p){p.classList.remove("active");});',
    '      tab.classList.add("active");',
    '      var panel=document.querySelector("[data-panel=\\""+tab.dataset.svc+"\\"]");',
    '      if(panel)panel.classList.add("active");',
    '    });',
    '  });',
    '  var allCards=Array.from(document.querySelectorAll(".proj-card"));',
    '  var projTypes=["Kitchen Remodeling","Bathroom Remodeling","Home Addition ADU","New Construction","Home Addition ADU","Kitchen Remodeling"];',
    '  allCards.forEach(function(c,i){c.dataset.type=projTypes[i]||"";});',
    '  document.querySelectorAll(".proj-filter-btn").forEach(function(btn){',
    '    btn.addEventListener("click",function(){',
    '      document.querySelectorAll(".proj-filter-btn").forEach(function(b){b.classList.remove("active");});',
    '      btn.classList.add("active");',
    '      var f=btn.dataset.filter;',
    '      allCards.forEach(function(c){c.style.display=(f==="all"||c.dataset.type===f)?"":"none";});',
    '    });',
    '  });',
    '  var lfBtn=document.getElementById("lfBtn");',
    '  if(lfBtn)lfBtn.addEventListener("click",function(){',
    '    var name=(document.getElementById("lfName").value||"").trim();',
    '    var email=(document.getElementById("lfEmail").value||"").trim();',
    '    var res=document.getElementById("lfResult");',
    '    if(!name||!email){res.textContent="Name and email are required.";res.className="lfr err";res.style.display="block";return;}',
    '    res.textContent="Submitting...";res.className="lfr";res.style.display="block";',
    '    fetch("/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({',
    '      name:name,email:email,',
    '      phone:document.getElementById("lfPhone").value,',
    '      service:document.getElementById("lfIntent").value,',
    '      budget_range:document.getElementById("lfBudget").value,',
    '      timeline:document.getElementById("lfTimeline").value,',
    '      message:document.getElementById("lfMsg").value,',
    '      lead_section:"lead_form",source:"web"',
    '    })}).then(function(r){return r.json();}).then(function(d){',
    '      res.textContent=d.message||"Thank you!";',
    '      res.className="lfr "+(d.ok?"ok":"err");',
    '      res.style.display="block";',
    '      if(d.ok){["lfName","lfEmail","lfPhone","lfMsg"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";});}',
    '    }).catch(function(){res.textContent="Failed. Please call (818) 624-7212.";res.className="lfr err";res.style.display="block";});',
    '  });',
    '  var sendBtn=document.getElementById("chatSend");',
    '  if(sendBtn)sendBtn.addEventListener("click",function(){sendChatMsg("",false);});',
    '  var chatInput=document.getElementById("chatInput");',
    '  if(chatInput)chatInput.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMsg("",false);}});',
    '  var fileInput=document.getElementById("chatFileInput");',
    '  if(fileInput)fileInput.addEventListener("change",async function(){',
    '    var files=Array.from(this.files);if(!files.length)return;',
    '    var prog=document.getElementById("uploadProg");if(prog)prog.textContent="Uploading...";',
    '    var ok=0;',
    '    for(var i=0;i<files.length;i++){var fd=new FormData();fd.append("file",files[i]);try{var r=await fetch("/upload",{method:"POST",body:fd});var d=await r.json();if(d.ok)ok++;}catch(e){}}',
    '    if(prog)prog.textContent="";',
    '    document.getElementById("uploadArea").style.display="none";',
    '    addUserMsg("Uploaded "+ok+" file(s)");',
    '    chatState="estimate_upload";',
    '    await sendChatMsg("I uploaded "+ok+" photo(s) of my project.",true);',
    '  });',
    '});',
  ].join('\n');
}

function buildPublic() {
  const js = buildPublicJS();
  const css = [
    ':root{--primary:#1a2744;--accent:#c8a84b;--bg:#f8f7f5;--dark:#0f1a2e;--text:#1c1c1e;--muted:#666;--border:#e4e4e4;--r:8px;--shadow:0 2px 12px rgba(0,0,0,.08)}',
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}',
    'body{font-family:"Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}',
    'h1,h2,h3,h4{font-family:"Oswald",sans-serif;letter-spacing:.02em}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:auto}',
    '.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}.section{padding:5rem 0}.section-alt{background:#fff}.section-dark{background:var(--primary)}.section-darker{background:var(--dark)}',
    '.section-head{margin-bottom:3rem}.section-head h2{font-size:2.2rem;color:var(--primary);margin-bottom:.4rem}.section-dark .section-head h2,.section-darker .section-head h2{color:#fff}',
    '.section-sub{color:var(--muted);font-size:.97rem}.section-dark .section-sub,.section-darker .section-sub{color:rgba(255,255,255,.65)}',
    'nav{position:sticky;top:0;z-index:200;background:var(--primary);border-bottom:3px solid var(--accent)}',
    '.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.5rem}',
    '.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;letter-spacing:.06em}.logo span{color:var(--accent)}',
    '.nav-menu{display:flex;align-items:center;gap:1.5rem}.nav-menu a{color:rgba(255,255,255,.8);font-size:.84rem;transition:color .15s}.nav-menu a:hover{color:var(--accent)}',
    '.nav-phone{color:var(--accent)!important;font-weight:600!important}.nav-cta{background:var(--accent);color:#fff!important;padding:.38rem .9rem;border-radius:3px;font-weight:600!important}',
    '.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px}',
    '.mobile-menu{display:none;flex-direction:column;background:var(--primary);border-top:1px solid rgba(255,255,255,.1)}',
    '.mobile-menu a{padding:.85rem 1.5rem;color:rgba(255,255,255,.85);font-size:.92rem;border-bottom:1px solid rgba(255,255,255,.07)}',
    '.trust-bar{background:var(--dark);padding:.55rem 0}.trust-inner{display:flex;flex-wrap:wrap;gap:.6rem 2rem;align-items:center;justify-content:center}',
    '.trust-item{color:rgba(255,255,255,.75);font-size:.78rem}.trust-item a{color:var(--accent);font-weight:700}',
    '.btn{display:inline-block;padding:.72rem 1.6rem;border-radius:3px;font-weight:600;cursor:pointer;border:none;font-size:.93rem;font-family:"Inter",sans-serif;transition:opacity .15s,transform .1s;text-align:center}',
    '.btn:hover{opacity:.88;transform:translateY(-1px)}.btn-primary{background:var(--accent);color:#fff}.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.55)}',
    '.hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}',
    '.hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover}',
    '.hero-grad{position:absolute;inset:0;background:linear-gradient(115deg,rgba(15,26,46,.96) 40%,rgba(15,26,46,.5) 75%,rgba(15,26,46,.2) 100%)}',
    '.hero-content{position:relative;z-index:2;padding:2rem 2rem 2rem 2.5rem;max-width:660px;color:#fff}',
    '.hero-eyebrow{display:inline-flex;gap:.6rem;align-items:center;background:rgba(200,168,75,.18);border:1px solid rgba(200,168,75,.4);color:var(--accent);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .85rem;border-radius:20px;margin-bottom:1.2rem;font-weight:500}',
    '.hero h1{font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.06;margin-bottom:1.1rem}.hero h1 span{color:var(--accent)}',
    '.hero-sub{font-size:clamp(.95rem,1.8vw,1.1rem);opacity:.85;margin-bottom:2rem;line-height:1.65;font-weight:300;max-width:520px}',
    '.hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem}',
    '.hero-stats{display:flex;gap:2rem;flex-wrap:wrap;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.15)}',
    '.stat-num{font-family:"Oswald",sans-serif;font-size:2rem;color:var(--accent);line-height:1}.stat-label{font-size:.75rem;color:rgba(255,255,255,.6);margin-top:.2rem}',
    '.svc-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem;border-bottom:2px solid var(--border);padding-bottom:.5rem}',
    '.svc-tab{background:transparent;border:none;font-family:"Inter",sans-serif;font-size:.85rem;font-weight:500;color:var(--muted);cursor:pointer;padding:.5rem .9rem;border-radius:4px 4px 0 0;transition:all .2s;white-space:nowrap}',
    '.svc-tab.active{color:var(--accent);border-bottom:2px solid var(--accent);margin-bottom:-2px;font-weight:600}',
    '.svc-panel{display:none}.svc-panel.active{display:block}',
    '.svc-panel-inner{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}',
    '.svc-img-wrap{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow)}',
    '.svc-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}.svc-img-wrap:hover .svc-img{transform:scale(1.04)}',
    '.svc-panel-body h3{font-size:1.6rem;color:var(--primary);margin-bottom:.75rem}.svc-desc{color:#555;font-size:.94rem;line-height:1.7;margin-bottom:1.25rem}',
    '.svc-hi{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;margin-bottom:1.5rem}',
    '.svc-hi li{font-size:.85rem;color:#444;padding-left:1.1rem;position:relative;line-height:1.45}.svc-hi li::before{content:"\\2713";position:absolute;left:0;color:var(--accent);font-weight:700}',
    '.proj-filter{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}',
    '.proj-filter-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:"Inter",sans-serif;font-size:.82rem;padding:.38rem .85rem;border-radius:20px;cursor:pointer;transition:all .2s}',
    '.proj-filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}',
    '.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}',
    '.proj-card{border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);cursor:pointer;transition:transform .2s,box-shadow .2s}',
    '.proj-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}',
    '.proj-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden}.proj-img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.proj-card:hover .proj-img{transform:scale(1.06)}',
    '.proj-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,26,46,.85) 30%,transparent 70%);display:flex;align-items:flex-end;padding:1rem}',
    '.proj-type{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);background:rgba(0,0,0,.4);padding:.25rem .6rem;border-radius:10px}',
    '.proj-body{padding:1.1rem 1.25rem 1.25rem}.proj-body h3{font-size:1rem;color:var(--primary);margin-bottom:.25rem}',
    '.proj-loc{font-size:.78rem;color:var(--muted);margin-bottom:.4rem}.proj-desc{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}.proj-more{font-size:.82rem;color:var(--accent);font-weight:600}',
    '.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}',
    '.rev-card{background:#fff;border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow);border-top:3px solid var(--accent)}',
    '.rev-stars{color:var(--accent);font-size:1.05rem;margin-bottom:.6rem}.rev-text{color:#444;font-size:.88rem;line-height:1.65;font-style:italic;margin-bottom:.85rem}',
    '.rev-footer{display:flex;justify-content:space-between;align-items:center}.rev-name{font-size:.82rem;font-weight:600;color:var(--primary)}.rev-proj{font-size:.75rem;color:var(--muted)}',
    '.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}',
    '.proc-step{background:rgba(255,255,255,.07);border-radius:var(--r);padding:1.5rem;border-left:3px solid var(--accent)}',
    '.proc-num{font-family:"Oswald",sans-serif;font-size:2.2rem;color:var(--accent);line-height:1;margin-bottom:.6rem}.proc-step h3{font-size:.97rem;color:#fff;margin-bottom:.35rem}.proc-step p{font-size:.83rem;color:rgba(255,255,255,.65);line-height:1.55}',
    '.leads-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}',
    '.leads-input,.leads-select,.leads-textarea{width:100%;padding:.72rem .9rem;border:1px solid var(--border);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:#fff;color:var(--text);outline:none;-webkit-appearance:none}',
    '.leads-input:focus,.leads-select:focus,.leads-textarea:focus{border-color:var(--accent)}',
    '.leads-textarea{resize:vertical;min-height:90px;grid-column:1/-1}',
    '.leads-select-half{grid-column:span 1}',
    '.lfr{margin-top:1rem;font-size:.88rem;padding:.6rem .9rem;border-radius:var(--r);display:none}',
    '.lfr.ok{background:#dcfce7;color:#15803d}.lfr.err{background:#fee2e2;color:#b91c1c}',
    '.cb-widget{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:2rem;margin-top:2.5rem}',
    '.cb-widget h3{font-family:"Oswald",sans-serif;font-size:1.3rem;color:#fff;margin-bottom:.4rem}',
    '.cb-widget p{font-size:.86rem;color:rgba(255,255,255,.6);margin-bottom:1.25rem}',
    '.cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}',
    '.cb-input,.cb-select{width:100%;padding:.7rem .9rem;border:1px solid rgba(255,255,255,.15);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:rgba(255,255,255,.07);color:#fff;outline:none;-webkit-appearance:none}',
    '.cb-input:focus,.cb-select:focus{border-color:var(--accent)}.cb-input::placeholder{color:rgba(255,255,255,.35)}',
    '.cb-select option{background:#1a2744;color:#fff}',
    'footer{background:#060d18;color:rgba(255,255,255,.42);padding:2rem 0;font-size:.81rem;text-align:center}',
    '#chatFab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;background:var(--accent);color:#fff;font-family:"Oswald",sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.06em;padding:.75rem 1.35rem;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(200,168,75,.45);display:flex;align-items:center;gap:.5rem;transition:transform .2s}',
    '#chatFab:hover{transform:translateY(-2px)}',
    '#chatDrawer{position:fixed;bottom:0;right:0;width:100%;max-width:420px;z-index:600;transform:translateY(110%);transition:transform .3s cubic-bezier(.4,0,.2,1);border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.25)}',
    '#chatDrawer.open{transform:translateY(0)}',
    '.chat-phone-bar{background:var(--dark);padding:.65rem 1.25rem;display:flex;align-items:center;justify-content:space-between}',
    '.chat-phone-bar a{color:var(--accent);font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:.5rem}',
    '.chat-close-btn{background:transparent;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.3rem;line-height:1}',
    '.chat-header{background:var(--primary);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.08)}',
    '.chat-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}',
    '.chat-title{color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;letter-spacing:.04em}.chat-sub{color:rgba(255,255,255,.5);font-size:.75rem;margin-top:.1rem}',
    '.chat-msgs{background:#fff;height:320px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}',
    '.cmsg{max-width:88%}.cmsg.user{align-self:flex-end}',
    '.cmsg.user .bubble{background:var(--primary);color:#fff;border-radius:16px 16px 3px 16px}',
    '.cmsg.bot .bubble{background:#f1f1f1;color:var(--text);border-radius:16px 16px 16px 3px}',
    '.bubble{padding:.6rem 1rem;font-size:.88rem;line-height:1.55}',
    '.actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem}',
    '.chip{font-size:.78rem;padding:.28rem .7rem;border:1.5px solid var(--accent);color:var(--accent);border-radius:10px;cursor:pointer;background:transparent;font-family:"Inter",sans-serif;text-decoration:none;display:inline-block;transition:all .15s}',
    '.chip:hover,.chip.call{background:var(--accent);color:#fff;border-color:var(--accent)}',
    '.chat-input-row{background:#f8f7f5;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem}',
    '.chat-text{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:.55rem 1rem;font-size:16px;font-family:"Inter",sans-serif;outline:none;background:#fff;-webkit-appearance:none}',
    '.chat-text:focus{border-color:var(--accent)}',
    '.chat-send{background:var(--accent);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.upload-area{padding:.75rem 1rem;background:#f8f7f5;border-top:1px solid var(--border)}',
    '.upload-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.83rem;color:var(--accent);font-weight:600;padding:.5rem .9rem;border:1.5px dashed var(--accent);border-radius:var(--r);justify-content:center}',
    '.upload-label input{display:none}',
    '@media(max-width:768px){.nav-menu{display:none}.hamburger{display:flex}.svc-panel-inner,.proj-grid,.rev-grid,.proc-grid,.leads-grid,.cb-grid{grid-template-columns:1fr}.svc-hi{grid-template-columns:1fr}#chatDrawer{max-width:100%;border-radius:16px 16px 0 0}}',
  ].join('');

  return '<!DOCTYPE html><html lang="en"><head>'
  + '<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
  + '<title>CCS Services Group &mdash; Licensed Construction | Los Angeles</title>'
  + '<meta name="description" content="CCS Services Group &mdash; LA kitchen, bathroom, ADU, home addition &amp; new construction. '+LICENSE+'. Call '+PHONE+'.">'
  + '<link rel="preconnect" href="https://fonts.googleapis.com"/>'
  + '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>'
  + '<style>'+css+'</style></head><body>'
  + '<nav><div class="nav-inner"><a href="/" class="logo">CCS<span>.</span></a>'
  + '<div class="nav-menu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="#contact">Contact</a>'
  + '<a href="tel:+18186247212" class="nav-phone">'+PHONE+'</a>'
  + '<a href="#contact" class="nav-cta" onclick="leadSection=\'nav_cta\'">Free Estimate</a></div>'
  + '<div class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div></div>'
  + '<div class="mobile-menu" id="mobileMenu"><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="#contact">Contact</a>'
  + '<a href="tel:+18186247212" style="color:var(--accent);font-weight:600">'+PHONE+'</a></div></nav>'
  + '<div class="trust-bar"><div class="trust-inner container">'
  + '<span class="trust-item">&#10003; '+LICENSE+'</span><span class="trust-item">&#10003; Licensed, Bonded &amp; Insured</span>'
  + '<span class="trust-item">&#10003; Los Angeles County</span><span class="trust-item">&#10003; Free Estimates</span>'
  + '<span class="trust-item"><a href="tel:+18186247212">'+PHONE+'</a></span></div></div>'
  + '<div class="hero"><div class="hero-bg"><img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop" alt="Modern kitchen" loading="eager"/><div class="hero-grad"></div></div>'
  + '<div class="hero-content container"><div class="hero-eyebrow">&#10003; Licensed &nbsp;|&nbsp; &#10003; Bonded &nbsp;|&nbsp; &#10003; Insured</div>'
  + '<h1>LA&rsquo;s Trusted <span>General Contractor</span></h1>'
  + '<p class="hero-sub">Kitchens, bathrooms, ADUs, home additions &amp; new construction across Los Angeles County. On budget. On time. Every time.</p>'
  + '<div class="hero-ctas"><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'hero_chat\')">Estimate / Chat</button><a href="tel:+18186247212" class="btn btn-ghost">Call '+PHONE+'</a></div>'
  + '<div class="hero-stats"><div class="stat"><div class="stat-num">500+</div><div class="stat-label">Projects Completed</div></div><div class="stat"><div class="stat-num">15+</div><div class="stat-label">Years in LA</div></div><div class="stat"><div class="stat-num">100%</div><div class="stat-label">Licensed &amp; Insured</div></div><div class="stat"><div class="stat-num">5&#9733;</div><div class="stat-label">Client Rating</div></div></div></div></div>'
  + '<section class="section section-alt" id="services"><div class="container"><div class="section-head"><h2>Our Services</h2><p class="section-sub">Full-scope residential construction throughout Los Angeles County</p></div>'
  + '<div class="svc-tabs"><button class="svc-tab active" data-svc="kitchen">Kitchen</button><button class="svc-tab" data-svc="bathroom">Bathroom</button><button class="svc-tab" data-svc="adu">ADUs &amp; Additions</button><button class="svc-tab" data-svc="newbuild">New Construction</button><button class="svc-tab" data-svc="exterior">Exterior &amp; Structural</button></div>'
  + '<div class="svc-panel active" data-panel="kitchen"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop" alt="Kitchen"/></div><div class="svc-panel-body"><h3>Kitchen Remodeling</h3><p class="svc-desc">From cabinet replacements to full layout changes with plumbing and electrical relocation.</p><ul class="svc-hi"><li>Custom cabinetry</li><li>Countertop installation</li><li>Tile &amp; backsplash</li><li>Plumbing relocation</li><li>Electrical &amp; lighting</li><li>Permit coordination</li></ul><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'services_kitchen\')">Get Free Estimate</button></div></div></div>'
  + '<div class="svc-panel" data-panel="bathroom"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop" alt="Bathroom"/></div><div class="svc-panel-body"><h3>Bathroom Remodeling</h3><p class="svc-desc">Full gut-and-rebuild or targeted upgrades. Tile, shower enclosures, soaking tubs, vanities, and lighting.</p><ul class="svc-hi"><li>Tile &amp; waterproofing</li><li>Shower &amp; tub installs</li><li>Vanity &amp; fixtures</li><li>Plumbing upgrades</li><li>Lighting &amp; ventilation</li><li>ADA-accessible design</li></ul><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'services_bathroom\')">Get Free Estimate</button></div></div></div>'
  + '<div class="svc-panel" data-panel="adu"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop" alt="ADU"/></div><div class="svc-panel-body"><h3>ADUs &amp; Home Additions</h3><p class="svc-desc">Garage conversions, detached ADUs, room additions, and second-story builds. Full design, permits, and construction.</p><ul class="svc-hi"><li>Garage conversions</li><li>Detached ADUs to 1,200 sq ft</li><li>Room &amp; second-story additions</li><li>LADBS permit handling</li><li>Foundation &amp; framing</li><li>Full MEP &amp; finishes</li></ul><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'services_adu\')">Get Free Estimate</button></div></div></div>'
  + '<div class="svc-panel" data-panel="newbuild"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop" alt="New construction"/></div><div class="svc-panel-body"><h3>New Construction</h3><p class="svc-desc">Ground-up residential construction for custom homes, spec homes, and lot splits throughout Los Angeles.</p><ul class="svc-hi"><li>Site prep &amp; foundation</li><li>Structural framing</li><li>All MEP trades</li><li>Insulation &amp; drywall</li><li>Interior &amp; exterior finishes</li><li>City inspection coordination</li></ul><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'services_newbuild\')">Get Free Estimate</button></div></div></div>'
  + '<div class="svc-panel" data-panel="exterior"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop" alt="Exterior"/></div><div class="svc-panel-body"><h3>Exterior &amp; Structural</h3><p class="svc-desc">Stucco, siding, decks, retaining walls, seismic retrofitting, and structural repairs.</p><ul class="svc-hi"><li>Stucco &amp; siding</li><li>Deck construction</li><li>Retaining walls</li><li>Foundation repair</li><li>Seismic retrofitting</li><li>Garage construction</li></ul><button class="btn btn-primary" onclick="openChat(\'estimate_start\',\'services_exterior\')">Get Free Estimate</button></div></div></div>'
  + '</div></section>'
  + '<section class="section" id="projects"><div class="container"><div class="section-head"><h2>Recent Projects</h2><p class="section-sub">A selection of completed work across Los Angeles County</p></div>'
  + '<div class="proj-filter"><button class="proj-filter-btn active" data-filter="all">All</button><button class="proj-filter-btn" data-filter="Kitchen Remodeling">Kitchen</button><button class="proj-filter-btn" data-filter="Bathroom Remodeling">Bathroom</button><button class="proj-filter-btn" data-filter="Home Addition ADU">ADU / Addition</button><button class="proj-filter-btn" data-filter="New Construction">New Build</button></div>'
  + '<div class="proj-grid">'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p1\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Kitchen</span></div></div><div class="proj-body"><h3>Silver Lake Kitchen Renovation</h3><div class="proj-loc">Silver Lake, CA</div><p class="proj-desc">Complete gut-and-rebuild with custom cabinetry and quartz counters.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p2\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Bathroom</span></div></div><div class="proj-body"><h3>Burbank Primary Bath Remodel</h3><div class="proj-loc">Burbank, CA</div><p class="proj-desc">Freestanding tub, walk-in shower, heated tile, custom vanity.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p3\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">ADU</span></div></div><div class="proj-body"><h3>Glendale Garage Conversion ADU</h3><div class="proj-loc">Glendale, CA</div><p class="proj-desc">480 sq ft studio ADU with full kitchen and bath.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p4\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">New Build</span></div></div><div class="proj-body"><h3>Pasadena Custom Home Build</h3><div class="proj-loc">Pasadena, CA</div><p class="proj-desc">2,400 sq ft custom home, foundation to finishes.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p5\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Addition</span></div></div><div class="proj-body"><h3>Los Feliz Second-Story Addition</h3><div class="proj-loc">Los Feliz, CA</div><p class="proj-desc">800 sq ft second story with 2 bedrooms and primary bath.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '<div class="proj-card" onclick="openChat(\'estimate_start\',\'portfolio_p6\')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Kitchen</span></div></div><div class="proj-body"><h3>Studio City Open-Plan Kitchen</h3><div class="proj-loc">Studio City, CA</div><p class="proj-desc">Wall removal, waterfall island, open-plan layout.</p><span class="proj-more">Get a similar estimate &rarr;</span></div></div>'
  + '</div></div></section>'
  + '<section class="section section-dark" id="process"><div class="container"><div class="section-head"><h2>Our Process</h2><p class="section-sub">Straightforward from first call to final walkthrough</p></div>'
  + '<div class="proc-grid"><div class="proc-step"><div class="proc-num">01</div><h3>Free Estimate</h3><p>We visit your property and provide a detailed written estimate at no cost.</p></div>'
  + '<div class="proc-step"><div class="proc-num">02</div><h3>Plan &amp; Permit</h3><p>We coordinate plans, engineering, and handle all permit filings with LADBS or your local city.</p></div>'
  + '<div class="proc-step"><div class="proc-num">03</div><h3>Build &amp; Deliver</h3><p>Experienced crews, consistent communication, and a final walkthrough to make sure everything is right.</p></div></div></div></section>'
  + '<section class="section section-alt" id="reviews"><div class="container"><div class="section-head"><h2>What Clients Say</h2><p class="section-sub">Real feedback from LA homeowners</p></div>'
  + '<div class="rev-grid"><div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;On budget, on time. Joseph runs a tight crew and the kitchen turned out better than we imagined.&rdquo;</p><div class="rev-footer"><span class="rev-name">Gary R.</span><span class="rev-proj">Kitchen &mdash; Silver Lake</span></div></div>'
  + '<div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;Joseph did three projects for us &mdash; each one incredible. The ADU is now rented and cash-flowing.&rdquo;</p><div class="rev-footer"><span class="rev-name">Bobby S.</span><span class="rev-proj">ADU + Kitchen &mdash; Burbank</span></div></div>'
  + '<div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;Most timely, professional crew I&rsquo;ve worked with. Quick, clean, amazing job.&rdquo;</p><div class="rev-footer"><span class="rev-name">Silvia K.</span><span class="rev-proj">Room Addition &mdash; Glendale</span></div></div></div></div></section>'
  + '<section class="section section-darker" id="contact"><div class="container" style="max-width:680px"><div class="section-head"><h2>Get Your Free Estimate</h2><p class="section-sub">Tell us about your project and we&rsquo;ll follow up within one business day</p></div>'
  + '<div class="leads-grid">'
  + '<input class="leads-input" id="lfName" placeholder="Full Name *"/>'
  + '<input class="leads-input" id="lfEmail" type="email" placeholder="Email Address *"/>'
  + '<input class="leads-input" id="lfPhone" placeholder="Phone Number"/>'
  + '<select class="leads-select" id="lfIntent"><option value="">Project Type</option><option>Kitchen Remodeling</option><option>Bathroom Remodeling</option><option>ADU / Accessory Dwelling</option><option>Home Addition</option><option>New Construction</option><option>Exterior / Structural</option><option>Other</option></select>'
  + '<select class="leads-select leads-select-half" id="lfBudget"><option value="">Budget Range</option><option>Under $25k</option><option>$25k\u2013$50k</option><option>$50k\u2013$100k</option><option>$100k\u2013$250k</option><option>$250k+</option><option>Not sure yet</option></select>'
  + '<select class="leads-select leads-select-half" id="lfTimeline"><option value="">Timeline</option><option>ASAP</option><option>1\u20133 months</option><option>3\u20136 months</option><option>6\u201312 months</option><option>Just exploring</option></select>'
  + '<textarea class="leads-textarea" id="lfMsg" placeholder="Tell us about your project..."></textarea>'
  + '</div>'
  + '<button class="btn btn-primary" id="lfBtn">Send My Project Details</button><div id="lfResult" class="lfr"></div>'
  + '<div class="cb-widget"><h3>Prefer a Call Back?</h3><p>Leave your number and we&rsquo;ll reach out at your preferred time &mdash; no wait on hold.</p>'
  + '<div class="cb-grid">'
  + '<input class="cb-input" id="cbName" placeholder="Your Name *"/>'
  + '<input class="cb-input" id="cbPhone" placeholder="Phone Number *"/>'
  + '<select class="cb-select" id="cbTime"><option value="">Best time to call</option><option value="morning">Morning (8am\u201312pm)</option><option value="afternoon">Afternoon (12pm\u20135pm)</option><option value="evening">Evening (5pm\u20137pm)</option><option value="anytime">Anytime</option></select>'
  + '<input class="cb-input" id="cbNote" placeholder="Optional note"/>'
  + '</div>'
  + '<button class="btn btn-ghost" onclick="submitCallback()">Request a Call Back</button>'
  + '<div id="cbResult" class="lfr"></div>'
  + '</div>'
  + '</div></section>'
  + '<footer><div class="container"><p style="margin-bottom:.4rem"><strong style="color:rgba(255,255,255,.7);font-family:\'Oswald\',sans-serif;letter-spacing:.04em">'+COMPANY+'</strong></p>'
  + '<p>'+LICENSE+' &nbsp;&bull;&nbsp; <a href="tel:+18186247212" style="color:var(--accent)">'+PHONE+'</a> &nbsp;&bull;&nbsp; Los Angeles County, CA</p>'
  + '<p style="margin-top:.5rem;font-size:.72rem;color:rgba(255,255,255,.25)">v'+VERSION+'</p></div></footer>'
  + '<button id="chatFab" onclick="openChat()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px;flex-shrink:0"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Estimate / Chat</button>'
  + '<div id="chatDrawer"><div class="chat-phone-bar"><a href="tel:+18186247212"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:16px;height:16px"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.87 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'+PHONE+' &mdash; Tap to Call</a><button class="chat-close-btn" onclick="closeChat()">&#10005;</button></div>'
  + '<div class="chat-header"><div class="chat-avatar">&#127968;</div><div><div class="chat-title">CCS Services Group</div><div class="chat-sub">Licensed General Contractor &bull; Free Estimates</div></div></div>'
  + '<div class="chat-msgs" id="chatMsgs"></div>'
  + '<div class="upload-area" id="uploadArea" style="display:none"><label class="upload-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>Attach photos or video<input type="file" id="chatFileInput" accept="image/*,video/*,.pdf" multiple/></label><div id="uploadProg" style="font-size:.78rem;color:var(--muted);margin-top:.4rem;text-align:center"></div></div>'
  + '<div class="chat-input-row"><input class="chat-text" id="chatInput" placeholder="Type a message..." autocomplete="off"/><button class="chat-send" id="chatSend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div></div>'
  + '<script>\n' + js + '\n</script></body></html>';
}

function buildAdmin() {
  const adminJS = [
    'var PASS="'+ADMIN_PASS+'";',
    'var authed=sessionStorage.getItem("ccs_admin_v2")==="1";',
    'if(authed)unlock();',
    'function unlock(){document.getElementById("lock").style.display="none";document.getElementById("app").style.display="block";loadAll();}',
    'function tryLogin(){var pw=document.getElementById("pw").value;if(pw===PASS){sessionStorage.setItem("ccs_admin_v2","1");unlock();}else{document.getElementById("pwErr").style.display="block";document.getElementById("pw").value="";}}',
    'document.getElementById("pwBtn").addEventListener("click",tryLogin);',
    'document.getElementById("pw").addEventListener("keydown",function(e){if(e.key==="Enter")tryLogin();});',
    'document.getElementById("logoutBtn").addEventListener("click",function(){sessionStorage.removeItem("ccs_admin_v2");document.getElementById("app").style.display="none";document.getElementById("lock").style.display="flex";document.getElementById("pw").value="";});',
    'function loadAll(){loadStatus();loadLeads();loadCallbacks();loadArticles();}',
    'document.getElementById("refreshBtn").addEventListener("click",loadStatus);',
    'document.getElementById("refreshLeads").addEventListener("click",loadLeads);',
    'document.getElementById("refreshCallbacks").addEventListener("click",loadCallbacks);',
    'document.getElementById("refreshArticles").addEventListener("click",loadArticles);',
    'async function loadStatus(){try{var r=await fetch("/api/status");var d=await r.json();var items=[["Worker",d.worker,false],["Version",d.version,false],["D1",d.db,true],["Vectorize",d.vectorize,true],["R2",d.r2,true],["Leads",d.leads,false],["Callbacks",d.callbacks,false],["Articles",d.articles,false]];document.getElementById("statusGrid").innerHTML=items.map(function(x){var v=x[2]?(x[1]?"Yes":"No"):String(x[1]!=null?x[1]:"--");var c=x[2]?(x[1]?"ok":"err"):"";return"<div class=\'stat-box\'><h4>"+x[0]+"</h4><div class=\'stat-val "+c+"\'>" +v+"</div></div>";}).join("");}catch(e){document.getElementById("statusGrid").innerHTML="<div class=\'stat-box\'><h4>Error</h4><div class=\'stat-val err\'>"+e.message+"</div></div>";}}',
    'function leadStatusBadge(s){var map={"new":"#3b82f6","contacted":"#f59e0b","quoted":"#8b5cf6","won":"#22c55e","lost":"#ef4444"};var c=map[s]||"#6b7280";return"<span style=\'background:"+c+";color:#fff;font-size:.68rem;font-weight:600;padding:.15rem .55rem;border-radius:10px;text-transform:uppercase;letter-spacing:.06em\'>"+s+"</span>";}',
    'function cbStatusBadge(s){var map={"pending":"#f59e0b","called":"#22c55e","no_answer":"#ef4444","scheduled":"#8b5cf6"};var c=map[s]||"#6b7280";return"<span style=\'background:"+c+";color:#fff;font-size:.68rem;font-weight:600;padding:.15rem .55rem;border-radius:10px;text-transform:uppercase;letter-spacing:.06em\'>"+s+"</span>";}',
    'async function loadLeads(){',
    '  var el=document.getElementById("leadsTable");',
    '  try{',
    '    var r=await fetch("/api/admin/leads");',
    '    var d=await r.json();',
    '    if(!d.ok||!d.leads||!d.leads.length){el.innerHTML="<p style=\'color:var(--muted);font-size:.85rem\'>No leads yet.</p>";return;}',
    '    var html="<div style=\'margin-bottom:.75rem\'><a href=\'/api/admin/leads?format=csv\' class=\'btn btn-outline btn-sm\' download>&#11015; Export CSV</a></div>";',
    '    html+="<div style=\'overflow-x:auto\'><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Budget</th><th>Timeline</th><th>Section</th><th>Status</th><th>Date</th></tr></thead><tbody>";',
    '    d.leads.forEach(function(l){',
    '      html+="<tr>";',
    '      html+="<td>"+l.name+"</td>";',
    '      html+="<td>"+l.email+"</td>";',
    '      html+="<td>"+l.phone+"</td>";',
    '      html+="<td>"+(l.service||"")+"</td>";',
    '      html+="<td>"+(l.budget_range||"")+"</td>";',
    '      html+="<td>"+(l.timeline||"")+"</td>";',
    '      html+="<td style=\'font-size:.75rem;color:var(--a)\'>"+(l.lead_section||"")+"</td>";',
    '      html+="<td>"+leadStatusBadge(l.status||"new")+"<br><select onchange=\'updateLeadStatus("+l.id+",this.value)\' style=\'margin-top:.3rem;background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;font-size:.72rem;padding:.2rem .4rem;border-radius:4px;outline:none\'>";',
    '      ["new","contacted","quoted","won","lost"].forEach(function(s){',
    '        html+="<option value=\'"+s+"\'"+(l.status===s?" selected":"")+">"+s+"</option>";',
    '      });',
    '      html+="</select></td>";',
    '      html+="<td>"+(l.created_at||"").slice(0,16)+"</td>";',
    '      html+="</tr>";',
    '    });',
    '    html+="</tbody></table></div>";',
    '    el.innerHTML=html;',
    '  }catch(e){el.innerHTML="<p style=\'color:#f87171\'>"+e.message+"</p>";}',
    '}',
    'async function updateLeadStatus(id,status){',
    '  try{',
    '    var r=await fetch("/api/admin/leads/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:status})});',
    '    var d=await r.json();',
    '    if(!d.ok)alert("Error: "+(d.error||"unknown"));',
    '  }catch(e){alert("Error: "+e.message);}',
    '}',
    'async function loadCallbacks(){',
    '  var el=document.getElementById("callbacksTable");',
    '  try{',
    '    var r=await fetch("/api/admin/callbacks");',
    '    var d=await r.json();',
    '    if(!d.ok||!d.callbacks||!d.callbacks.length){el.innerHTML="<p style=\'color:var(--muted);font-size:.85rem\'>No callbacks yet.</p>";return;}',
    '    var html="<div style=\'margin-bottom:.75rem\'><a href=\'/api/admin/callbacks?format=csv\' class=\'btn btn-outline btn-sm\' download>&#11015; Export CSV</a></div>";',
    '    html+="<div style=\'overflow-x:auto\'><table><thead><tr><th>Name</th><th>Phone</th><th>Pref. Time</th><th>Service</th><th>Section</th><th>Status</th><th>Date</th></tr></thead><tbody>";',
    '    d.callbacks.forEach(function(c){',
    '      html+="<tr>";',
    '      html+="<td>"+c.name+"</td>";',
    '      html+="<td>"+c.phone+"</td>";',
    '      html+="<td>"+(c.preferred_time||"")+"</td>";',
    '      html+="<td>"+(c.service||"")+"</td>";',
    '      html+="<td style=\'font-size:.75rem;color:var(--a)\'>"+(c.lead_section||"")+"</td>";',
    '      html+="<td>"+cbStatusBadge(c.status||"pending")+"<br><select onchange=\'updateCallbackStatus("+c.id+",this.value)\' style=\'margin-top:.3rem;background:rgba(255,255,255,.08);border:1px solid var(--border);color:#fff;font-size:.72rem;padding:.2rem .4rem;border-radius:4px;outline:none\'>";',
    '      ["pending","called","no_answer","scheduled"].forEach(function(s){',
    '        html+="<option value=\'"+s+"\'"+(c.status===s?" selected":"")+">"+s+"</option>";',
    '      });',
    '      html+="</select></td>";',
    '      html+="<td>"+(c.created_at||"").slice(0,16)+"</td>";',
    '      html+="</tr>";',
    '    });',
    '    html+="</tbody></table></div>";',
    '    el.innerHTML=html;',
    '  }catch(e){el.innerHTML="<p style=\'color:#f87171\'>"+e.message+"</p>";}',
    '}',
    'async function updateCallbackStatus(id,status){',
    '  try{',
    '    var r=await fetch("/api/admin/callbacks/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:status})});',
    '    var d=await r.json();',
    '    if(!d.ok)alert("Error: "+(d.error||"unknown"));',
    '  }catch(e){alert("Error: "+e.message);}',
    '}',
    'async function loadArticles(){var el=document.getElementById("articlesTable");try{var r=await fetch("/articles");var d=await r.json();if(!d.articles||!d.articles.length){el.innerHTML="<p style=\'color:var(--muted);font-size:.85rem\'>No articles.</p>";return;}el.innerHTML="<table><thead><tr><th>Slug</th><th>Title</th><th>Summary</th><th>Date</th></tr></thead><tbody>"+d.articles.map(function(a){return"<tr><td style=\'font-family:monospace;font-size:.75rem;color:var(--a)\'>"+a.slug+"</td><td>"+a.title+"</td><td>"+(a.summary||"").slice(0,80)+"</td><td>"+(a.created_at||"").slice(0,10)+"</td></tr>";}).join("")+"</tbody></table>";}catch(e){el.innerHTML="<p style=\'color:#f87171\'>"+e.message+"</p>";}}',
    'document.getElementById("seedBtn").addEventListener("click",async function(){var log=document.getElementById("seedLog");log.style.display="block";log.textContent="Re-embedding...\\n";try{var r=await fetch("/api/seed",{method:"POST"});var d=await r.json();log.textContent+="Done: "+d.embedded+"/"+d.total+" articles embedded\\n";}catch(e){log.textContent+="Error: "+e.message+"\\n";}});',
    'document.getElementById("searchBtn").addEventListener("click",async function(){var q=document.getElementById("searchQ").value.trim();if(!q)return;var el=document.getElementById("searchResults");el.innerHTML="<span class=\'spin\'></span> Searching...";try{var r=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,state:"qa"})});var d=await r.json();if(!d.matches||!d.matches.length){el.innerHTML="<p style=\'color:var(--muted)\'>No vector matches.</p>";return;}el.innerHTML=d.matches.map(function(m){return"<div style=\'background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1rem;margin-bottom:.75rem\'><div style=\'font-size:.72rem;color:var(--a);font-weight:600;margin-bottom:.3rem\'>Score: "+(m.score*100).toFixed(1)+"% &mdash; "+m.slug+"</div><div style=\'font-size:.9rem;font-weight:600;color:#fff;margin-bottom:.25rem\'>"+m.title+"</div><div style=\'font-size:.78rem;color:var(--muted)\'>"+m.summary+"</div></div>";}).join("");}catch(e){el.innerHTML="<p style=\'color:#f87171\'>"+e.message+"</p>";}});',
    'document.getElementById("searchQ").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("searchBtn").click();});',
  ].join('\n');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CCS Admin v2</title>'
  + '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
  + '<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--p:#1a2744;--a:#c8a84b;--bg:#0f1a2e;--card:#1a2744;--border:#2a3a5c;--text:#e8eaf0;--muted:#8899aa;--r:8px}body{font-family:"Inter",sans-serif;background:var(--bg);color:var(--text);min-height:100vh}#lock{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:100}.lbox{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:3rem 2.5rem;max-width:380px;width:90%;text-align:center}.ltitle{font-family:"Oswald",sans-serif;font-size:1.6rem;color:#fff;letter-spacing:.06em;margin-bottom:.25rem}.ltitle span{color:var(--a)}.lsub{color:var(--muted);font-size:.85rem;margin-bottom:2rem}.linput{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.8rem 1rem;font-size:1rem;color:#fff;outline:none;text-align:center;letter-spacing:.2em;margin-bottom:1rem}.linput:focus{border-color:var(--a)}.lbtn{width:100%;background:var(--a);color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.08em;border:none;border-radius:var(--r);padding:.85rem;cursor:pointer}.lerr{color:#f87171;font-size:.82rem;margin-top:.5rem;display:none}#app{display:none}.anav{background:var(--p);border-bottom:3px solid var(--a);padding:.75rem 2rem;display:flex;align-items:center;justify-content:space-between}.alogo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.25rem;letter-spacing:.06em}.alogo span{color:var(--a)}.atag{background:rgba(200,168,75,.2);color:var(--a);font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.25rem .7rem;border-radius:10px}.lout{background:transparent;border:1px solid var(--border);color:var(--muted);font-size:.8rem;padding:.35rem .85rem;border-radius:var(--r);cursor:pointer}.lout:hover{border-color:var(--a);color:var(--a)}.abody{max-width:1100px;margin:0 auto;padding:2rem 1.5rem;display:grid;gap:2rem}.acard{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}.acard-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}.acard-head h2{font-family:"Oswald",sans-serif;font-size:1.1rem;color:#fff;letter-spacing:.06em}.acard-body{padding:1.5rem}.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem}.stat-box{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem}.stat-box h4{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.4rem}.stat-val{font-size:1.2rem;font-weight:700;color:#fff}.ok{color:#4ade80}.err{color:#f87171}.btn{display:inline-block;padding:.55rem 1.1rem;border-radius:var(--r);font-weight:600;font-size:.82rem;cursor:pointer;border:none;transition:opacity .15s;font-family:"Inter",sans-serif;text-decoration:none}.btn:hover{opacity:.85}.btn-gold{background:var(--a);color:#fff}.btn-outline{background:transparent;border:1px solid var(--border);color:var(--muted)}.btn-outline:hover{border-color:var(--a);color:var(--a)}.btn-sm{padding:.35rem .75rem;font-size:.75rem}table{width:100%;border-collapse:collapse;font-size:.82rem}thead th{text-align:left;padding:.5rem .75rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--border)}tbody tr:hover{background:rgba(255,255,255,.03)}td{padding:.6rem .75rem;border-bottom:1px solid rgba(255,255,255,.04);color:var(--text);vertical-align:top}.log{background:rgba(0,0,0,.3);border-radius:var(--r);padding:1rem;font-size:.78rem;font-family:monospace;color:#94a3b8;white-space:pre-wrap;max-height:200px;overflow:auto;display:none;margin-top:1rem}.sinput{background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--r);padding:.6rem 1rem;font-size:.88rem;color:#fff;outline:none;flex:1}.sinput:focus{border-color:var(--a)}.spin{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:4px}@keyframes spin{to{transform:rotate(360deg)}}</style>'
  + '</head><body><div id="lock"><div class="lbox"><div class="ltitle">CCS<span>.</span>Admin</div><div class="lsub">'+WORKER+' &middot; v'+VERSION+'</div><input class="linput" type="password" id="pw" placeholder="Password" autocomplete="off"/><button class="lbtn" id="pwBtn">Enter</button><div class="lerr" id="pwErr">Incorrect password</div></div></div>'
  + '<div id="app"><div class="anav"><div class="alogo">CCS<span> Admin</span></div><div style="display:flex;align-items:center;gap:1rem"><span class="atag">v'+VERSION+'</span><button class="lout" id="logoutBtn">Log out</button></div></div>'
  + '<div class="abody">'
  + '<div class="acard"><div class="acard-head"><h2>System Status</h2><button class="btn btn-outline btn-sm" id="refreshBtn">Refresh</button></div><div class="acard-body"><div class="stat-grid" id="statusGrid"><div class="stat-box"><h4>Loading</h4><div class="stat-val"><span class="spin"></span></div></div></div></div></div>'
  + '<div class="acard"><div class="acard-head"><h2>Leads</h2><button class="btn btn-outline btn-sm" id="refreshLeads">Refresh</button></div><div class="acard-body"><div id="leadsTable"><div style="color:var(--muted);font-size:.85rem"><span class="spin"></span> Loading...</div></div></div></div>'
  + '<div class="acard"><div class="acard-head"><h2>Callback Requests</h2><button class="btn btn-outline btn-sm" id="refreshCallbacks">Refresh</button></div><div class="acard-body"><div id="callbacksTable"><div style="color:var(--muted);font-size:.85rem"><span class="spin"></span> Loading...</div></div></div></div>'
  + '<div class="acard"><div class="acard-head"><h2>Knowledge Base</h2></div><div class="acard-body"><p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">Re-embed all articles into Vectorize. Run after adding new articles.</p><button class="btn btn-gold btn-sm" id="seedBtn">Re-embed All Articles</button><div class="log" id="seedLog"></div></div></div>'
  + '<div class="acard"><div class="acard-head"><h2>Articles</h2><button class="btn btn-outline btn-sm" id="refreshArticles">Refresh</button></div><div class="acard-body"><div id="articlesTable"><div style="color:var(--muted);font-size:.85rem"><span class="spin"></span> Loading...</div></div></div></div>'
  + '<div class="acard"><div class="acard-head"><h2>RAG Search Tester</h2></div><div class="acard-body"><div style="display:flex;gap:.75rem;margin-bottom:1rem"><input class="sinput" id="searchQ" placeholder="e.g. ADU permits Los Angeles"/><button class="btn btn-gold btn-sm" id="searchBtn">Search</button></div><div id="searchResults"></div></div></div>'
  + '</div></div>'
  + '<script>\n' + adminJS + '\n</script></body></html>';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method;
    if (method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'*','Access-Control-Allow-Headers':'*' }});
    if (path === '/' && method === 'GET') return h(buildPublic());
    if (path === '/admin' && method === 'GET') return h(buildAdmin());
    if (path === '/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/leads' && method === 'POST') return handleLeads(request, env);
    if (path === '/callback' && method === 'POST') return handleCallback(request, env);
    if (path === '/upload' && method === 'POST') return handleUpload(request, env);
    if (path === '/articles' && method === 'GET') return handleArticlesList(env);
    if (path.startsWith('/articles/') && method === 'GET') return handleArticle(path.slice(10), env);
    if (path === '/api/status') return handleStatus(env);
    if (path === '/api/seed' && method === 'POST') return handleSeed(env);
    if (path === '/api/admin/leads') return handleAdminLeads(request, env);
    if (path === '/api/admin/callbacks') return handleAdminCallbacks(request, env);
    const leadMatch = path.match(/^\/api\/admin\/leads\/(\d+)$/);
    if (leadMatch) return handleAdminLeadById(request, env, leadMatch[1]);
    const cbMatch = path.match(/^\/api\/admin\/callbacks\/(\d+)$/);
    if (cbMatch) return handleAdminCallbackById(request, env, cbMatch[1]);
    return j({ ok:false, error:'not_found', path }, 404);
  }
};
