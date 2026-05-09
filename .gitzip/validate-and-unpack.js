#!/usr/bin/env node
/**
 * gitzip validate-and-unpack.js
 * Runs inside GitHub Actions (Node 20) to validate and unpack gitzip drops.
 *
 * Security checks per file entry:
 *   - Rejects absolute paths
 *   - Rejects path traversal (..) in both dest AND src
 *   - Rejects .git/** destinations
 *   - Rejects .github/workflows/** unless manifest sets allow_workflow_writes: true
 *   - Rejects .gitzip/** destinations (no recursive drops)
 *   - Verifies sha256 and size if provided in manifest
 *   - Guards against zip bombs (max file count + max total bytes)
 *   - No shell interpolation — uses execFileSync + fs.rmSync (no shell injection surface)
 *
 * Manifest schema: see .gitzip/gitzip-manifest.schema.json
 */

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const crypto = require('crypto');

const SUMMARY_FLAG = process.argv.includes('--summary');
const DRYRUN_FLAG  = process.argv.includes('--dry-run');
const REPO_ROOT    = process.cwd();
const DROP_DIR     = path.join(REPO_ROOT, '.gitzip');

// ── Safety limits ─────────────────────────────────────────────────────────────
const MAX_FILES_PER_DROP  = 200;
const MAX_TOTAL_BYTES     = 50 * 1024 * 1024; // 50 MB across all files in one drop

// ── Path safety ───────────────────────────────────────────────────────────────

/**
 * Resolve dest relative to REPO_ROOT and assert it stays strictly inside.
 * This is the hard backstop — assertSafeDest is defense-in-depth.
 */
function normalizeDest(dest) {
  const resolved = path.resolve(REPO_ROOT, dest);
  // Must be strictly under REPO_ROOT (not equal to it — no writing to root itself)
  if (!resolved.startsWith(REPO_ROOT + path.sep)) {
    throw new Error(`Path traversal detected: "${dest}" resolves outside repo root.`);
  }
  return resolved;
}

/**
 * Resolve src relative to tmpDir and assert it stays strictly inside.
 * Prevents a crafted manifest src like "../../etc/passwd" from escaping the temp dir.
 */
function normalizeSrc(tmpDir, src) {
  const resolved = path.resolve(tmpDir, src);
  if (!resolved.startsWith(tmpDir + path.sep)) {
    throw new Error(`Source path escape detected: "${src}" resolves outside temp dir.`);
  }
  return resolved;
}

/**
 * String-level pre-checks on dest before we even call path.resolve.
 * Fast-fail for obviously bad inputs; normalizeDest is the hard guarantee.
 */
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

// ── SHA-256 verification ──────────────────────────────────────────────────────

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
  // Safe tmp dir name: replace everything except alphanumeric, dash, underscore
  const safeName = zipName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const tmpDir   = `/tmp/gitzip-${safeName}`;

  console.log(`\n=== Processing ${zipName} ===`);
  summaryLines.push(`\n### ${zipName}`);

  try {
    // Unzip to temp dir first — never directly into repo root.
    // Use execFileSync (no shell) to eliminate shell injection risk.
    fs.mkdirSync(tmpDir, { recursive: true });
    execFileSync('unzip', ['-o', zipPath, '-d', tmpDir], { stdio: 'inherit' });

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

    // ── Zip bomb guard ────────────────────────────────────────────────────────
    if (manifest.files.length > MAX_FILES_PER_DROP) {
      throw new Error(`File count exceeds limit: ${manifest.files.length} > ${MAX_FILES_PER_DROP}. Possible zip bomb.`);
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
    let dropTotalBytes  = 0;

    for (const entry of manifest.files) {
      const { src, dest, sha256: expectedSha, size: expectedSize } = entry;

      if (!src || typeof src !== 'string') throw new Error(`Invalid src in entry: ${JSON.stringify(entry)}`);

      // Security: validate dest path (string checks first, then resolve)
      assertSafeDest(dest, allowWorkflowWrites);
      const destPath = normalizeDest(dest);

      // Security: validate src path (must stay inside tmpDir)
      const srcPath = normalizeSrc(tmpDir, src);

      if (!fs.existsSync(srcPath)) {
        throw new Error(`Source file not found in zip: "${src}"`);
      }

      const actualSize = fs.statSync(srcPath).size;

      // ── Per-file size check ───────────────────────────────────────────────
      if (expectedSize !== undefined) {
        if (actualSize !== expectedSize) {
          throw new Error(`Size mismatch for "${src}": expected ${expectedSize}, got ${actualSize}.`);
        }
      }

      // ── Running total bytes guard (zip bomb) ──────────────────────────────
      dropTotalBytes += actualSize;
      if (dropTotalBytes > MAX_TOTAL_BYTES) {
        throw new Error(`Total unpacked size exceeds ${MAX_TOTAL_BYTES / (1024 * 1024)} MB limit. Possible zip bomb — aborting.`);
      }

      // ── SHA-256 check ─────────────────────────────────────────────────────
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
    process.exitCode = 1;
  } finally {
    // Clean up temp dir — fs.rmSync, no shell involved
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
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
  const names = drops.join(', ');
  console.log(`${drops.length} drop(s): ${names}`);
}

if (errors > 0) {
  process.exit(1);
}
