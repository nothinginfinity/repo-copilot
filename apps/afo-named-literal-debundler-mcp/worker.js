const VERSION = '0.1.0';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Mcp-Session-Id'
};

const TOOLS = [
  {
    name: 'named_literal_debundler_status',
    description: 'Health check. Returns version and available tools.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'analyze_named_template_literal',
    description: 'Dry-run analysis. Finds a named template literal (e.g. livingMenuShim) inside a partially-debundled renderer file, reports its size and injection points. Does NOT write anything.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:        { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:         { type: 'string', description: 'GitHub repo name' },
        branch:       { type: 'string', description: 'Branch (default: main)' },
        file:         { type: 'string', description: 'Path to the source file inside the repo' },
        literal_name: { type: 'string', description: 'Name of the const template literal to extract (e.g. livingMenuShim)' }
      },
      required: ['repo', 'file', 'literal_name']
    }
  },
  {
    name: 'debundle_named_template_literal',
    description: 'Extracts a named template literal from a partially-debundled renderer file into its own module, rewrites the source file to import and use the new module. Backs up the original. Safe to use on already-modular files.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:         { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:          { type: 'string', description: 'GitHub repo name' },
        branch:        { type: 'string', description: 'Branch (default: main)' },
        file:          { type: 'string', description: 'Path to the source file inside the repo' },
        literal_name:  { type: 'string', description: 'Name of the const template literal to extract (e.g. livingMenuShim)' },
        target_file:   { type: 'string', description: 'Output path for the new extracted module' },
        export_name:   { type: 'string', description: 'Export name in the new module (e.g. livingMenuScript)' },
        import_path:   { type: 'string', description: 'Import path to use in the rewritten source file (e.g. ./living_menu_script.js)' },
        backup_suffix: { type: 'string', description: 'Suffix for the backup file (default: .bak-named-literal)' },
        commit_message:{ type: 'string', description: 'Git commit message (optional)' },
        dry_run:       { type: 'boolean', description: 'If true, returns the plan and previews without writing (default: false)' }
      },
      required: ['repo', 'file', 'literal_name', 'target_file', 'export_name', 'import_path']
    }
  },
  {
    name: 'verify_named_template_literal_debundle',
    description: 'Verifies a completed named template literal debundle: checks source file no longer contains the inline declaration, imports the new module, and injects it correctly. Checks extracted file exports correctly. Checks UI/API markers.',
    inputSchema: {
      type: 'object',
      properties: {
        owner:        { type: 'string', description: 'GitHub owner/org (default: nothinginfinity)' },
        repo:         { type: 'string', description: 'GitHub repo name' },
        branch:       { type: 'string', description: 'Branch (default: main)' },
        file:         { type: 'string', description: 'Path to the rewritten source file' },
        literal_name: { type: 'string', description: 'Original literal name that was extracted' },
        target_file:  { type: 'string', description: 'Path to the extracted module file' },
        export_name:  { type: 'string', description: 'Export name expected in the extracted module' },
        markers:      { type: 'array', items: { type: 'string' }, description: 'Extra content markers to check across source + extracted file' }
      },
      required: ['repo', 'file', 'literal_name', 'target_file', 'export_name']
    }
  }
];

function rpc(id, r)    { return Response.json({ jsonrpc: '2.0', id, result: r }, { headers: CORS }); }
function err(id, c, m) { return Response.json({ jsonrpc: '2.0', id, error: { code: c, message: m } }, { headers: CORS }); }
function tool(id, r)   { return rpc(id, { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }); }

async function ghGet(env, owner, repo, path, ref) {
  const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path + (ref ? '?ref=' + ref : '');
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'afo-named-literal-debundler-mcp/' + VERSION } });
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
  const res = await fetch(url, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'afo-named-literal-debundler-mcp/' + VERSION }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('GitHub PUT ' + path + ' -> ' + res.status + ': ' + await res.text());
  return res.json();
}
async function ghFileExists(env, owner, repo, path, ref) { try { await ghGet(env, owner, repo, path, ref); return true; } catch { return false; } }
async function ghGetSha(env, owner, repo, path, ref) { try { const d = await ghGet(env, owner, repo, path, ref); return d.sha || null; } catch { return null; } }

// Robust template literal scanner.
// Finds: const <literalName> = `...`
// Returns { content, declStart, declEnd, tickPos }
// Correctly handles nested ${...}, escaped backticks, multiline content.
function scanNamedTemplateLiteral(src, literalName) {
  const declStr = 'const ' + literalName + ' =';
  let declStart = src.indexOf(declStr);
  if (declStart === -1) {
    const altMatch = new RegExp('const\\s+' + literalName + '\\s*=\\s*`').exec(src);
    if (!altMatch) return null;
    declStart = altMatch.index;
  }
  const tickPos = src.indexOf('`', declStart);
  if (tickPos === -1) return null;
  let i = tickPos + 1;
  let depth = 0;
  let content = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\' && i + 1 < src.length) { content += src[i] + src[i + 1]; i += 2; continue; }
    if (ch === '`' && depth === 0) { let declEnd = i + 1; if (src[declEnd] === ';') declEnd++; return { content, declStart, declEnd, tickPos }; }
    if (ch === '$' && src[i + 1] === '{') { depth++; content += '${'; i += 2; continue; }
    if (ch === '}' && depth > 0) { depth--; content += '}'; i++; continue; }
    content += ch;
    i++;
  }
  return null;
}

