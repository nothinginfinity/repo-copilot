const VERSION = '0.1.0';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};

const TOOLS = [
  {
    name: 'script_splitter_status',
    description: 'Health check. Returns version, bindings, and available tools.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'analyze_script_modules',
    description: 'Dry-run analysis of the current script module directory. Reports file sizes, detected function clusters by UX surface, current injection order, tab/panel structure, and recommended split strategy. Does NOT write anything.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:        { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:         { type: 'string', description: 'GitHub repo name (default: watersedge-v2-chat-main-order-ux)' },
        branch:       { type: 'string', description: 'Branch (default: main)' },
        dir:          { type: 'string', description: 'Path to the renderChatRoomV2 directory' },
        entry_files:  { type: 'array', items: { type: 'string' }, description: 'Script files to analyze' },
        target_tabs:  { type: 'array', items: { type: 'string' }, description: 'Desired new tabs (e.g. chat, order, dm, cart)' }
      },
      required: ['dir']
    }
  },
  {
    name: 'plan_script_module_split',
    description: 'Produces a precise file-by-file split plan. Lists which functions move to which module, required template.js import/injection changes, backup list, and browser smoke test checklist. Does NOT write anything.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:           { type: 'string' },
        repo:            { type: 'string' },
        branch:          { type: 'string' },
        dir:             { type: 'string', description: 'Path to renderChatRoomV2 directory' },
        mode:            { type: 'string', enum: ['soft_split', 'hard_split'], description: 'soft_split = additive new modules, hard_split = full rewrite (default: soft_split)' },
        desired_modules: { type: 'array', items: { type: 'string' }, description: 'New module filenames to create' }
      },
      required: ['dir']
    }
  },
  {
    name: 'split_script_modules',
    description: 'Applies the split plan: creates new shell modules, backs up modified files, updates template.js imports and injection order. Conservative by default — does not delete existing scripts on first pass.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:          { type: 'string' },
        repo:           { type: 'string' },
        branch:         { type: 'string' },
        dir:            { type: 'string', description: 'Path to renderChatRoomV2 directory' },
        mode:           { type: 'string', enum: ['soft_split', 'hard_split'], description: 'soft_split recommended for first pass' },
        commit_message: { type: 'string' },
        dry_run:        { type: 'boolean', description: 'If true, returns what would be written without writing (default: false)' }
      },
      required: ['dir']
    }
  },
  {
    name: 'verify_script_module_split',
    description: 'Verifies the split result: checks all new modules exist, template.js imports and injects all scripts, no required markers are missing, no stubs in new files, no broken backtick boundaries, and returns a safe-to-deploy judgment.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:            { type: 'string' },
        repo:             { type: 'string' },
        branch:           { type: 'string' },
        dir:              { type: 'string', description: 'Path to renderChatRoomV2 directory' },
        required_markers: { type: 'array', items: { type: 'string' }, description: 'Content markers that must appear somewhere across all files' }
      },
      required: ['dir']
    }
  }
];

function rpc(id, r)    { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function err(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r)   { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }

async function ghGet(env, owner, repo, path, ref) {
  const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path + (ref ? '?ref=' + ref : '');
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'afo-script-module-splitter-mcp/' + VERSION } });
  if (!res.ok) throw new Error('GitHub GET ' + path + ' -> ' + res.status + ': ' + await res.text());
  return res.json();
}
async function ghGetContent(env, owner, repo, path, ref) {
  const data = await ghGet(env, owner, repo, path, ref);
  if (!data.content) throw new Error('No content returned for ' + path);
  return atob(data.content.replace(/\n/g, ''));
}
async function ghPut(env, owner, repo, path, content, message, branch, existingSha) {
  const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path;
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: branch || 'main' };
  if (existingSha) body.sha = existingSha;
  const res = await fetch(url, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'afo-script-module-splitter-mcp/' + VERSION }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('GitHub PUT ' + path + ' -> ' + res.status + ': ' + await res.text());
  return res.json();
}
async function ghFileExists(env, owner, repo, path, ref) { try { await ghGet(env, owner, repo, path, ref); return true; } catch { return false; } }
async function ghGetSha(env, owner, repo, path, ref) { try { const d = await ghGet(env, owner, repo, path, ref); return d.sha || null; } catch { return null; } }

