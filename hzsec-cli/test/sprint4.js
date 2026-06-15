// Sprint 4 tests — backup-directory exclusions and SVG namespace false-positive fix.
//
// Part A: backup-* directories and .bak files must NOT appear in scan results.
// Part B: SVG/W3C namespace http:// URIs must NOT trigger "Unencrypted endpoint reference".
//         Real HTTP endpoints MUST still trigger.

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const { execFileSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'bin', 'hzsec.js');

function run(args) {
  try {
    return execFileSync('node', [CLI, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (err) {
    err.stdout = err.stdout?.toString();
    err.stderr = err.stderr?.toString();
    throw err;
  }
}

function scan(target) {
  return JSON.parse(run(['scan', target, '--format', 'json', '--quiet']));
}

let pass = 0, fail = 0;
function it(name, fn) {
  try { fn(); console.log(`ok   ${name}`); pass++; }
  catch (err) { console.log(`FAIL ${name}\n     ${err.message}`); fail++; }
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-sprint4-'));

// Part A — backup directory fixture
// Project with a real source file AND a backup-before-* directory containing a secret copy.
// Only the real source file should be scanned; the backup dir must be silently skipped.
const dirProject = path.join(root, 'my-project');
const dirBackup  = path.join(root, 'my-project', 'backup-before-refactor');
const dirBakFile = path.join(root, 'bak-files');

fs.mkdirSync(dirProject, { recursive: true });
fs.mkdirSync(dirBackup, { recursive: true });
fs.mkdirSync(dirBakFile, { recursive: true });

// Real source file — has a real secret that SHOULD be found
fs.writeFileSync(path.join(dirProject, 'config.env'), [
  'APP_NAME=myapp',
  'api_key=AKIAIOSFODNN7EXAMPLE',
].join('\n'));

// Backup dir — also has a secret BUT must not be scanned
fs.writeFileSync(path.join(dirBackup, 'config.env'), [
  'APP_NAME=myapp',
  'api_key=AKIAIOSFODNN7EXAMPLE',
].join('\n'));

// .bak file alongside the source — must be ignored
fs.writeFileSync(path.join(dirProject, 'config.env.bak'), [
  'api_key=AKIAIOSFODNN7EXAMPLE',
].join('\n'));

// .backup extension file — must be ignored
fs.writeFileSync(path.join(dirProject, 'old.backup'), [
  'api_key=AKIAIOSFODNN7EXAMPLE',
].join('\n'));

// A standalone .bak file in its own dir
fs.writeFileSync(path.join(dirBakFile, 'keys.txt.bak'), 'api_key=AKIAIOSFODNN7EXAMPLE\n');

// Part B — SVG namespace fixture
const dirSVG = path.join(root, 'svg-project');
fs.mkdirSync(dirSVG, { recursive: true });

// config file with SVG xmlns — must NOT trigger HTTP finding
fs.writeFileSync(path.join(dirSVG, 'icon.config.xml'), [
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
  '  <use xlink:href="#icon"/>',
  '</svg>',
].join('\n'));

// config file with a real HTTP endpoint — MUST still trigger
fs.writeFileSync(path.join(dirSVG, 'app.config.yml'), [
  'api_endpoint: http://api.example.com/v1/data',
].join('\n'));

// config file with an internal HTTP endpoint — MUST still trigger
fs.writeFileSync(path.join(dirSVG, 'internal.config.yml'), [
  'metrics_url: http://metrics.internal.corp/push',
].join('\n'));

// ── Part A tests ──────────────────────────────────────────────────────────────

it('backup-before-* directory is excluded: findings come only from real source', () => {
  const r = scan(dirProject);
  // All findings must have a filePath that does NOT include the backup dir name
  const backupHits = r.findings.filter(f => f.filePath && f.filePath.includes('backup-before-'));
  assert.strictEqual(backupHits.length, 0,
    'found findings from backup-before-* directory: ' + backupHits.map(f => f.filePath).join(', '));
});

it('real source file inside project IS still scanned', () => {
  const r = scan(dirProject);
  const sourceHits = r.findings.filter(f => f.filePath && f.filePath.endsWith('config.env') && !f.filePath.includes('backup-'));
  assert.ok(sourceHits.length > 0,
    'expected findings from real config.env but got 0 (total findings: ' + r.findings.length + ')');
});

it('.bak file is excluded from scan', () => {
  const r = scan(dirProject);
  const bakHits = r.findings.filter(f => f.filePath && f.filePath.endsWith('.bak'));
  assert.strictEqual(bakHits.length, 0,
    'found findings from .bak file: ' + bakHits.map(f => f.filePath).join(', '));
});

it('.backup file is excluded from scan', () => {
  const r = scan(dirProject);
  const backupHits = r.findings.filter(f => f.filePath && f.filePath.endsWith('.backup'));
  assert.strictEqual(backupHits.length, 0,
    'found findings from .backup file: ' + backupHits.map(f => f.filePath).join(', '));
});

it('standalone .bak file is excluded when scanned directly by directory', () => {
  const r = scan(dirBakFile);
  assert.strictEqual(r.findings.length, 0,
    'expected 0 findings from directory of .bak files, got: ' + r.findings.length);
});

// ── Part B tests ──────────────────────────────────────────────────────────────

it('SVG xmlns W3C namespace URI does NOT trigger unencrypted endpoint finding', () => {
  const r = scan(path.join(dirSVG, 'icon.config.xml'));
  const hits = r.findings.filter(f => f.title === 'Unencrypted endpoint reference');
  assert.strictEqual(hits.length, 0,
    'SVG xmlns should not trigger HTTP finding, got: ' + hits.map(f => f.rawLine?.trim()).join('; '));
});

it('real HTTP API endpoint DOES trigger unencrypted endpoint finding', () => {
  const r = scan(path.join(dirSVG, 'app.config.yml'));
  const hits = r.findings.filter(f => f.title === 'Unencrypted endpoint reference');
  assert.ok(hits.length > 0,
    'expected "Unencrypted endpoint reference" for http://api.example.com, got 0 findings');
});

it('internal HTTP endpoint DOES trigger unencrypted endpoint finding', () => {
  const r = scan(path.join(dirSVG, 'internal.config.yml'));
  const hits = r.findings.filter(f => f.title === 'Unencrypted endpoint reference');
  assert.ok(hits.length > 0,
    'expected "Unencrypted endpoint reference" for internal http:// URL, got 0 findings');
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
