#!/usr/bin/env bash
set -euo pipefail

NOTION_VERSION="2022-06-28"
QUEUE="spaces/notion-ops/queue.json"
RESULT="spaces/notion-ops/result.json"
RAN_AT=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "=== notion-ops-runner (bash/curl) start ==="
echo "API key present: $([ -n "${NOTION_API_KEY:-}" ] && echo true || echo false)"

OP=$(python3 -c "import json; print(json.load(open('$QUEUE'))['op'])")
DB=$(python3 -c "import json; print(json.load(open('$QUEUE'))['database_id'])")
REQUESTED_BY=$(python3 -c "import json; print(json.load(open('$QUEUE')).get('requested_by','unknown'))")

echo "op: $OP | db: $DB"

notion_request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  if [ -n "$data" ]; then
    curl -s -X "$method" "https://api.notion.com/v1${path}" \
      -H "Authorization: Bearer $NOTION_API_KEY" \
      -H "Notion-Version: $NOTION_VERSION" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X "$method" "https://api.notion.com/v1${path}" \
      -H "Authorization: Bearer $NOTION_API_KEY" \
      -H "Notion-Version: $NOTION_VERSION" \
      -H "Content-Type: application/json"
  fi
}

write_error() {
  local msg="$1"
  echo "FATAL: $msg"
  python3 -c "
import json, sys
result = {
  'op': '$OP',
  'database_id': '$DB',
  'ran_at': '$RAN_AT',
  'requested_by': '$REQUESTED_BY',
  'status': 'error',
  'error': sys.argv[1]
}
open('$RESULT', 'w').write(json.dumps(result, indent=2))
" "$msg"
  exit 0
}

if [ "$OP" = "diagnose" ]; then
  echo "Fetching first 5 pages..."
  RESPONSE=$(notion_request POST "/databases/${DB}/query" '{"page_size":5}')
  echo "Raw response (first 500 chars): ${RESPONSE:0:500}"

  HAS_ERROR=$(python3 -c "import json,sys; r=json.loads(sys.argv[1]); print('yes' if r.get('object')=='error' else 'no')" "$RESPONSE" 2>/dev/null || echo "no")
  if [ "$HAS_ERROR" = "yes" ]; then
    ERROR_MSG=$(python3 -c "import json,sys; r=json.loads(sys.argv[1]); print(r.get('message','unknown error'))" "$RESPONSE")
    write_error "Notion API error: $ERROR_MSG"
  fi

  python3 - "$RESPONSE" "$OP" "$DB" "$RAN_AT" "$REQUESTED_BY" "$RESULT" << 'PYEOF'
import json, sys
response_str, op, db, ran_at, requested_by, result_path = sys.argv[1:]
data = json.loads(response_str)
sample = []
for page in data.get('results', []):
    props = {}
    for k, v in page.get('properties', {}).items():
        t = v.get('type')
        if t == 'url':
            props[k] = {'type': 'url', 'value': v.get('url')}
        elif t == 'title':
            props[k] = {'type': 'title', 'value': ''.join(x.get('plain_text','') for x in v.get('title',[]))}
        elif t == 'select':
            sel = v.get('select')
            props[k] = {'type': 'select', 'value': sel.get('name') if sel else None}
        else:
            props[k] = {'type': t}
    sample.append({'page_id': page['id'], 'properties': props})
result = {
    'op': op,
    'database_id': db,
    'ran_at': ran_at,
    'requested_by': requested_by,
    'summary': {'total': len(sample), 'ok': len(sample), 'failed': 0, 'skipped': 0},
    'results': [{'status': 'ok', 'note': 'diagnosis complete'}],
    'sample': sample
}
open(result_path, 'w').write(json.dumps(result, indent=2))
print(f'Done - {len(sample)} rows sampled')
PYEOF

elif [ "$OP" = "batch_rows" ]; then
  ROWS=$(python3 -c "import json; print(json.dumps(json.load(open('$QUEUE'))['rows']))")
  python3 - "$ROWS" "$DB" "$OP" "$RAN_AT" "$REQUESTED_BY" "$RESULT" << 'PYEOF'
import json, sys, subprocess, os
rows_str, db, op, ran_at, requested_by, result_path = sys.argv[1:]
rows = json.loads(rows_str)
results = []
for row in rows:
    # --- Build Notion property payload ---
    # Schema contract (G-013): title col = "Name", selects = Status/Type/Phase/Owner/Track
    name_text = row.get('Name', '?')
    properties = {
        'Name': {'title': [{'text': {'content': name_text}}]}
    }
    for select_field in ['Status', 'Type', 'Phase', 'Owner', 'Track']:
        if row.get(select_field):
            properties[select_field] = {'select': {'name': row[select_field]}}
    for text_field in ['Commit', 'Depends On', 'Notes']:
        if row.get(text_field):
            properties[text_field] = {'rich_text': [{'text': {'content': row[text_field]}}]}

    payload = json.dumps({'parent': {'database_id': db}, 'properties': properties})
    r = subprocess.run([
        'curl', '-s', '-X', 'POST', 'https://api.notion.com/v1/pages',
        '-H', f'Authorization: Bearer {os.environ["NOTION_API_KEY"]}',
        '-H', 'Notion-Version: 2022-06-28',
        '-H', 'Content-Type: application/json',
        '-d', payload
    ], capture_output=True, text=True)
    resp = json.loads(r.stdout)
    if 'id' in resp:
        results.append({'name': name_text, 'status': 'ok', 'id': resp['id']})
        print(f'OK: {name_text}')
    else:
        results.append({'name': name_text, 'status': 'error', 'error': resp.get('message','unknown')})
        print(f'FAIL: {name_text} - {resp.get("message")}')