function findInjectionSites(src, literalName) {
  const pattern = new RegExp('\\$\\{' + literalName + '\\}', 'g');
  const sites = [];
  let m;
  while ((m = pattern.exec(src)) !== null) {
    const ctxStart = Math.max(0, m.index - 30);
    const ctxEnd = Math.min(src.length, m.index + m[0].length + 30);
    sites.push(src.slice(ctxStart, ctxEnd).replace(/\n/g, '\\n'));
  }
  return sites;
}

function findLastImportIndex(src) {
  const lines = src.split('\n');
  let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s+/.test(lines[i].trim())) lastImportLine = i;
  }
  if (lastImportLine === -1) return 0;
  let pos = 0;
  for (let i = 0; i <= lastImportLine; i++) pos += lines[i].length + 1;
  return pos;
}

const DEFAULT_MARKERS = [
  'Dish Detail', 'ORDERING GAME', 'Living Menu - structured', 'Discuss', 'Add to draft', 'Vote / compare',
  '/api/chat/room/assistant', '/api/chat/room/messages', '/api/chat/room/order/add'
];

async function handle(name, args, env) {
  const owner  = args.owner  || 'nothinginfinity';
  const branch = args.branch || 'main';

  if (name === 'named_literal_debundler_status') {
    return { status: 'ok', worker: 'afo-named-literal-debundler-mcp', version: VERSION, bindings: { GITHUB_TOKEN: !!env.GITHUB_TOKEN }, tools: TOOLS.map(function(t){return t.name;}) };
  }

  if (name === 'analyze_named_template_literal') {
    const { repo, file, literal_name } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    if (!literal_name) throw new Error('literal_name required');
    const src = await ghGetContent(env, owner, repo, file, branch);
    const found = scanNamedTemplateLiteral(src, literal_name);
    if (!found) return { ok: false, repo: owner+'/'+repo, file, literal_name, found: false, error: 'const ' + literal_name + ' = `...` not found in this file.' };
    return {
      ok: true, repo: owner+'/'+repo, file, literal_name, found: true,
      literal_bytes: found.content.length, literal_lines: found.content.split('\n').length,
      decl_start_char: found.declStart, decl_end_char: found.declEnd,
      injection_sites: findInjectionSites(src, literal_name),
      existing_imports: (src.match(/^import\s+.+from\s+['"].+['"]/gm) || []),
      file_bytes: src.length, file_lines: src.split('\n').length, ready_to_extract: true,
      notes: [
        'Extraction will replace `const ' + literal_name + ' = `...`` with an import statement',
        'All `${' + literal_name + '}` injection sites will be updated to use the new export name',
        'A backup will be written before any changes'
      ]
    };
  }

  if (name === 'debundle_named_template_literal') {
    const { repo, file, literal_name, target_file, export_name, import_path } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    if (!literal_name) throw new Error('literal_name required');
    if (!target_file) throw new Error('target_file required');
    if (!export_name) throw new Error('export_name required');
    if (!import_path) throw new Error('import_path required');
    const backupSuffix = args.backup_suffix || '.bak-named-literal';
    const dryRun = args.dry_run === true;
    const src = await ghGetContent(env, owner, repo, file, branch);
    const found = scanNamedTemplateLiteral(src, literal_name);
    if (!found) throw new Error('const ' + literal_name + ' = `...` not found in ' + file);

    const extractedModule = '// Extracted from ' + file + '\n'
      + '// by afo-named-literal-debundler-mcp v' + VERSION + '\n\n'
      + 'export const ' + export_name + ' = `' + found.content + '`;\n';

    const beforeDecl = src.slice(0, found.declStart);
    const afterDecl  = src.slice(found.declEnd);
    let rewritten = beforeDecl + afterDecl;
    rewritten = rewritten.replace(new RegExp('\\$\\{' + literal_name + '\\}', 'g'), '${' + export_name + '}');
    const importLine = "import { " + export_name + " } from '" + import_path + "';\n";
    const insertPos = findLastImportIndex(rewritten);
    rewritten = rewritten.slice(0, insertPos) + importLine + rewritten.slice(insertPos);
    rewritten = rewritten.replace(/\n{3,}/g, '\n\n');

    const plan = {
      backup_file: file + backupSuffix, extracted_file: target_file, rewritten_file: file,
      literal_name, export_name, import_path,
      extracted_bytes: extractedModule.length, rewritten_bytes: rewritten.length,
      injection_sites_updated: (src.match(new RegExp('\\$\\{' + literal_name + '\\}', 'g')) || []).length
    };

    if (dryRun) return {
      ok: true, dry_run: true, plan,
      rewritten_file_preview: rewritten.slice(0, 800) + (rewritten.length > 800 ? '\n... [truncated]' : ''),
      extracted_file_preview: extractedModule.slice(0, 400) + (extractedModule.length > 400 ? '\n... [truncated]' : '')
    };

    const commitMsg = args.commit_message || 'debundle: extract ' + literal_name + ' into ' + target_file.replace(/^.*\//, '') + ' [afo-named-literal-debundler-mcp v' + VERSION + ']';
    const written = []; const errors = [];
    async function commit(path, content, desc) {
      try { const sha = await ghGetSha(env, owner, repo, path, branch); await ghPut(env, owner, repo, path, content, commitMsg + ' -- ' + desc, branch, sha); written.push(path); }
      catch (e) { errors.push({ path, error: e.message }); }
    }
    await commit(file + backupSuffix, src,             'backup original');
    await commit(target_file,         extractedModule, 'extracted module');
    await commit(file,                rewritten,       'rewritten source');
    return { ok: errors.length===0, repo: owner+'/'+repo, branch, plan, written, errors, next_steps: ['Run verify_named_template_literal_debundle to confirm markers and structure', 'Deploy lab worker and smoke test in browser', 'Do not port to live until verified'] };
  }

  if (name === 'verify_named_template_literal_debundle') {
    const { repo, file, literal_name, target_file, export_name } = args;
    if (!repo) throw new Error('repo required');
    if (!file) throw new Error('file required');
    if (!literal_name) throw new Error('literal_name required');
    if (!target_file) throw new Error('target_file required');
    if (!export_name) throw new Error('export_name required');
    const userMarkers = Array.isArray(args.markers) ? args.markers : [];
    const markers = DEFAULT_MARKERS.concat(userMarkers);
    const checks = []; let allOk = true;
    function pass(check, details) { checks.push(Object.assign({ check, ok: true  }, details || {})); }
    function fail(check, details) { checks.push(Object.assign({ check, ok: false }, details || {})); allOk = false; }

    let sourceSrc = '';
    try { sourceSrc = await ghGetContent(env, owner, repo, file, branch); pass('source_file_exists', { path: file }); }
    catch (e) { fail('source_file_exists', { path: file, error: e.message }); }

    let extractedSrc = '';
    try { extractedSrc = await ghGetContent(env, owner, repo, target_file, branch); pass('extracted_file_exists', { path: target_file }); }
    catch (e) { fail('extracted_file_exists', { path: target_file, error: e.message }); }

    if (sourceSrc) {
      if (sourceSrc.includes('const ' + literal_name + ' =')) fail('inline_declaration_removed', { error: 'const ' + literal_name + ' = still present in source' });
      else pass('inline_declaration_removed', {});

      if (sourceSrc.includes(export_name) && sourceSrc.includes('import')) pass('source_imports_export', { export_name });
      else fail('source_imports_export', { export_name, error: 'import of ' + export_name + ' not found' });

      if (sourceSrc.includes('${' + export_name + '}')) pass('source_injects_export', { injection: '${' + export_name + '}' });
      else fail('source_injects_export', { error: '${' + export_name + '} not found in source' });

      if (sourceSrc.includes('${' + literal_name + '}')) fail('old_injection_removed', { error: '${' + literal_name + '} still present in source' });
      else pass('old_injection_removed', {});

      if (/export\s+function\s+\w+/.test(sourceSrc) || /export\s+\{/.test(sourceSrc)) pass('source_still_exports_function', {});
      else fail('source_still_exports_function', { error: 'No export function found in rewritten source' });
    }

    if (extractedSrc) {
      if (extractedSrc.includes('export const ' + export_name)) pass('extracted_file_exports', { export_name });
      else fail('extracted_file_exports', { export_name, error: 'export const ' + export_name + ' not found' });
    }

    const combined = sourceSrc + '\n' + extractedSrc;
    for (const marker of markers) {
      if (combined.includes(marker)) pass('marker_present', { marker });
      else fail('marker_present', { marker });
    }

    const stubWords = ['TODO', 'STUB', 'FIXME', 'stub not yet filled in', 'throw new Error'];
    let stubFound = false;
    for (const stub of stubWords) { if (extractedSrc.includes(stub)) { fail('no_stubs_in_extracted', { stub }); stubFound = true; } }
    if (!stubFound) pass('no_stubs_in_extracted', {});

    return { ok: allOk, repo: owner+'/'+repo, branch, source_file: file, extracted_file: target_file, export_name, checks, summary: allOk ? 'All checks passed. Safe to proceed.' : 'One or more checks failed -- review checks array for details.' };
  }

  throw new Error('Unknown tool: ' + name);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok', worker: 'afo-named-literal-debundler-mcp', version: VERSION }, { headers: CORS });
    if (request.method !== 'POST') return new Response('not found', { status: 404, headers: CORS });
    let body;
    try { body = await request.json(); } catch { return err(null, -32700, 'Parse error'); }
    const { id, method, params } = body;
    if (method === 'initialize') return rpc(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'afo-named-literal-debundler-mcp', version: VERSION } });
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
