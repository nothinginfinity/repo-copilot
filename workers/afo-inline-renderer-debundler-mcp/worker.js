PLACEHOLDER_WILL_NOT_MATCH_ANYTHING_XYZ
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
    description: 'Dry-run analysis of a large inline renderer file. Detects CSS, HTML, client <script> blocks, server-side interpolations, and proposes a split plan. Does NOT write any files.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:   { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:    { type: 'string', description: 'GitHub repo name' },
        branch:  { type: 'string', description: 'Branch (default: main)' },
        file:    { type: 'string', description: 'Path to the renderer file inside the repo' }
      },
      required: ['repo', 'file']
    }
  },
  {
    name: 'debundle_inline_renderer',
    description: 'Splits a large inline renderer file into maintainable sub-modules (styles.js, client_script.js, template.js, index.js) and writes a compatibility wrapper at the original path. Backs up original. Only writes to the specified repo — never to the live/dev repo unless explicitly set.',
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
    description: 'Verifies that a completed inline debundle is structurally correct: checks new files exist, original export path still resolves, key UI markers are present, and no obvious broken template literals.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:  { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:   { type: 'string', description: 'GitHub repo name' },
        branch: { type: 'string', description: 'Branch (default: main)' },
        file:   { type: 'string', description: 'Original renderer file path (compatibility wrapper location)' },
        markers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Extra UI/API markers to check for in the template. Defaults include common AFO markers.'
        }
      },
      required: ['repo', 'file']
    }
  }
];

// ─── helpers ────────────────────────────────────────────────────────────────

function rpc(id, r)  { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function err(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r) { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }

// ─── GitHub helpers ──────────────────────────────────────────────────────────

async function ghGet(env, owner, repo, path, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${ref ? '?ref=' + ref : ''}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'afo-inline-renderer-debundler-mcp/' + VERSION
    }
  });
  if (!res.ok) throw new Error(`GitHub GET ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

async function ghGetContent(env, owner, repo, path, ref) {
  const data = await ghGet(env, owner, repo, path, ref);
  if (!data.content) throw new Error('No content returned for ' + path);
  return atob(data.content.replace(/\n/g, ''));
}

async function ghPut(env, owner, repo, path, content, message, branch, existingSha) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: branch || 'main'
  };
  if (existingSha) body.sha = existingSha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'afo-inline-renderer-debundler-mcp/' + VERSION
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT ${path} -> ${res.status}: ${txt}`);
  }
  return res.json();
}

async function ghFileExists(env, owner, repo, path, ref) {
  try { await ghGet(env, owner, repo, path, ref); return true; }
  catch { return false; }
}

async function ghGetSha(env, owner, repo, path, ref) {
  try {
    const d = await ghGet(env, owner, repo, path, ref);
    return d.sha || null;
  } catch { return null; }
}

// ─── Analysis logic ──────────────────────────────────────────────────────────