ok = sum(1 for r in results if r['status']=='ok')
failed = sum(1 for r in results if r['status']=='error')
result = {
    'op': op, 'database_id': db, 'ran_at': ran_at, 'requested_by': requested_by,
    'summary': {'total': len(results), 'ok': ok, 'failed': failed, 'skipped': 0},
    'results': results
}
open(result_path, 'w').write(json.dumps(result, indent=2))
print(f'Done - {ok} ok | {failed} failed')
PYEOF

elif [ "$OP" = "patch_rows" ]; then
  ROWS=$(python3 -c "import json; print(json.dumps(json.load(open('$QUEUE'))['rows']))")
  echo "Fetching all pages for matching..."
  ALL_PAGES='[]'
  CURSOR=""
  while true; do
    if [ -z "$CURSOR" ]; then
      PAGE_RESP=$(notion_request POST "/databases/${DB}/query" '{"page_size":100}')
    else
      PAGE_RESP=$(notion_request POST "/databases/${DB}/query" "{\"page_size\":100,\"start_cursor\":\"${CURSOR}\"}")
    fi
    ALL_PAGES=$(python3 -c "
import json,sys
existing=json.loads(sys.argv[1])
new_pages=json.loads(sys.argv[2]).get('results',[])
print(json.dumps(existing+new_pages))
" "$ALL_PAGES" "$PAGE_RESP")
    HAS_MORE=$(python3 -c "import json,sys; r=json.loads(sys.argv[1]); print(r.get('has_more',False))" "$PAGE_RESP")
    if [ "$HAS_MORE" != "True" ]; then break; fi
    CURSOR=$(python3 -c "import json,sys; r=json.loads(sys.argv[1]); print(r.get('next_cursor',''))" "$PAGE_RESP")
  done

  python3 - "$ALL_PAGES" "$ROWS" "$DB" "$OP" "$RAN_AT" "$REQUESTED_BY" "$RESULT" << 'PYEOF'
import json, sys, subprocess, os
all_pages_str, rows_str, db, op, ran_at, requested_by, result_path = sys.argv[1:]
all_pages = json.loads(all_pages_str)
rows = json.loads(rows_str)
url_map = {}
for page in all_pages:
    gh = page.get('properties',{}).get('GitHub URL',{})
    if gh.get('url'):
        url_map[gh['url']] = page['id']
print(f'Built URL map with {len(url_map)} entries')
results = []
for row in rows:
    match_url = row.get('match')
    page_id = url_map.get(match_url)
    if not page_id:
        print(f'NO MATCH: {match_url}')
        results.append({'match': match_url, 'status': 'not_found'})
        continue
    patch_props = {k: v for k, v in row.items() if k != 'match'}
    payload = json.dumps({'properties': patch_props})
    r = subprocess.run([
        'curl', '-s', '-X', 'PATCH', f'https://api.notion.com/v1/pages/{page_id}',
        '-H', f'Authorization: Bearer {os.environ["NOTION_API_KEY"]}',
        '-H', 'Notion-Version: 2022-06-28',
        '-H', 'Content-Type: application/json',
        '-d', payload
    ], capture_output=True, text=True)
    resp = json.loads(r.stdout)
    if 'id' in resp:
        results.append({'match': match_url, 'status': 'ok', 'id': resp['id']})
        print(f'OK patched: {match_url}')
    else:
        results.append({'match': match_url, 'status': 'error', 'error': resp.get('message','unknown')})
        print(f'FAIL: {match_url} - {resp.get("message")}')
ok = sum(1 for r in results if r['status']=='ok')
failed = sum(1 for r in results if r['status']=='error')
skipped = sum(1 for r in results if r['status']=='not_found')
result = {
    'op': op, 'database_id': db, 'ran_at': ran_at, 'requested_by': requested_by,
    'summary': {'total': len(results), 'ok': ok, 'failed': failed, 'skipped': skipped},
    'results': results
}
open(result_path, 'w').write(json.dumps(result, indent=2))
print(f'Done - {ok} ok | {failed} failed | {skipped} skipped')
PYEOF

elif [ "$OP" = "append_note" ]; then
  PAGE_ID=$(python3 -c "import json; print(json.load(open('$QUEUE'))['page_id'])")
  CONTENT=$(python3 -c "import json; print(json.load(open('$QUEUE'))['content'])")
  PAYLOAD=$(python3 -c "
import json, sys
content = sys.argv[1]
payload = {
  'children': [{
    'object': 'block',
    'type': 'paragraph',
    'paragraph': {
      'rich_text': [{'type': 'text', 'text': {'content': content}}]
    }
  }]
}
print(json.dumps(payload))
" "$CONTENT")
  RESPONSE=$(notion_request PATCH "/blocks/${PAGE_ID}/children" "$PAYLOAD")
  python3 - "$RESPONSE" "$OP" "$DB" "$RAN_AT" "$REQUESTED_BY" "$RESULT" << 'PYEOF'
import json, sys
resp_str, op, db, ran_at, requested_by, result_path = sys.argv[1:]
resp = json.loads(resp_str)
if resp.get('object') == 'error':
    status = 'error'
    results = [{'status': 'error', 'error': resp.get('message', 'unknown')}]
else:
    status = 'ok'
    results = [{'status': 'ok', 'note': 'block appended'}]
result = {
    'op': op, 'database_id': db, 'ran_at': ran_at, 'requested_by': requested_by,
    'status': status,
    'summary': {'total': 1, 'ok': 1 if status=='ok' else 0, 'failed': 0 if status=='ok' else 1, 'skipped': 0},
    'results': results
}
open(result_path, 'w').write(json.dumps(result, indent=2))
print(f'append_note: {status}')
PYEOF

else
  write_error "Unknown op: $OP"
fi

echo "=== notion-ops-runner done ==="