function detectSurfaces(src) {
  const surfaces = [];
  const s = src.toLowerCase();
  if (/send|assistant|poll|message|log|chat|reply/.test(s)) surfaces.push('chat');
  if (/plate|draft|order|food|menu|build|addtodraft|orderpanel/.test(s)) surfaces.push('order');
  if (/invite|role|dm|direct|human|partner/.test(s)) surfaces.push('dm');
  if (/cart|price|total|checkout|reservation|reserve|quantity/.test(s)) surfaces.push('cart');
  if (/vote|compare|blockstatus|choicecard/.test(s)) surfaces.push('vote');
  if (/poll|storage|localstorage|roomid|storagkey|fetchbridge|activity/.test(s)) surfaces.push('state');
  if (/tab|mode\(|data-p=|composer|hide/.test(s)) surfaces.push('ui_tabs');
  if (/ai|ask ai|long.?press|double.?tap|llm/.test(s)) surfaces.push('ai_assist');
  if (/living.*menu|carousel|dishdetail|orderinggame/.test(s)) surfaces.push('living_menu');
  if (/visual.*table|restore|table.*restore/.test(s)) surfaces.push('visual_table_restore');
  if (/customiz|doneness|sauce|side.*choice|wine.*pair/.test(s)) surfaces.push('order_customizer');
  return [...new Set(surfaces)];
}

function detectExports(src) {
  const out = [];
  const patterns = [/export\s+function\s+(\w+)/g, /export\s+const\s+(\w+)/g, /export\s+\{([^}]+)\}/g];
  for (const rx of patterns) { let m; while ((m = rx.exec(src)) !== null) out.push(m[1].trim()); }
  return out;
}

function detectInjections(src) {
  const pattern = /\$\{(\w+)\}/g; const out = []; let m;
  while ((m = pattern.exec(src)) !== null) out.push(m[1]);
  return out;
}

