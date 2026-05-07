#!/usr/bin/env node
/**
 * gitzip validate-and-unpack.js
 * Runs inside GitHub Actions (Node 20) to validate and unpack gitzip drops.
 *
 * Security checks per file entry:
 *   - Rejects absolute paths
 *   - Rejects path traversal (..)
 *   - Rejects .git/** destinations
 *   - Rejects .github/workflows/** unless manifest sets allow_workflow_writes: true
 *   - Rejects _gitzip/** destinations (no recursive drops)
 *   - Verifies sha256 and size if provided in manifest
 *
 * Manifest schema: see .gitzip/gitzip-manifest.schema.json
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SUMMARY_FLAG = process.argv.includes('--summary');
const DRYRUN_FLAG  = process.argv.includes('--dry-run');
const REPO_ROOT    = process.cwd();
const DROP_DIR     = path.join(REPO_ROOT, '.gitzip');

// ── Path safety ──────────────────────────────────────────────────────────────

function normalizeDest(dest) {
  // Resolve relative to repo root, then ensure it stays inside.
  const resolved = path.resolve(REPO_ROOT, dest);
  if (!resolved.startsWith(REPO_ROOT + path.sep) && resolved !== REPO_ROOT) {
    throw new Error(`Path traversal detected: "${dest}" resolves outside repo root.`);
  }
  return resolved;
}

function assertSafeDest(dest, allowWorkflowWrites) {
  if (!dest || typeof dest !== 'string') throw new Error('Missing or invalid dest field.');
  if (path.isAbsolute(dest))             throw new Error(`Absolute path not allowed: "${dest}"`);
  if (dest.includes('..'))               throw new Error(`Path traversal not allowed: "${dest}"`);
  if (dest.startsWith('.git/') || dest === '.git') throw new Error(`.git/** destination not allowed: "${dest}"`);
  if (dest.startsWith('_gitzip/') || dest.startsWith('.gitzip/')) throw new Error(`Recursive drop not allowed: "${dest}"`);
  if (!allowWorkflowWrites && dest.startsWith('.github/workflows/')) {
    throw new Error(`.github/workflows/** write blocked. Set allow_workflow_writes: true in manifest to override.`);
  }
}

// ── SHA-256 verification ─────────────────────────────────────────────────────

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const drops = fs.readdirSync(DROP_DIR).filter(f => f.startsWith('drop-') && f.endsWith('.zip'));

if (drops.length === 0) {
  console.log('No drop-*.zip files found.');
  process.exit(0);
}

const summaryLines = [];
let totalDeployed = 0;
let errors = 0;

for (const zipName of drops) {
  const zipPath = path.join(DROP_DIR, zipName);
  const tmpDir  = `/tmp/gitzip-${zipName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  console.log(`\n=== Processing ${zipName} ===`);
  summaryLines.push(`\n### ${zipName}`);

  try {
    // Unzip to temp dir first — never directly into repo root
    fs.mkdirSync(tmpDir, { recursive: true });
    execSync(`unzip -o "${zipPath}" -d "${tmpDir}"`, { stdio: 'inherit' });

    // Load and validate manifest
    const manifestPath = path.join(tmpDir, 'gitzip-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Missing gitzip-manifest.json inside zip.');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (manifest.version !== 2) {
      throw new Error(`Unsupported manifest version: ${manifest.version}. Expected 2.`);
    }
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      throw new Error('Manifest has no files array or it is empty.');
    }

    const allowWorkflowWrites = manifest.allow_workflow_writes === true;
    const isDryRun = DRYRUN_FLAG || manifest.dry_run === true;

    if (isDryRun) {
      console.log('DRY RUN MODE — no files will be written to the repo.');
      summaryLines.push('> **Dry run** — no files committed.');
    }

    summaryLines.push(`- Manifest version: ${manifest.version}`);
    summaryLines.push(`- Commit message: \`${manifest.commit_message || '(none)'}\``);
    summaryLines.push(`- Files: ${manifest.files.length}`);
    if (isDryRun) summaryLines.push('- **Mode: dry-run**');

    const deployedFiles = [];

    for (const entry of manifest.files) {
      const { src, dest, sha256: expectedSha, size: expectedSize } = entry;

      if (!src || typeof src !== 'string') throw new Error(`Invalid src in entry: ${JSON.stringify(entry)}`);

      // Security: validate dest path
      assertSafeDest(dest, allowWorkflowWrites);

      const srcPath  = path.join(tmpDir, src);
      const destPath = normalizeDest(dest);

      if (!fs.existsSync(srcPath)) {
        throw new Error(`Source file not found in zip: "${src}"`);
      }

      // Optional size check
      if (expectedSize !== undefined) {
        const actualSize = fs.statSync(srcPath).size;
        if (actualSize !== expectedSize) {
          throw new Error(`Size mismatch for "${src}": expected ${expectedSize}, got ${actualSize}.`);
        }
      }

      // Optional SHA-256 check
      if (expectedSha) {
        const actualSha = sha256(srcPath);
        if (actualSha !== expectedSha) {
          throw new Error(`SHA-256 mismatch for "${src}": expected ${expectedSha}, got ${actualSha}.`);
        }
        console.log(`  ✓ SHA-256 verified: ${src}`);
      }

      if (!isDryRun) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Deployed: ${src} → ${dest}`);
      } else {
        console.log(`  [dry-run] Would deploy: ${src} → ${dest}`);
      }

      deployedFiles.push(`\`${dest}\``);
      totalDeployed++;
    }

    summaryLines.push(`- Deployed: ${deployedFiles.join(', ')}`);
    summaryLines.push('- Status: ✅ success');

  } catch (err) {
    errors++;
    console.error(`  ✗ ERROR processing ${zipName}: ${err.message}`);
    summaryLines.push(`- Status: ❌ FAILED — ${err.message}`);
    // Clean up tmp and exit non-zero so the Action fails visibly
    process.exitCode = 1;
  } finally {
    // Clean up temp dir
    try { execSync(`rm -rf "${tmpDir}"`, { stdio: 'ignore' }); } catch (_) {}
  }
}

// Write summary for GitHub Actions step summary
const summaryMd = [
  `## gitzip-unpack summary`,
  `- Drops processed: ${drops.length}`,
  `- Files deployed: ${totalDeployed}`,
  `- Errors: ${errors}`,
  ...summaryLines
].join('\n');

fs.writeFileSync('/tmp/gitzip-summary.md', summaryMd);

if (SUMMARY_FLAG) {
  // When called with --summary, print short commit message label
  const names = drops.join(', ');
  console.log(`${drops.length} drop(s): ${names}`);
}

if (errors > 0) {
  process.exit(1);
}
