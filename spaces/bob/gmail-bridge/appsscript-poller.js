/**
 * Bob Gmail Bridge — Google Apps Script Poller
 *
 * Watches Gmail for emails/drafts with BOB_ subject prefixes
 * and pushes payloads to GitHub.
 *
 * Setup:
 *   1. Go to script.google.com — New project — paste this file
 *   2. Script properties (gear icon → Script properties):
 *        GITHUB_PAT  — fine-grained PAT for nothinginfinity/repo-copilot, contents R+W
 *        REPO        — nothinginfinity/repo-copilot
 *        BOB_EMAIL   — the Gmail address Bob sends to (your Gmail address)
 *   3. Save → Run → authorize Gmail + GitHub fetch permissions
 *   4. Triggers (clock icon) → Add trigger:
 *        Function: pollBobOutbox
 *        Event: Time-driven → Minutes timer → Every 5 minutes
 */

const PROPS = PropertiesService.getScriptProperties();
const GITHUB_PAT = () => PROPS.getProperty('GITHUB_PAT');
const REPO       = () => PROPS.getProperty('REPO') || 'nothinginfinity/repo-copilot';
const BRANCH     = 'main';
const GH_API     = 'https://api.github.com';
const PROCESSED_LABEL = 'BOB_PROCESSED';

// ---- Main poll function --------------------------------------------------

function pollBobOutbox() {
  ensureLabel(PROCESSED_LABEL);

  // Search for unprocessed BOB_ emails
  const query = 'subject:BOB_ -label:BOB_PROCESSED';
  const threads = GmailApp.search(query, 0, 20);

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const message of messages) {
      const subject = message.getSubject();
      const body    = message.getPlainBody().trim();

      try {
        processMessage(subject, body);
        // Mark processed
        thread.addLabel(GmailApp.getUserLabelByName(PROCESSED_LABEL));
        Logger.log(`✅ Processed: ${subject}`);
      } catch (e) {
        Logger.log(`❌ Error processing "${subject}": ${e.message}`);
        // Don’t mark processed — retry next cycle
        // After 3 failures you may want to label BOB_ERROR to avoid loops
      }
    }
  }

  // Also check drafts addressed to BOB_OUTBOX pattern
  processDrafts();
}

// ---- Draft processing ----------------------------------------------------

function processDrafts() {
  const drafts = GmailApp.getDrafts();
  for (const draft of drafts) {
    const message = draft.getMessage();
    const subject = message.getSubject() || '';
    if (!subject.startsWith('BOB_')) continue;

    const body = message.getPlainBody().trim();
    try {
      processMessage(subject, body);
      draft.delete();
      Logger.log(`✅ Draft processed and deleted: ${subject}`);
    } catch (e) {
      Logger.log(`❌ Draft error "${subject}": ${e.message}`);
    }
  }
}

// ---- Message router ------------------------------------------------------

function processMessage(subject, body) {
  const prefix = subject.split(':')[0].trim().toUpperCase();

  // Parse JSON payload if present, else use raw body
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = { raw: body };
  }

  switch (prefix) {
    case 'BOB_MAIL_APPEND':
      handleMailAppend(payload);
      break;
    case 'BOB_TURN_BUNDLE':
      handleTurnBundle(payload);
      break;
    case 'BOB_GITHUB_PUSH':
      handleGithubPush(payload);
      break;
    case 'BOB_NOTION_ROW':
      handleNotionRow(payload);
      break;
    case 'BOB_ERROR':
      Logger.log(`⚠️ BOB_ERROR received: ${JSON.stringify(payload)}`);
      break;
    default:
      throw new Error(`Unknown prefix: ${prefix}`);
  }
}

// ---- Handlers ------------------------------------------------------------

function handleMailAppend(payload) {
  // payload: { content: string, mark_read_id?: string }
  const content     = payload.content || payload.raw;
  const markReadId  = payload.mark_read_id;

  if (!content) throw new Error('BOB_MAIL_APPEND: content required');

  const path = 'spaces/mail.md';
  let { content: current, sha } = ghGetFile(path);

  // Mark a message as read if requested
  if (markReadId) {
    const pattern = new RegExp(
      `(## 📨 ${markReadId}[\\s\\S]*?\\*\\*status:\\*\\* )unread`, 'g'
    );
    current = current.replace(pattern, '$1read');
  }

  const updated = current.trimEnd() + '\n\n---\n\n' + content.trim() + '\n';
  ghPutFile(path, updated, `mail: bob append via gmail bridge`, sha);
}

function handleTurnBundle(payload) {
  // payload: turn_json object (must have cid + session)
  const turn = payload.turn_json || payload;
  if (!turn.cid || !turn.session) throw new Error('BOB_TURN_BUNDLE: turn_json needs cid + session');

  const path    = `.github/turns/${turn.session}/${turn.cid}/turn.json`;
  const content = JSON.stringify(turn, null, 2);

  let sha;
  try { ({ sha } = ghGetFile(path)); } catch { /* new file */ }

  ghPutFile(path, content, `feat(turn): ${turn.title || turn.cid} (bob-gmail-bridge)`, sha);

  // If mail_update included, also update mail
  if (payload.mail_update) {
    handleMailAppend(payload.mail_update);
  }
}

function handleGithubPush(payload) {
  // payload: { files: [{path, content}], message }
  const { files, message } = payload;
  if (!files || !message) throw new Error('BOB_GITHUB_PUSH: files + message required');

  for (const file of files) {
    let sha;
    try { ({ sha } = ghGetFile(file.path)); } catch { /* new file */ }
    ghPutFile(file.path, file.content, message, sha);
  }
}

function handleNotionRow(payload) {
  // Placeholder — wire up Notion API here when ready
  Logger.log(`BOB_NOTION_ROW (not yet wired): ${JSON.stringify(payload)}`);
}

// ---- GitHub helpers ------------------------------------------------------

function ghGetFile(path) {
  const url = `${GH_API}/repos/${REPO()}/contents/${path}?ref=${BRANCH}`;
  const res = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_PAT()}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'repo-copilot-bob-gmail-bridge/1.0',
    },
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() === 404) throw new Error(`File not found: ${path}`);
  if (res.getResponseCode() !== 200) throw new Error(`GitHub GET ${res.getResponseCode()}: ${path}`);

  const data    = JSON.parse(res.getContentText());
  const content = Utilities.newBlob(Utilities.base64Decode(data.content.replace(/\n/g, ''))).getDataAsString();
  return { content, sha: data.sha };
}

function ghPutFile(path, content, message, sha) {
  const url  = `${GH_API}/repos/${REPO()}/contents/${path}`;
  const body = {
    message,
    content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_PAT()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'repo-copilot-bob-gmail-bridge/1.0',
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200 && res.getResponseCode() !== 201) {
    throw new Error(`GitHub PUT ${res.getResponseCode()} on ${path}: ${res.getContentText()}`);
  }

  return JSON.parse(res.getContentText());
}

// ---- Utility -------------------------------------------------------------

function ensureLabel(name) {
  if (!GmailApp.getUserLabelByName(name)) {
    GmailApp.createLabel(name);
  }
}
