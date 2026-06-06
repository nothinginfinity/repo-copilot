# contractor-v003-2-afo Phase 3 Patch Helper

Status: helper bundle only. Do not deploy this file.

Context:
- Live Worker: contractor-v003-2-afo
- Full restored source: workers/contractor-v003-2-afo/contractor-v003-2-afo.js
- Conventional entrypoint: workers/contractor-v003-2-afo/worker.js
- D1 database UUID: c0743318-ee23-4d08-9bd7-0d2b3cc36018
- D1 schema already has Phase 3 columns:
  - leads.lead_section
  - leads.status
  - leads.budget_range
  - leads.timeline
  - callbacks.lead_section
  - callbacks.status

Why this helper exists:
The available ChatGPT GitHub read tool displays the 64 KB source only in truncated form, and GitZip can push files but cannot read/patch existing files. This helper gives a file-edit capable instance the exact patch targets without risking a partial overwrite.

Patch targets in contractor-v003-2-afo.js:

1. handleLeads(req, env)

Currently it destructures lead_section but INSERT only writes:

```js
INSERT INTO leads (name,email,phone,service,message,source,created_at)
```

Patch to also destructure/save:
- budget_range
- budget
- timeline
- section fallback

Target behavior:

```js
const { name, email, phone, service, project_type, message, lead_section, section, budget_range, budget, timeline, source='web' } = b;
const svc = service || project_type || '';
const srcSection = lead_section || section || 'lead_form';
const budgetValue = budget_range || budget || '';
await dbRun(env,
  'INSERT INTO leads (name,email,phone,service,message,source,created_at,lead_section,status,budget_range,timeline) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
  [name, email||'', phone||'', svc, message||'', source, now(), srcSection, 'new', budgetValue, timeline||'']
);
```

2. handleCallback(req, env)

Currently it does not save lead_section/status directly. Patch to destructure `lead_section` and `section`, and write:

```js
const { name, phone, preferred_time, preferred_date, project_type, notes, lead_section, section, source='web' } = b;
const srcSection = lead_section || section || 'callback_widget';
await dbRun(env,
  'INSERT INTO callbacks (name,phone,preferred_time,service,message,source,created_at,lead_section,status) VALUES (?,?,?,?,?,?,?,?,?)',
  [name, phone, preferred_time||'', project_type||'', notesStr, source, now(), srcSection, 'pending']
)
```

Keep the fallback insert if older schema compatibility is desired.

3. Chat callback insertions

Search for:

```js
INSERT INTO callbacks (name,phone,service,message,source,created_at)
```

Patch chat callback rows to write `lead_section` as `section || 'chat_estimate'` where possible.

4. Admin status workflow endpoints

Add allowlist helpers:

```js
function validLeadStatus(s) { return ['new','contacted','quoted','won','lost'].includes(String(s||'').toLowerCase()); }
function validCallbackStatus(s) { return ['pending','called','no_answer','scheduled'].includes(String(s||'').toLowerCase()); }
```

Add handlers:

```js
async function handlePatchLead(req, env, id) {
  const b = await body(req);
  const status = String(b.status||'').toLowerCase();
  if (!validLeadStatus(status)) return j({ ok:false, error:'invalid status' }, 400);
  await dbRun(env, 'UPDATE leads SET status=? WHERE id=?', [status, id]);
  return j({ ok:true, id, status });
}

async function handlePatchCallback(req, env, id) {
  const b = await body(req);
  const status = String(b.status||'').toLowerCase();
  if (!validCallbackStatus(status)) return j({ ok:false, error:'invalid status' }, 400);
  await dbRun(env, 'UPDATE callbacks SET status=? WHERE id=?', [status, id]);
  return j({ ok:true, id, status });
}
```

Add router entries before generic 404:

```js
if (path.startsWith('/api/admin/leads/') && req.method === 'PATCH') return handlePatchLead(req, env, path.split('/').pop());
if (path.startsWith('/api/admin/callbacks/') && req.method === 'PATCH') return handlePatchCallback(req, env, path.split('/').pop());
```

5. CSV endpoints

Add escaping:

```js
function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
function csvRes(text) { return new Response(text, { headers: { 'Content-Type':'text/csv;charset=utf-8', 'Content-Disposition':'attachment; filename="export.csv"' } }); }
```

Add lead CSV handler:

```js
async function handleLeadsCSV(env) {
  const rows = await dbAll(env, 'SELECT id,name,email,phone,service,message,source,lead_section,status,budget_range,timeline,created_at FROM leads ORDER BY id DESC LIMIT 1000');
  const headers = ['id','name','email','phone','service','message','source','lead_section','status','budget_range','timeline','created_at'];
  return csvRes([headers.join(','), ...rows.map(r => headers.map(h => csvCell(r[h])).join(','))].join('\n'));
}
```

Add callback CSV handler similarly:

```js
async function handleCallbacksCSV(env) {
  const rows = await dbAll(env, 'SELECT id,name,phone,preferred_time,service,message,source,lead_section,status,created_at FROM callbacks ORDER BY id DESC LIMIT 1000');
  const headers = ['id','name','phone','preferred_time','service','message','source','lead_section','status','created_at'];
  return csvRes([headers.join(','), ...rows.map(r => headers.map(h => csvCell(r[h])).join(','))].join('\n'));
}
```

Router:

```js
if (path === '/api/admin/leads.csv') return handleLeadsCSV(env);
if (path === '/api/admin/callbacks.csv') return handleCallbacksCSV(env);
```

6. Public UI

All embedded frontend JS must remain string-array concatenation. Do not introduce template literals.

Add to lead form payload:
- lead_section: 'lead_form'
- budget_range
- timeline

Add standalone callback widget below lead form. Payload:

```js
{ name, phone, preferred_time, notes, lead_section:'callback_widget', source:'web' }
```

7. Admin UI

Add CSV buttons pointing to:
- /api/admin/leads.csv
- /api/admin/callbacks.csv

Add status dropdowns that call PATCH endpoints.

Deploy bindings:
- V003_2_DB -> c0743318-ee23-4d08-9bd7-0d2b3cc36018
- V003_2_VECTORIZE -> contractor-v003-2-afo-vector
- AI -> ai binding
- V003_2_R2 -> afo-site-content (note: Cf-multipart legacy deploy_worker_with_bindings may not support r2_bucket; cf-multipart-vnext-r2 does)
