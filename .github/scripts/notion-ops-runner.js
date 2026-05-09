const { Client } = require(__dirname + '/node_modules/@notionhq/client');
const fs = require('fs');

console.log('=== notion-ops-runner start ===');
console.log('API key present:', !!process.env.NOTION_API_KEY);
console.log('API key length:', (process.env.NOTION_API_KEY || '').length);

const queue = JSON.parse(fs.readFileSync('spaces/notion-ops/queue.json', 'utf8'));
console.log('op:', queue.op, '| db:', queue.database_id);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
console.log('Notion client created:', typeof notion.databases);

async function getAllPages(dbId) {
  let pages = [];
  let cursor = undefined;
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: 100
    });
    pages = pages.concat(res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function runDiagnose(queue) {
  console.log('Fetching first 5 pages...');
  const res = await notion.databases.query({
    database_id: queue.database_id,
    page_size: 5
  });
  const sample = res.results.map(page => {
    const props = {};
    for (const [k, v] of Object.entries(page.properties)) {
      if (v.type === 'url') props[k] = { type: 'url', value: v.url };
      else if (v.type === 'title') props[k] = { type: 'title', value: v.title.map(t => t.plain_text).join('') };
      else if (v.type === 'select') props[k] = { type: 'select', value: v.select && v.select.name };
      else props[k] = { type: v.type };
    }
    return { page_id: page.id, properties: props };
  });
  return sample;
}

async function runBatchRows(queue) {
  const results = [];
  for (const row of queue.rows) {
    try {
      const res = await notion.pages.create({
        parent: { database_id: queue.database_id },
        properties: row
      });
      const name = row.Name && row.Name.title && row.Name.title[0] && row.Name.title[0].text && row.Name.title[0].text.content;
      results.push({ name, status: 'ok', id: res.id });
      console.log('OK created:', name);
    } catch (err) {
      const name = row.Name && row.Name.title && row.Name.title[0] && row.Name.title[0].text && row.Name.title[0].text.content;
      results.push({ name, status: 'error', error: err.message });
      console.error('FAIL:', name, err.message);
    }
  }
  return results;
}

async function runPatchRows(queue) {
  console.log('Fetching all DB pages...');
  const allPages = await getAllPages(queue.database_id);
  console.log('Found', allPages.length, 'rows');

  const urlMap = {};
  for (const page of allPages) {
    const ghProp = page.properties['GitHub URL'];
    if (ghProp && ghProp.url) {
      urlMap[ghProp.url] = page.id;
    }
  }

  console.log('Sample URL keys:', Object.keys(urlMap).slice(0, 3));

  const results = [];
  for (const row of queue.rows) {
    const matchUrl = row.match;
    const pageId = urlMap[matchUrl];
    if (!pageId) {
      console.warn('NO MATCH:', matchUrl);
      results.push({ match: matchUrl, status: 'not_found' });
      continue;
    }
    try {
      const patchProps = {};
      for (const key of Object.keys(row)) {
        if (key !== 'match') patchProps[key] = row[key];
      }
      await notion.pages.update({ page_id: pageId, properties: patchProps });
      results.push({ match: matchUrl, status: 'ok', id: pageId });
      console.log('OK patched:', matchUrl);
    } catch (err) {
      results.push({ match: matchUrl, status: 'error', error: err.message });
      console.error('FAIL:', matchUrl, err.message);
    }
  }
  return results;
}

async function main() {
  let results;
  let extra = {};

  if (queue.op === 'batch_rows') {
    results = await runBatchRows(queue);
  } else if (queue.op === 'patch_rows') {
    results = await runPatchRows(queue);
  } else if (queue.op === 'diagnose') {
    const sample = await runDiagnose(queue);
    extra = { sample };
    results = [{ status: 'ok', note: 'diagnosis complete' }];
  } else {
    throw new Error('Unknown op: ' + queue.op);
  }

  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'not_found').length;

  const result = Object.assign({
    op: queue.op,
    database_id: queue.database_id,
    ran_at: new Date().toISOString(),
    requested_by: queue.requested_by || 'unknown',
    summary: { total: results.length, ok, failed, skipped },
    results
  }, extra);

  fs.writeFileSync('spaces/notion-ops/result.json', JSON.stringify(result, null, 2));
  console.log('Done -', ok, 'ok |', failed, 'failed |', skipped, 'skipped');
}

main().catch(err => {
  console.error('FATAL ERROR:', err.message);
  console.error(err.stack);
  const result = {
    op: queue.op || 'unknown',
    database_id: queue.database_id || 'unknown',
    ran_at: new Date().toISOString(),
    status: 'error',
    error: err.message,
    stack: err.stack
  };
  fs.writeFileSync('spaces/notion-ops/result.json', JSON.stringify(result, null, 2));
  process.exit(0);
});