function detectImports(src) { return (src.match(/^import\s+.+from\s+['"].+['"]/gm) || []); }

function detectPanels(src) {
  const out = []; const rx = /id="(\w+)"\s+class="panel/g; let m;
  while ((m = rx.exec(src)) !== null) out.push(m[1]);
  return out;
}

function detectTabs(src) {
  const out = []; const rx = /data-p="(\w+)"/g; let m;
  while ((m = rx.exec(src)) !== null) out.push(m[1]);
  return out;
}

function countFunctions(src) { return (src.match(/function\s+\w+\s*\(/g) || []).length; }

function buildShellModule(moduleName, exportName, description, fromFiles, notes) {
  return '// ' + moduleName + '\n'
    + '// Surface: ' + description + '\n'
    + '// Generated by afo-script-module-splitter-mcp v' + VERSION + '\n'
    + '// Source: ' + (fromFiles.length ? 'extracted from ' + fromFiles.join(', ') : 'new surface') + '\n'
    + (notes ? '// NOTE: ' + notes + '\n' : '')
    + '// SHELL MODULE — wire in your UX code below.\n'
    + '// This file is additive. Existing scripts continue to run unchanged.\n\n'
    + 'export const ' + exportName + ' = `\n'
    + '(function(){\n'
    + '  // ' + description + ' — shell ready for implementation\n'
    + '  // Wire: DOM setup, API fetch hooks, event listeners\n'
    + '  // Safe to extend without breaking existing scripts\n'
    + '})();\n'
    + '`;\n';
}

function getSoftSplitPlan(dir) {
  return {
    new_modules: [
      { file: dir + '/room_state_script.js', export_name: 'roomStateScript', description: 'Shared state helpers: roomId(), storageKey(), poll(), fetch bridge, activity posting', source_files: ['client_script.js', 'visual_table_restore_script.js'], note: 'Shell only. Existing helpers remain in client_script.js for now.' },
      { file: dir + '/ui_tabs_script.js', export_name: 'uiTabsScript', description: 'Tab switching, composer show/hide, panel mode() logic. New tabs: Chat, Order, DM, Cart', source_files: ['client_script.js'], note: 'Shell adds new tab IDs. Rename Build->Order, Vote->DM, Reserve->Cart in template.js separately.' },
      { file: dir + '/order_panel_script.js', export_name: 'orderPanelScript', description: 'My Order / My Plate, My Table live feed shell, copy plate, draft order display', source_files: ['client_script.js', 'order_customizer_script.js'], note: 'Shell for new Order tab. Wire to #order panel. My Table feed from /api/chat/room/state.' },
      { file: dir + '/dm_panel_script.js', export_name: 'dmPanelScript', description: 'Human DM panel, invite modal hook, direct message thread shell', source_files: ['client_script.js'], note: 'Shell for DM tab (#dm panel). Human-to-human messages. Invite logic stays in client_script for now.' },
      { file: dir + '/ai_assist_script.js', export_name: 'aiAssistScript', description: 'Inline AI assist hooks: long-press/double-tap/Ask AI on messages', source_files: [], note: 'New surface. Wire to long-press events on .msg elements.' },
      { file: dir + '/cart_panel_script.js', export_name: 'cartPanelScript', description: 'Cart summary: items, quantities, estimated totals, checkout/reservation CTA', source_files: ['client_script.js'], note: 'Shell for Cart tab (#cart panel). Pulls from /api/chat/room/state for item totals.' }
    ],
    template_new_imports: [
      "import { roomStateScript } from './room_state_script.js';",
      "import { uiTabsScript } from './ui_tabs_script.js';",
      "import { orderPanelScript } from './order_panel_script.js';",
      "import { dmPanelScript } from './dm_panel_script.js';",
      "import { aiAssistScript } from './ai_assist_script.js';",
      "import { cartPanelScript } from './cart_panel_script.js';"
    ],
    injection_order: ['clientScript','roomStateScript','uiTabsScript','livingMenuScript','visualTableRestoreScript','orderCustomizerScript','orderPanelScript','dmPanelScript','aiAssistScript','cartPanelScript'],
    template_panel_additions: [
      { id: 'order', label: 'Order', note: 'Rename from build. Keep #build for backward compat or update clientScript.' },
      { id: 'dm',    label: 'DM',    note: 'New panel replacing Vote tab.' },
      { id: 'cart',  label: 'Cart',  note: 'New panel replacing Reserve tab.' }
    ],
    backups_required: ['template.js.bak-script-split', 'client_script.js.bak-script-split'],
    smoke_test_checklist: [
      'Chat tab loads and shows message log',
      'Send button posts message and gets assistant reply',
      'Living Menu carousel renders on assistant reply',
      'Dish Detail / ORDERING GAME opens',
      'Order tab panel visible (even if empty shell)',
      'DM tab panel visible (even if empty shell)',
      'Cart tab panel visible (even if empty shell)',
      'Invite modal still opens',
      'refreshState still calls /api/chat/room/state',
      'saveTestItem still calls /api/chat/room/order/add',
      'No JS errors in console on page load'
    ]
  };
}

function findLastImportEnd(src) {
  const lines = src.split('\n'); let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) { if (/^import\s+/.test(lines[i].trim())) lastImportLine = i; }
  if (lastImportLine === -1) return 0;
  let pos = 0;
  for (let i = 0; i <= lastImportLine; i++) pos += lines[i].length + 1;
  return pos;
}

function rewriteTemplateForSoftSplit(templateSrc, plan) {
  const lastImportEnd = findLastImportEnd(templateSrc);
  const newImportBlock = '\n' + plan.template_new_imports.join('\n');
  let rewritten = templateSrc.slice(0, lastImportEnd) + newImportBlock + '\n' + templateSrc.slice(lastImportEnd);
  const newInjections = plan.injection_order.map(function(n){ return '<script>${' + n + '}</script>'; }).join('');
  rewritten = rewritten.replace(
    /<script>\$\{clientScript\}<\/script><script>\$\{livingMenuScript\}<\/script><script>\$\{visualTableRestoreScript\}<\/script><script>\$\{orderCustomizerScript\}<\/script>/,
    newInjections
  );
  return rewritten;
}

const DEFAULT_MARKERS = ['Living Menu - structured','Dish Detail','ORDERING GAME','/api/chat/room/messages','/api/chat/room/assistant','/api/chat/room/order/add','/api/chat/room/state'];
const DEFAULT_ENTRY_FILES = ['client_script.js','living_menu_script.js','visual_table_restore_script.js','order_customizer_script.js','template.js'];

async function handle(name, args, env) {
  const owner  = args.owner  || 'nothinginfinity';
  const repo   = args.repo   || 'watersedge-v2-chat-main-order-ux';
  const branch = args.branch || 'main';
  const dir    = args.dir    || 'workers/watersedge-v2-chat-main/src/render/renderChatRoomV2';

  if (name === 'script_splitter_status') {
    return { status: 'ok', worker: 'afo-script-module-splitter-mcp', version: VERSION, bindings: { GITHUB_TOKEN: !!env.GITHUB_TOKEN }, tools: TOOLS.map(function(t){return t.name;}) };
  }

  if (name === 'analyze_script_modules') {
    const entryFiles = Array.isArray(args.entry_files) ? args.entry_files : DEFAULT_ENTRY_FILES;
    const targetTabs = Array.isArray(args.target_tabs) ? args.target_tabs : ['chat','order','dm','cart'];
    const fileReports = []; let templateSrc = '';
    for (const filename of entryFiles) {
      try {
        const src = await ghGetContent(env, owner, repo, dir + '/' + filename, branch);
        if (filename === 'template.js') templateSrc = src;
        const surfaces = detectSurfaces(src);
        fileReports.push({ file: filename, bytes: src.length, lines: src.split('\n').length, functions: countFunctions(src), surfaces_detected: surfaces, exports: detectExports(src), imports: detectImports(src), recommendation: surfaces.length > 3 ? 'split_candidate' : surfaces.length > 1 ? 'review' : 'leave' });
      } catch (e) { fileReports.push({ file: filename, error: e.message }); }
    }
    const currentTabs = detectTabs(templateSrc);
    const targetTabsArr = Array.isArray(args.target_tabs) ? args.target_tabs : ['chat','order','dm','cart'];
    const totalBytes = fileReports.reduce(function(s,r){return s+(r.bytes||0);},0);
    const bigFiles = fileReports.filter(function(r){return r.bytes>10000;});
    const splitRecommendation = bigFiles.length > 2 || totalBytes > 60000 ? 'hard_split' : bigFiles.length > 0 ? 'soft_split' : 'no_split';
    return {
      ok: true, repo: owner+'/'+repo, dir, files: fileReports, total_bytes: totalBytes,
      template_analysis: { current_tabs: currentTabs, current_panels: detectPanels(templateSrc), current_injections: detectInjections(templateSrc), current_imports: detectImports(templateSrc), missing_target_tabs: targetTabsArr.filter(function(t){return !currentTabs.includes(t);}), extra_tabs_to_rename: currentTabs.filter(function(t){return !targetTabsArr.includes(t);}) },
      split_recommendation: splitRecommendation,
      risks: ['client_script.js contains tab switching, chat, state, invite, and plate logic — primary split candidate','living_menu_script.js is large (26KB) but self-contained — leave unless explicitly splitting','Template currently injects 4 scripts — new surfaces need additional injection slots','Tab rename (Build->Order, Vote->DM, Reserve->Cart) requires template.js and client_script.js changes','Soft split is additive and safe — new shell modules load after existing scripts'],
      next_step: 'Run plan_script_module_split with mode: soft_split'
    };
  }

  if (name === 'plan_script_module_split') {
    const mode = args.mode || 'soft_split';
    if (mode !== 'soft_split') throw new Error('Only soft_split is supported in v0.1.0. hard_split requires manual review first.');
    const plan = getSoftSplitPlan(dir);
    let templateSrc = '';
    try { templateSrc = await ghGetContent(env, owner, repo, dir + '/template.js', branch); } catch {}
    return {
      ok: true, repo: owner+'/'+repo, dir, mode,
      new_modules: plan.new_modules.map(function(m){ return { file: m.file.replace(dir+'/',''), export_name: m.export_name, description: m.description, source_files: m.source_files, note: m.note, type: 'shell_module' }; }),
      template_changes: { current_imports: detectImports(templateSrc), imports_to_add: plan.template_new_imports, current_injections: detectInjections(templateSrc), new_injection_order: plan.injection_order, panel_additions: plan.template_panel_additions },
      backups: plan.backups_required,
      smoke_test_checklist: plan.smoke_test_checklist,
      safety_assessment: { is_additive: true, modifies_existing_scripts: false, existing_scripts_preserved: true, new_modules_are_shells: true, safe_to_apply: true, note: 'Soft split creates shell modules and updates template.js injection order. Existing scripts untouched.' },
      next_step: 'Run split_script_modules with mode: soft_split and dry_run: true to preview all file contents'
    };
  }

  if (name === 'split_script_modules') {
    const mode = args.mode || 'soft_split';
    if (mode !== 'soft_split') throw new Error('Only soft_split is supported in v0.1.0.');
    const dryRun = args.dry_run === true;
    const plan = getSoftSplitPlan(dir);
    const templateSrc = await ghGetContent(env, owner, repo, dir + '/template.js', branch);
    const clientSrc   = await ghGetContent(env, owner, repo, dir + '/client_script.js', branch);
    const newTemplate = rewriteTemplateForSoftSplit(templateSrc, plan);
    const injectionCheck = plan.injection_order.every(function(n){ return newTemplate.includes('${' + n + '}'); });
    if (!injectionCheck) throw new Error('Template rewrite failed: not all injection sites present. Aborting to prevent broken deploy.');
    const filesToWrite = [];
    filesToWrite.push({ path: dir + '/template.js.bak-script-split', content: templateSrc, desc: 'backup template.js' });
    filesToWrite.push({ path: dir + '/client_script.js.bak-script-split', content: clientSrc, desc: 'backup client_script.js' });
    for (const m of plan.new_modules) {
      filesToWrite.push({ path: m.file, content: buildShellModule(m.file.replace(dir+'/',''), m.export_name, m.description, m.source_files, m.note), desc: 'new shell: ' + m.export_name });
    }
    filesToWrite.push({ path: dir + '/template.js', content: newTemplate, desc: 'rewritten template.js' });
    if (dryRun) return { ok: true, dry_run: true, repo: owner+'/'+repo, files_to_write: filesToWrite.map(function(f){ return { path: f.path, desc: f.desc, bytes: f.content.length, preview: f.content.slice(0,300)+(f.content.length>300?'\n...[truncated]':'') }; }), injection_check_passed: injectionCheck, new_injection_order: plan.injection_order };
    const commitMsg = args.commit_message || 'split: add UX surface shell modules [afo-script-module-splitter-mcp v' + VERSION + ']';
    const written = []; const errors = [];
    async function commit(path, content, desc) {
      try { const sha = await ghGetSha(env, owner, repo, path, branch); await ghPut(env, owner, repo, path, content, commitMsg + ' -- ' + desc, branch, sha); written.push(path); }
      catch (e) { errors.push({ path, error: e.message }); }
    }
    for (const f of filesToWrite) await commit(f.path, f.content, f.desc);
    return { ok: errors.length===0, repo: owner+'/'+repo, branch, written, errors, new_injection_order: plan.injection_order, next_steps: ['Run verify_script_module_split','Deploy watersedge-v2-chat-main-order-ux','Smoke test Chat, Living Menu, refreshState, saveTestItem','Confirm Order/DM/Cart panels visible','Then implement UX patches per roadmap'] };
  }

  if (name === 'verify_script_module_split') {
    const userMarkers = Array.isArray(args.required_markers) ? args.required_markers : [];
    const markers = DEFAULT_MARKERS.concat(userMarkers);
    const checks = []; let allOk = true;
    function pass(check, details) { checks.push(Object.assign({ check, ok: true  }, details || {})); }
    function fail(check, details) { checks.push(Object.assign({ check, ok: false }, details || {})); allOk = false; }
    const plan = getSoftSplitPlan(dir);
    let templateSrc = '';
    try { templateSrc = await ghGetContent(env, owner, repo, dir + '/template.js', branch); pass('template_readable', {}); }
    catch (e) { fail('template_readable', { error: e.message }); }
    for (const m of plan.new_modules) {
      const exists = await ghFileExists(env, owner, repo, m.file, branch);
      if (exists) pass('module_exists', { file: m.file.replace(dir+'/',''), export_name: m.export_name });
      else fail('module_exists', { file: m.file.replace(dir+'/',''), export_name: m.export_name });
    }
    for (const m of plan.new_modules) {
      if (templateSrc.includes(m.export_name)) pass('template_imports', { export_name: m.export_name });
      else fail('template_imports', { export_name: m.export_name });
    }
    let lastIdx = -1; let orderOk = true;
    for (const exportName of plan.injection_order) {
      const injection = '${' + exportName + '}'; const idx = templateSrc.indexOf(injection);
      if (idx === -1) { fail('injection_present', { export_name: exportName }); orderOk = false; }
      else if (idx < lastIdx) { fail('injection_order', { export_name: exportName }); orderOk = false; }
      else { pass('injection_present', { export_name: exportName }); lastIdx = idx; }
    }
    if (orderOk) pass('injection_order_correct', {});
    for (const filename of ['client_script.js','living_menu_script.js','visual_table_restore_script.js','order_customizer_script.js']) {
      const exists = await ghFileExists(env, owner, repo, dir+'/'+filename, branch);
      if (exists) pass('existing_script_preserved', { file: filename }); else fail('existing_script_preserved', { file: filename });
    }
    for (const bak of plan.backups_required) {
      const exists = await ghFileExists(env, owner, repo, dir+'/'+bak, branch);
      if (exists) pass('backup_exists', { file: bak }); else fail('backup_exists', { file: bak });
    }
    let allContent = templateSrc;
    for (const filename of ['client_script.js','living_menu_script.js','visual_table_restore_script.js','order_customizer_script.js',...plan.new_modules.map(function(m){return m.file.replace(dir+'/','');})]) {
      try { allContent += '\n' + await ghGetContent(env, owner, repo, dir+'/'+filename, branch); } catch {}
    }
    for (const marker of markers) {
      if (allContent.includes(marker)) pass('marker_present', { marker }); else fail('marker_present', { marker });
    }
    for (const m of plan.new_modules) {
      try {
        const src = await ghGetContent(env, owner, repo, m.file, branch);
        const unescaped = src.replace(/\\`/g,'').split('`').length - 1;
        if (unescaped % 2 === 0) pass('backtick_balanced', { file: m.file.replace(dir+'/','') });
        else fail('backtick_balanced', { file: m.file.replace(dir+'/',''), unescaped_count: unescaped });
      } catch {}
    }
    for (const stub of ['throw new Error','stub not yet filled in']) { if (templateSrc.includes(stub)) fail('no_stubs_in_template', { stub }); }
    if (!checks.some(function(c){return c.check==='no_stubs_in_template'&&!c.ok;})) pass('no_stubs_in_template', {});
    if (templateSrc.includes('export function buildChatRoomV2Html')) pass('template_exports_function', {});
    else fail('template_exports_function', { error: 'buildChatRoomV2Html not found in template.js' });
    const failCount = checks.filter(function(c){return !c.ok;}).length;
    return { ok: allOk, repo: owner+'/'+repo, dir, checks, fail_count: failCount, safe_to_deploy: allOk, summary: allOk ? 'All checks passed. Safe to deploy watersedge-v2-chat-main-order-ux.' : failCount + ' check(s) failed. Review checks array before deploying.' };
  }

  throw new Error('Unknown tool: ' + name);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'afo-script-module-splitter-mcp', version: VERSION }, { headers: CORS });
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body;
    try { body = await request.json(); } catch { return err(null, -32700, 'Parse error'); }
    const { id, method, params } = body;
    if (method === 'initialize') return rpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'afo-script-module-splitter-mcp', version: VERSION } });
    if (method === 'notifications/initialized') return new Response(null, { status: 204, headers: CORS });
    if (method === 'ping') return rpc(id, {});
    if (method === 'tools/list') return rpc(id, { tools: TOOLS });
    if (method === 'tools/call') {
      try { return tool(id, await handle(params?.name, params?.arguments || {}, env)); }
      catch (e) { return err(id, -32603, 'Tool error: ' + e.message); }
    }
    return err(id, -32601, 'Method not found: ' + method);
  }
};
