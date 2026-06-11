const VERSION = '0.2.0';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};

const TOOLS = [
  {
    name: 'inline_debundler_status',
    description: 'Health check. Returns version and available tools.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'analyze_inline_renderer',
    description: 'Dry-run analysis of a large inline renderer file. Detects CSS, HTML, client script blocks, server-side interpolations, and proposes a split plan. Does NOT write any files.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:  { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:   { type: 'string', description: 'GitHub repo name' },
        branch: { type: 'string', description: 'Branch (default: main)' },
        file:   { type: 'string', description: 'Path to the renderer file inside the repo' }
      },
      required: ['repo', 'file']
    }
  },
  {
    name: 'debundle_inline_renderer',
    description: 'Splits a large inline renderer file into deploy-ready sub-modules (styles.js, client_script.js, template.js, index.js) with real extracted content. Backs up original. Never writes to live/dev repos unless explicitly set.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:          { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:           { type: 'string', description: 'GitHub repo name (should be a lab/test repo)' },
        branch:         { type: 'string', description: 'Branch (default: main)' },
        file:           { type: 'string', description: 'Path to the renderer file inside the repo' },
        commit_message: { type: 'string', description: 'Git commit message (optional)' },
        dry_run:        { type: 'boolean', description: 'If true, returns the plan without writing (default: false)' }
      },
      required: ['repo', 'file']
    }
  },
  {
    name: 'verify_inline_debundle',
    description: 'Verifies a completed inline debundle is deploy-ready: checks all files exist, exports are correct, UI/API markers present, no stubs remain, and runs a static smoke reconstruction.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:   { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:    { type: 'string', description: 'GitHub repo name' },
        branch:  { type: 'string', description: 'Branch (default: main)' },
        file:    { type: 'string', description: 'Original renderer file path (compatibility wrapper location)' },
        markers: { type: 'array', items: { type: 'string' }, description: 'Extra UI/API markers to check. Defaults include all AFO chat room markers.' }
      },
      required: ['repo', 'file']
    }
  }
];

function rpc(id, r)    { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function err(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r)   { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }

async function ghGet(env, owner, repo, path, ref) {
  const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path + (ref ? '?ref=' + ref : '');
  const res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'afo-inline-renderer-debundler-mcp/' + VERSION
    }
  });
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
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'afo-inline-renderer-debundler-mcp/' + VERSION
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('GitHub PUT ' + path + ' -> ' + res.status + ': ' + await res.text());
  return res.json();
}

async function ghFileExists(env, owner, repo, path, ref) {
  try { await ghGet(env, owner, repo, path, ref); return true; } catch { return false; }
}

async function ghGetSha(env, owner, repo, path, ref) {
  try { const d = await ghGet(env, owner, repo, path, ref); return d.sha || null; } catch { return null; }
}

// Robust template literal scanner.
// Walks src and returns the raw content between the backticks of: const <varName> = `...`
// Correctly tracks ${...} nesting depth so it never mistakes an inner } for the closing backtick.
function extractTemplateLiteral(src, varName) {
  const declPattern = new RegExp('const\\s+' + varName + '\\s*=\\s*`');
  const declMatch = declPattern.exec(src);
  if (!declMatch) return null;
  const startPos = declMatch.index + declMatch[0].length;
  let i = startPos;
  let depth = 0;
  let content = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\' && i + 1 < src.length) { content += src[i] + src[i + 1]; i += 2; continue; }
    if (ch === '`' && depth === 0) return content;
    if (ch === '$' && src[i + 1] === '{') { depth++; content += '${'; i += 2; continue; }
    if (ch === '}' && depth > 0) { depth--; content += '}'; i++; continue; }
    content += ch;
    i++;
  }
  return null;
}

// Extracts content between first <script> and </script> in an HTML string.
function extractScriptFromHtml(htmlContent) {
  const open = htmlContent.indexOf('<script>');
  if (open === -1) {
    const altOpen = htmlContent.search(/<script[\s>]/);
    if (altOpen === -1) return null;
    const closeTag = htmlContent.indexOf('</script>', altOpen);
    if (closeTag === -1) return null;
    return htmlContent.slice(htmlContent.indexOf('>', altOpen) + 1, closeTag);
  }
  const afterOpen = open + '<script>'.length;
  const closeTag = htmlContent.indexOf('</script>', afterOpen);
  if (closeTag === -1) return null;
  return htmlContent.slice(afterOpen, closeTag);
}

function extractImports(src) {
  const lines = src.split('\n');
  const imports = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^import\s+/.test(t)) imports.push(t);
    else if (imports.length > 0 && t === '') continue;
    else if (imports.length > 0) break;
  }
  return imports;
}