function analyzeSource(src) {
  const result = {
    exported_function: null,
    top_imports: [],
    has_css_template: false,
    has_html_template: false,
    has_client_script: false,
    server_interpolations: [],
    estimated_lines: src.split('\n').length,
    estimated_bytes: src.length,
    risk: 'low',
    notes: [],
    proposed_files: []
  };

  const exportMatch = src.match(/export\s+(?:async\s+)?function\s+(\w+)/);
  if (exportMatch) result.exported_function = exportMatch[1];

  const importLines = src.match(/^import\s+.+from\s+['"].+['"]/gm) || [];
  result.top_imports = importLines;

  const hasCss = /const\s+\w*[Cc]ss\w*\s*=\s*`[\s\S]{200,}`/.test(src)
    || /`[\s\S]*?(?:font-size|background|padding|margin|border-radius|color:)[\s\S]*?`/.test(src);
  result.has_css_template = hasCss;

  const hasHtml = /`[\s\S]*?<!doctype html|`[\s\S]*?<html[\s\S]*?>/.test(src)
    || /`[\s\S]*?<div[\s\S]*?<\/div>[\s\S]*?`/.test(src);
  result.has_html_template = hasHtml;

  const hasScript = /<script[\s>][\s\S]*?<\/script>/.test(src);
  result.has_client_script = hasScript;

  const interpMatches = src.match(/\$\{([^{}()[\]`]+?)\}/g) || [];
  const seen = new Set();
  for (const m of interpMatches) {
    const inner = m.slice(2, -1).trim();
    if (/^[\w.]+$/.test(inner) && !seen.has(inner)) {
      seen.add(inner);
      if (/json|data|title|id|label|count|url|msg|html|css|script|room|plan|role/i.test(inner)) {
        result.server_interpolations.push(inner);
      }
    }
  }

  const fnName = result.exported_function || 'renderUnknown';
  result.proposed_dir = fnName;
  result.proposed_files = ['styles.js','client_script.js','template.js','index.js',`../${fnName}.js.bak`].map(f => `[dir]/${f}`);

  if (src.length > 80000) result.risk = 'high';
  else if (src.length > 30000) result.risk = 'medium';
  if (!hasHtml) result.notes.push('No top-level HTML template detected — manual review recommended before split.');
  if (!hasCss) result.notes.push('No obvious CSS template block detected — styles.js may be empty.');
  if (!hasScript) result.notes.push('No <script> block detected — client_script.js may be a passthrough.');
  result.notes.push('Preserve existing export path with compatibility wrapper at original file location.');
  result.notes.push('All interpolation boundaries must be preserved exactly during extraction.');

  return result;
}

// ─── Extraction helpers ──────────────────────────────────────────────────────

function extractCssBlock(src) {
  const cssVarMatch = src.match(/const\s+(\w*[Cc]ss\w*)\s*=\s*(`[\s\S]*?`)\s*;/);
  if (cssVarMatch) return { varName: cssVarMatch[1], content: cssVarMatch[2], found: true };
  return { varName: 'styles', content: '``', found: false };
}

function extractClientScriptBlock(src) {
  const scriptMatch = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) return { content: scriptMatch[1], found: true };
  return { content: '', found: false };
}

function buildOutputFiles(src, fnName, analysis) {
  const exportedVar = fnName.charAt(0).toUpperCase() + fnName.slice(1);
  const baseName = exportedVar.replace(/^Render/, '');

  // styles.js
  const cssBlock = extractCssBlock(src);
  const stylesVarName = baseName + 'Styles';
  const stylesJs = '// Auto-extracted CSS for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + 'export const ' + stylesVarName + ' = ' + (cssBlock.found ? cssBlock.content : '``') + ';\n';

  // client_script.js
  const scriptBlock = extractClientScriptBlock(src);
  const clientScriptFnName = 'build' + baseName + 'ClientScript';
  const scriptInterps = [];
  if (scriptBlock.found) {
    const matches = scriptBlock.content.match(/\$\{([^{}]+?)\}/g) || [];
    for (const m of matches) {
      const inner = m.slice(2, -1).trim();
      if (/^[\w.]+$/.test(inner) && !scriptInterps.includes(inner)) scriptInterps.push(inner);
    }
  }
  const scriptParams = scriptInterps.length > 0 ? '{ ' + scriptInterps.join(', ') + ' }' : '{}';
  const clientScriptBody = scriptBlock.found
    ? scriptBlock.content.replace(/`/g, '\\`')
    : '';
  const clientScriptJs = '// Auto-extracted client-side script for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n'
    + '// IMPORTANT: Keep as string template — do not convert to server-side JS\n\n'
    + 'export function ' + clientScriptFnName + '(' + scriptParams + ') {\n'
    + '  return `' + clientScriptBody + '`;\n'
    + '}\n';

  // template.js (stub)
  const templateFnName = 'build' + baseName + 'Html';
  const templateJs = '// Auto-extracted HTML template for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n'
    + '// NOTE: This file is intentionally a STUB.\n'
    + '// The full HTML template extraction requires reviewing the source file\n'
    + '// and manually isolating the HTML template string with its interpolation points.\n'
    + '// Run analyze_inline_renderer first, then edit this file accordingly.\n\n'
    + 'export function ' + templateFnName + '({ title = \'\', css = \'\', clientScript = \'\' }) {\n'
    + '  // TODO: Replace this stub with the extracted HTML template string.\n'
    + '  // Move the full HTML from ' + fnName + ' here, replacing css/clientScript inline.\n'
    + '  // stub not yet filled in\n'
    + '  throw new Error(\'' + templateFnName + ': stub not yet filled in. See DEBUNDLE_NOTES.md\');\n'
    + '}\n';

  // index.js (scaffold)
  const indexImports = analysis.top_imports.join('\n');
  const indexJs = '// Auto-generated index for ' + fnName + '\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + (indexImports ? indexImports + '\n' : '')
    + 'import { ' + stylesVarName + ' } from \'./styles.js\';\n'
    + 'import { ' + clientScriptFnName + ' } from \'./client_script.js\';\n'
    + 'import { ' + templateFnName + ' } from \'./template.js\';\n\n'
    + 'export function ' + fnName + '(...args) {\n'
    + '  // TODO: Wire up args to ' + templateFnName + ', ' + stylesVarName + ', and ' + clientScriptFnName + '.\n'
    + '  // This is a scaffold — refer to the .bak file and DEBUNDLE_NOTES.md.\n'
    + '  throw new Error(\'' + fnName + ' index.js: scaffold not yet wired. See DEBUNDLE_NOTES.md\');\n'
    + '}\n';

  // compatibility wrapper
  const wrapperJs = '// Compatibility wrapper — do not edit\n'
    + '// Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n'
    + '// Original file backed up as ' + fnName + '.js.bak\n'
    + 'export { ' + fnName + ' } from \'./' + fnName + '/index.js\';\n';

  // DEBUNDLE_NOTES.md
  const notes = '# Debundle Notes — ' + fnName + '\n\n'
    + 'Generated by afo-inline-renderer-debundler-mcp v' + VERSION + '\n\n'
    + '## Status\n\n'
    + 'The CSS and client-side script have been auto-extracted.\n'
    + 'The HTML template stub in `template.js` must be filled in manually before `index.js` will work.\n\n'
    + '## What to do next\n\n'
    + '1. Open `' + fnName + '.js.bak` — this is the full original source.\n'
    + '2. Find the HTML template string (the big backtick starting with `<!doctype html` or similar).\n'
    + '3. Cut that string into `template.js` as the return value of `' + templateFnName + '`.\n'
    + '4. Replace inline `css` and `clientScript` references in the HTML with the `{ css, clientScript }` params.\n'
    + '5. Wire `index.js` to call `' + templateFnName + '`, `' + stylesVarName + '`, and `' + clientScriptFnName + '` correctly.\n'
    + '6. Run `verify_inline_debundle` to confirm markers pass.\n\n'
    + '## Detected server interpolations\n\n'
    + analysis.server_interpolations.map(s => '- `' + s + '`').join('\n') + '\n\n'
    + '## Stable rescue commit\n\nCheck the lab repo commit history for the baseline SHA.\n';

  return { stylesJs, clientScriptJs, templateJs, indexJs, wrapperJs, notes, stylesVarName, clientScriptFnName, templateFnName };
}

// ─── Default UI markers ───────────────────────────────────────────────────────

const DEFAULT_MARKERS = [
  '/api/chat/room/state',
  '/api/chat/room/order/add',
  '/api/chat/room/message',
  '/api/chat/room/assistant',
  'inviteModal',
  'roleChips',
  'choiceCard',
  '<script',
  '</script>'
];

// ─── Tool handlers ────────────────────────────────────────────────────────────

async function handle(name, args, env) {
  const owner  = args.owner  || 'nothinginfinity';
  const branch = args.branch || 'main';

  if (name === 'inline_debundler_status') {
    return {
      status: 'ok',
      worker: 'afo-inline-renderer-debundler-mcp',
      version: VERSION,
      bindings: { GITHUB_TOKEN: !!env.GITHUB_TOKEN },
      tools: TOOLS.map(t => t.name)
    };
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
      ok: true,
      repo: owner + '/' + repo,
      branch,
      file,
      function: fnName,
      detected: {
        css_template:          analysis.has_css_template,
        html_template:         analysis.has_html_template,
        client_script:         analysis.has_client_script,
        server_interpolations: analysis.server_interpolations,
        top_imports:           analysis.top_imports,
        estimated_lines:       analysis.estimated_lines,
        estimated_bytes:       analysis.estimated_bytes
      },
      proposed_dir:   basePath + '/' + fnName + '/',
      proposed_files: [
        basePath + '/' + fnName + '/styles.js',
        basePath + '/' + fnName + '/client_script.js',
        basePath + '/' + fnName + '/template.js',
        basePath + '/' + fnName + '/index.js',
        basePath + '/' + fnName + '/DEBUNDLE_NOTES.md',
        file + '.bak'
      ],
      compatibility_wrapper: file,
      risk: analysis.risk,
      notes: analysis.notes
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
    const output = buildOutputFiles(src, fnName, analysis);
    const plan = {
      files_to_write: [
        { path: dirPath + '/styles.js',        description: 'Extracted CSS' },
        { path: dirPath + '/client_script.js', description: 'Extracted client-side script (string template)' },
        { path: dirPath + '/template.js',       description: 'HTML template stub (requires manual fill-in)' },
        { path: dirPath + '/index.js',          description: 'Scaffold index re-exporting function' },
        { path: dirPath + '/DEBUNDLE_NOTES.md', description: 'Instructions for completing the debundle' },
        { path: file + '.bak',                  description: 'Backup of original file' },
        { path: file,                           description: 'Compatibility wrapper (replaces original)' }
      ],
      function: fnName,
      risk: analysis.risk
    };
    if (dryRun) return { ok: true, dry_run: true, plan, analysis: { detected: analysis } };

    const commitMsg = args.commit_message
      || 'debundle: split ' + fnName + ' into modular sub-files [afo-inline-renderer-debundler-mcp v' + VERSION + ']';

    const written = [];
    const errors  = [];

    async function commit(path, content, desc) {
      try {
        const existingSha = await ghGetSha(env, owner, repo, path, branch);
        await ghPut(env, owner, repo, path, content, commitMsg + ' — ' + desc, branch, existingSha);
        written.push(path);
      } catch (e) {
        errors.push({ path, error: e.message });
      }
    }

    await commit(file + '.bak',              src,                  'backup original');
    await commit(dirPath + '/styles.js',        output.stylesJs,      'styles');
    await commit(dirPath + '/client_script.js', output.clientScriptJs,'client_script');
    await commit(dirPath + '/template.js',       output.templateJs,    'template stub');
    await commit(dirPath + '/index.js',          output.indexJs,       'index scaffold');
    await commit(dirPath + '/DEBUNDLE_NOTES.md', output.notes,         'debundle notes');
    await commit(file,                          output.wrapperJs,     'compatibility wrapper');

    return {
      ok: errors.length === 0,
      repo: owner + '/' + repo,
      branch,
      function: fnName,
      written,
      errors,
      next_steps: [
        '1. Open ' + file + '.bak to view the original source',
        '2. Edit ' + dirPath + '/template.js — fill in the HTML template stub',
        '3. Edit ' + dirPath + '/index.js — wire up styles, clientScript, and template',
        '4. Run verify_inline_debundle to check markers and structure',
        '5. Manually test the lab worker before porting to live'
      ],
      warning: analysis.risk === 'high'
        ? 'Risk is HIGH — large file. Manual review of template.js and index.js strongly recommended before any test deploy.'
        : null
    };
  }

  if (name === 'verify_inline_debundle') {
    const { repo, file } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    const userMarkers = Array.isArray(args.markers) ? args.markers : [];
    const markers = [...DEFAULT_MARKERS, ...userMarkers];
    const checks = [];
    let allOk = true;
    const basePath = file.replace(/\/[^/]+\.js$/, '');
    let fnName = null;

    try {
      const wrapperSrc = await ghGetContent(env, owner, repo, file, branch);
      const fnMatch = wrapperSrc.match(/export\s*\{([^}]+)\}\s*from/);
      if (fnMatch) fnName = fnMatch[1].trim();
      checks.push({ check: 'wrapper_exists', ok: true, path: file });
    } catch (e) {
      checks.push({ check: 'wrapper_exists', ok: false, path: file, error: e.message });
      allOk = false;
    }

    if (!fnName) fnName = file.replace(/^.*\//, '').replace(/\.js$/, '');
    const dirPath = basePath + '/' + fnName;

    const expectedFiles = [
      dirPath + '/styles.js',
      dirPath + '/client_script.js',
      dirPath + '/template.js',
      dirPath + '/index.js',
      file + '.bak'
    ];
    for (const path of expectedFiles) {
      const exists = await ghFileExists(env, owner, repo, path, branch);
      checks.push({ check: 'file_exists', ok: exists, path });
      if (!exists) allOk = false;
    }

    if (fnName) {
      try {
        const indexSrc = await ghGetContent(env, owner, repo, dirPath + '/index.js', branch);
        const exportsOk = indexSrc.includes('export function ' + fnName) || indexSrc.includes('export { ' + fnName);
        checks.push({ check: 'index_exports_function', ok: exportsOk, function: fnName });
        if (!exportsOk) allOk = false;
      } catch (e) {
        checks.push({ check: 'index_exports_function', ok: false, error: e.message });
        allOk = false;
      }
    }

    const markerResults = {};
    try {
      const templateSrc = await ghGetContent(env, owner, repo, dirPath + '/template.js', branch);
      let clientSrc = '';
      try { clientSrc = await ghGetContent(env, owner, repo, dirPath + '/client_script.js', branch); } catch {}
      const combined = templateSrc + '\n' + clientSrc;
      const isStub = templateSrc.includes('stub not yet filled in');
      for (const marker of markers) {
        const found = combined.includes(marker);
        markerResults[marker] = found;
        if (!found && !isStub) allOk = false;
      }
      checks.push({ check: 'template_markers', stub: isStub, markers: markerResults });
      if (isStub) checks.push({ check: 'template_stub_warning', ok: false, message: 'template.js is still a stub — fill in HTML before deploying' });
    } catch (e) {
      checks.push({ check: 'template_markers', ok: false, error: e.message });
      allOk = false;
    }

    return {
      ok: allOk,
      repo: owner + '/' + repo,
      branch,
      file,
      function: fnName,
      dir: dirPath,
      checks,
      summary: allOk
        ? 'All structural checks passed. Review template stub status before test deploy.'
        : 'One or more checks failed — review checks array for details.'
    };
  }

  throw new Error('Unknown tool: ' + name);
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', worker: 'afo-inline-renderer-debundler-mcp', version: VERSION }, { headers: CORS });
    }
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body;
    try { body = await request.json(); }
    catch { return err(null, -32700, 'Parse error'); }
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