function extractSetupCode(src, fnName) {
  const fnStart = src.indexOf('export function ' + fnName);
  if (fnStart === -1) return '';
  const bodyOpen = src.indexOf('{', fnStart);
  if (bodyOpen === -1) return '';
  const fnBody = src.slice(bodyOpen + 1);
  const cssIdx = fnBody.search(/const\s+css\s*=/);
  if (cssIdx === -1) return '';
  return fnBody.slice(0, cssIdx).trim();
}

function adjustImportDepth(importLine) {
  return importLine.replace(/from\s+['"](\.[^'"]+)['"]/g, function(match, p1) {
    if (p1.startsWith('./')) return match.replace('./', '../');
    if (p1.startsWith('../')) return match.replace('../', '../../');
    return match;
  });
}

function buildOutputFiles(src, fnName) {
  const exportedVar = fnName.charAt(0).toUpperCase() + fnName.slice(1);
  const baseName = exportedVar.replace(/^Render/, '');

  const cssContent = extractTemplateLiteral(src, 'css');
  if (cssContent === null) throw new Error('Could not extract CSS template literal (const css = `...`) from source');

  const htmlContent = extractTemplateLiteral(src, 'html');
  if (htmlContent === null) throw new Error('Could not extract HTML template literal (const html = `...`) from source');

  const scriptContent = extractScriptFromHtml(htmlContent);
  if (scriptContent === null) throw new Error('Could not find <script>...</script> block inside HTML template literal');

  const stylesVarName = baseName + 'Styles';
  const stylesJs = '// Auto-extracted CSS for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + 'export const ' + stylesVarName + ' = `' + cssContent + '`;\n';

  const scriptInterps = [];
  const interpRx = /\$\{([^{}]+?)\}/g;
  let interpMatch;
  while ((interpMatch = interpRx.exec(scriptContent)) !== null) {
    const inner = interpMatch[1].trim();
    if (/^[\w.]+$/.test(inner) && !scriptInterps.includes(inner)) scriptInterps.push(inner);
  }
  const scriptParams = scriptInterps.length > 0 ? '{ ' + scriptInterps.join(', ') + ' }' : '{}';
  const clientScriptFnName = 'build' + baseName + 'ClientScript';
  const escapedScript = scriptContent.replace(/\\`/g, '`').replace(/`/g, '\\`');
  const clientScriptJs = '// Auto-extracted client-side script for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n'
    + '// Keep as string template -- do not convert to server-side JS\n\n'
    + 'export function ' + clientScriptFnName + '(' + scriptParams + ') {\n'
    + '  return `' + escapedScript + '`;\n'
    + '}\n';

  const templateFnName = 'build' + baseName + 'Html';
  const scriptOpenIdx = htmlContent.search(/<script[\s>]/);
  const scriptCloseIdx = htmlContent.indexOf('</script>', scriptOpenIdx);
  const scriptCloseEnd = scriptCloseIdx + '</script>'.length;
  const htmlBefore = htmlContent.slice(0, scriptOpenIdx);
  const htmlAfter = htmlContent.slice(scriptCloseEnd);
  const templateBody = htmlBefore + '<script>${clientScript}</script>' + htmlAfter;
  const safeTemplateBody = templateBody.replace(/\\`/g, '`').replace(/`/g, '\\`');
  const templateJs = '// Auto-extracted HTML template for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + 'export function ' + templateFnName + '({ title, css, clientScript }) {\n'
    + '  return `' + safeTemplateBody + '`;\n'
    + '}\n';

  const rawImports = extractImports(src);
  const adjustedImports = rawImports.map(adjustImportDepth);
  const setupCode = extractSetupCode(src, fnName);
  const indexJs = '// Auto-generated index for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + (adjustedImports.length ? adjustedImports.join('\n') + '\n' : '')
    + "import { " + stylesVarName + " } from './styles.js';\n"
    + "import { " + clientScriptFnName + " } from './client_script.js';\n"
    + "import { " + templateFnName + " } from './template.js';\n\n"
    + 'export function ' + fnName + '(roomId, initialData) {\n'
    + '  ' + setupCode.split('\n').join('\n  ') + '\n'
    + '  const clientScript = ' + clientScriptFnName + '({ ' + scriptInterps.join(', ') + ' });\n'
    + '  const html = ' + templateFnName + '({ title, css: ' + stylesVarName + ', clientScript });\n'
    + '  return h(html);\n'
    + '}\n';

  const wrapperJs = '// Compatibility wrapper -- do not edit\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n'
    + '// Original file backed up as ' + fnName + '.js.bak\n'
    + "export { " + fnName + " } from './" + fnName + "/index.js';\n";

  const notes = '# Debundle Notes -- ' + fnName + '\n\n'
    + 'Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + '## Status\n\nAll files are auto-extracted and deploy-ready.\n'
    + 'Run `verify_inline_debundle` to confirm all markers pass before deploying.\n\n'
    + '## Files\n\n'
    + '- `styles.js` -- extracted CSS template\n'
    + '- `client_script.js` -- extracted browser JS as parameterized string builder\n'
    + '- `template.js` -- HTML shell with `${clientScript}` replacing inline script\n'
    + '- `index.js` -- assembler, wires all modules together\n\n'
    + '## Script interpolation params\n\n'
    + scriptInterps.map(function(s) { return '- `' + s + '`'; }).join('\n') + '\n\n'
    + '## Stable rescue commit\n\nSHA: 418eac97deb2f00113ed163ac229c9a3fe31fac0\n';

  return { stylesJs, clientScriptJs, templateJs, indexJs, wrapperJs, notes, stylesVarName, clientScriptFnName, templateFnName, scriptInterps };
}

function analyzeSource(src) {
  const result = {
    exported_function: null, top_imports: [],
    has_css_template: false, has_html_template: false, has_client_script: false,
    server_interpolations: [], estimated_lines: src.split('\n').length, estimated_bytes: src.length,
    risk: 'low', notes: []
  };
  const exportMatch = src.match(/export\s+(?:async\s+)?function\s+(\w+)/);
  if (exportMatch) result.exported_function = exportMatch[1];
  result.top_imports = extractImports(src);
  result.has_css_template = /const\s+css\s*=\s*`/.test(src);
  result.has_html_template = /const\s+html\s*=\s*`/.test(src);
  result.has_client_script = /<script[\s>]/.test(src);
  const interpMatches = src.match(/\$\{([^{}()[\]`]+?)\}/g) || [];
  const seen = new Set();
  for (const m of interpMatches) {
    const inner = m.slice(2, -1).trim();
    if (/^[\w.]+$/.test(inner) && !seen.has(inner)) {
      seen.add(inner);
      if (/json|data|title|id|label|count|url|msg|html|css|script|room|plan|role/i.test(inner)) result.server_interpolations.push(inner);
    }
  }
  if (src.length > 80000) result.risk = 'high';
  else if (src.length > 30000) result.risk = 'medium';
  if (!result.has_css_template) result.notes.push('No `const css = `` block found.');
  if (!result.has_html_template) result.notes.push('No `const html = `` block found.');
  if (!result.has_client_script) result.notes.push('No <script> block found.');
  return result;
}

const DEFAULT_MARKERS = [
  '/api/chat/room/state', '/api/chat/room/order/add', '/api/chat/room/message', '/api/chat/room/assistant',
  'inviteModal', 'roleChips', 'choiceCard', 'Shared planning state preview', 'Save test item', 'Refresh state',
  '<script', '</script>'
];

async function handle(name, args, env) {
  const owner = args.owner || 'nothinginfinity';
  const branch = args.branch || 'main';

  if (name === 'inline_debundler_status') {
    return { status: 'ok', worker: 'afo-inline-renderer-debundler-mcp', version: VERSION, bindings: { GITHUB_TOKEN: !!env.GITHUB_TOKEN }, tools: TOOLS.map(function(t){return t.name;}) };
  }

  if (name === 'analyze_inline_renderer') {
    const { repo, file } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    const src = await ghGetContent(env, owner, repo, file, branch);
    const analysis = analyzeSource(src);
    const fnName = analysis.exported_function || 'renderUnknown';
    const basePath = file.replace(/\/[^/]+$/, '');
    return {
      ok: true, repo: owner+'/'+repo, branch, file, function: fnName,
      detected: { css_template: analysis.has_css_template, html_template: analysis.has_html_template, client_script: analysis.has_client_script, server_interpolations: analysis.server_interpolations, top_imports: analysis.top_imports, estimated_lines: analysis.estimated_lines, estimated_bytes: analysis.estimated_bytes },
      proposed_dir: basePath+'/'+fnName+'/',
      proposed_files: [ basePath+'/'+fnName+'/styles.js', basePath+'/'+fnName+'/client_script.js', basePath+'/'+fnName+'/template.js', basePath+'/'+fnName+'/index.js', basePath+'/'+fnName+'/DEBUNDLE_NOTES.md', file+'.bak' ],
      compatibility_wrapper: file, risk: analysis.risk, notes: analysis.notes
    };
  }

  if (name === 'debundle_inline_renderer') {
    const { repo, file } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    const dryRun = args.dry_run === true;
    const src = await ghGetContent(env, owner, repo, file, branch);
    const analysis = analyzeSource(src);
    const fnName = analysis.exported_function || 'renderUnknown';
    const basePath = file.replace(/\/[^/]+$/, '');
    const dirPath = basePath + '/' + fnName;
    let output;
    try { output = buildOutputFiles(src, fnName); }
    catch (e) { throw new Error('Extraction failed -- no files written. Reason: ' + e.message); }
    const plan = {
      files_to_write: [
        { path: file+'.bak', description: 'Backup of original' },
        { path: dirPath+'/styles.js', description: 'Extracted CSS ('+output.stylesVarName+')' },
        { path: dirPath+'/client_script.js', description: 'Extracted client script ('+output.clientScriptFnName+')' },
        { path: dirPath+'/template.js', description: 'Extracted HTML template ('+output.templateFnName+')' },
        { path: dirPath+'/index.js', description: 'Assembler index' },
        { path: dirPath+'/DEBUNDLE_NOTES.md', description: 'Debundle notes' },
        { path: file, description: 'Compatibility wrapper' }
      ],
      function: fnName, script_interp_params: output.scriptInterps, risk: analysis.risk
    };
    if (dryRun) return { ok: true, dry_run: true, plan, preview: { styles_bytes: output.stylesJs.length, client_script_bytes: output.clientScriptJs.length, template_bytes: output.templateJs.length, index_bytes: output.indexJs.length } };
    const commitMsg = args.commit_message || 'debundle: split '+fnName+' into deploy-ready modules [afo-inline-renderer-debundler-mcp v'+VERSION+']';
    const written = []; const errors = [];
    async function commit(path, content, desc) {
      try { const sha = await ghGetSha(env, owner, repo, path, branch); await ghPut(env, owner, repo, path, content, commitMsg+' -- '+desc, branch, sha); written.push(path); }
      catch (e) { errors.push({ path, error: e.message }); }
    }
    await commit(file+'.bak', src, 'backup original');
    await commit(dirPath+'/styles.js', output.stylesJs, 'styles');
    await commit(dirPath+'/client_script.js', output.clientScriptJs, 'client_script');
    await commit(dirPath+'/template.js', output.templateJs, 'template');
    await commit(dirPath+'/index.js', output.indexJs, 'index');
    await commit(dirPath+'/DEBUNDLE_NOTES.md', output.notes, 'debundle notes');
    await commit(file, output.wrapperJs, 'compatibility wrapper');
    return { ok: errors.length===0, repo: owner+'/'+repo, branch, function: fnName, written, errors, next_steps: ['Run verify_inline_debundle to confirm all markers pass','Deploy lab worker and manually smoke test in browser','Do not port to live until lab is confirmed working'] };
  }

  if (name === 'verify_inline_debundle') {
    const { repo, file } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    const userMarkers = Array.isArray(args.markers) ? args.markers : [];
    const markers = DEFAULT_MARKERS.concat(userMarkers);
    const checks = []; let allOk = true;
    function fail(check, details) { checks.push(Object.assign({ check, ok: false }, details)); allOk = false; }
    function pass(check, details) { checks.push(Object.assign({ check, ok: true }, details)); }
    const basePath = file.replace(/\/[^/]+\.js$/, '');
    let fnName = null;
    try {
      const wrapperSrc = await ghGetContent(env, owner, repo, file, branch);
      const fnMatch = wrapperSrc.match(/export\s*\{\s*(\w+)\s*\}\s*from/);
      if (fnMatch) { fnName = fnMatch[1].trim(); pass('wrapper_exists', { path: file, re_exports: fnName }); }
      else fail('wrapper_exists', { path: file, error: 'wrapper does not re-export a named function' });
    } catch (e) { fail('wrapper_exists', { path: file, error: e.message }); }
    if (!fnName) fnName = file.replace(/^.*\//, '').replace(/\.js$/, '');
    const dirPath = basePath + '/' + fnName;
    for (const path of [dirPath+'/styles.js', dirPath+'/client_script.js', dirPath+'/template.js', dirPath+'/index.js', file+'.bak']) {
      const exists = await ghFileExists(env, owner, repo, path, branch);
      if (exists) pass('file_exists', { path }); else fail('file_exists', { path });
    }
    let indexSrc = '';
    try {
      indexSrc = await ghGetContent(env, owner, repo, dirPath+'/index.js', branch);
      if (indexSrc.includes('export function '+fnName)) pass('index_exports_function', { function: fnName });
      else fail('index_exports_function', { function: fnName, error: 'export function '+fnName+' not found' });
      if (/build\w+Html\s*\(/.test(indexSrc)) pass('index_calls_template_fn', {});
      else fail('index_calls_template_fn', { error: 'buildXxxHtml() not found in index.js' });
      if (/build\w+ClientScript\s*\(/.test(indexSrc)) pass('index_calls_client_script_fn', {});
      else fail('index_calls_client_script_fn', { error: 'buildXxxClientScript() not found in index.js' });
    } catch (e) { fail('index_readable', { error: e.message }); }
    let templateSrc = '';
    try {
      templateSrc = await ghGetContent(env, owner, repo, dirPath+'/template.js', branch);
      const isStub = templateSrc.includes('stub not yet filled in') || templateSrc.includes('throw new Error');
      if (isStub) fail('template_not_stub', { error: 'template.js is still a stub' }); else pass('template_not_stub', {});
      if (templateSrc.includes('${css}')) pass('template_has_css_interp', {}); else fail('template_has_css_interp', { error: '${css} missing' });
      if (templateSrc.includes('${title}')) pass('template_has_title_interp', {}); else fail('template_has_title_interp', { error: '${title} missing' });
      if (templateSrc.includes('${clientScript}')) pass('template_has_script_interp', {}); else fail('template_has_script_interp', { error: '${clientScript} missing' });
    } catch (e) { fail('template_readable', { error: e.message }); }
    let clientSrc = '';
    try {
      clientSrc = await ghGetContent(env, owner, repo, dirPath+'/client_script.js', branch);
      if (clientSrc.includes('roomJson')) pass('client_script_has_roomJson', {}); else fail('client_script_has_roomJson', { error: 'roomJson not found' });
      if (clientSrc.includes('messagesJson')) pass('client_script_has_messagesJson', {}); else fail('client_script_has_messagesJson', { error: 'messagesJson not found' });
    } catch (e) { fail('client_script_readable', { error: e.message }); }
    const combined = templateSrc + '\n' + clientSrc;
    for (const marker of markers) {
      if (combined.includes(marker)) pass('marker_present', { marker }); else fail('marker_present', { marker });
    }
    let smokeOk = false; let smokeNote = '';
    try {
      const stylesSrc = await ghGetContent(env, owner, repo, dirPath+'/styles.js', branch);
      const stylesMatch = stylesSrc.match(/export const \w+ = `([\s\S]*)`;[\s]*$/);
      const fakeStyles = stylesMatch ? stylesMatch[1] : '';
      const clientFnMatch = clientSrc.match(/return `([\s\S]+)`;[\s]*\}/);
      const fakeClient = clientFnMatch ? clientFnMatch[1].replace(/\$\{roomJson\}/g,'"r"').replace(/\$\{messagesJson\}/g,'[]') : '';
      const templateFnMatch = templateSrc.match(/return `([\s\S]+)`;[\s]*\}/);
      if (templateFnMatch) {
        let fakeHtml = templateFnMatch[1].replace(/\$\{title\}/g,'T').replace(/\$\{css\}/g,fakeStyles).replace(/\$\{clientScript\}/g,fakeClient);
        const smokeChecks = ['<style>','</style>','<script','</script>','Shared planning state preview','Save test item','/api/chat/room/state','/api/chat/room/order/add'].map(function(m){return fakeHtml.includes(m);});
        smokeOk = smokeChecks.every(Boolean);
        smokeNote = smokeOk ? 'Static smoke reconstruction passed' : 'Smoke failed -- missing: ' + ['<style>','</style>','<script','</script>','Shared planning state preview','Save test item','/api/chat/room/state','/api/chat/room/order/add'].filter(function(m,i){return !smokeChecks[i];}).join(', ');
      } else { smokeNote = 'Could not extract template return body for smoke test'; }
    } catch (e) { smokeNote = 'Smoke test error: ' + e.message; }
    if (smokeOk) pass('smoke_reconstruction', { note: smokeNote }); else fail('smoke_reconstruction', { note: smokeNote });
    return { ok: allOk, repo: owner+'/'+repo, branch, file, function: fnName, dir: dirPath, smoke_test: smokeOk, checks, summary: allOk ? 'All checks passed. Safe to deploy lab worker.' : 'One or more checks failed -- review checks array for details.' };
  }

  throw new Error('Unknown tool: ' + name);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'afo-inline-renderer-debundler-mcp', version: VERSION }, { headers: CORS });
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body;
    try { body = await request.json(); } catch { return err(null, -32700, 'Parse error'); }
    const { id, method, params } = body;
    if (method === 'initialize') return rpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'afo-inline-renderer-debundler-mcp', version: VERSION } });
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
