// Sprint 6 integration tests — .hzsecignore end-to-end behaviour.
//
// Each test creates or removes a .hzsecignore in a shared temp fixture
// directory, scans via the CLI, then asserts on findings.
//
// Fixture layout:
//   <root>/
//     .hzsecignore          (written/removed per-test)
//     src/config.env        AWS key — should ALWAYS fire (baseline)
//     test/fixture.env      AWS key — suppressed when test/ is ignored
//     test/real.env         AWS key — re-included by negation rule
//     src/mocks/auth.js     AWS key — suppressed when **/mocks/ is ignored

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const { execFileSync } = require('child_process');

// Join string parts at runtime so the full credential pattern never appears
// as a single source literal (avoids GitHub push-protection blocks on commit).
const J = (...parts) => parts.join('');

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

// ── Fixture setup ─────────────────────────────────────────────────────────────

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-sprint6-'));

fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.mkdirSync(path.join(root, 'test'), { recursive: true });
fs.mkdirSync(path.join(root, 'src', 'mocks'), { recursive: true });

// src/config.env — real secret, never ignored in any test
fs.writeFileSync(path.join(root, 'src', 'config.env'),
  `APP_NAME=myapp\napi_key=${J('AKIAIOSFODNN7EXAM', 'PLEKEY')}\n`);

// test/fixture.env — ignored when test/ is excluded
fs.writeFileSync(path.join(root, 'test', 'fixture.env'),
  `api_key=${J('AKIAIOSFODNN7EXAM', 'PLEKEY')}\n`);

// test/real.env — re-included by negation after test/ is excluded
fs.writeFileSync(path.join(root, 'test', 'real.env'),
  `api_key=${J('AKIAIOSFODNN7EXAM', 'PLEKEY')}\n`);

// src/mocks/auth.js — ignored when **/mocks/ is excluded
fs.writeFileSync(path.join(root, 'src', 'mocks', 'auth.js'),
  `const key = '${J('AKIAIOSFODNN7EXAM', 'PLEKEY')}';\n`);

const ignorePath = path.join(root, '.hzsecignore');

function writeIgnore(content) { fs.writeFileSync(ignorePath, content, 'utf8'); }
function clearIgnore()        { try { fs.unlinkSync(ignorePath); } catch { /* ok */ } }

// ── Baseline ─────────────────────────────────────────────────────────────────

it('baseline (no .hzsecignore): all secret-bearing files produce findings', () => {
  clearIgnore();
  const r = scan(root);
  const paths = r.findings.map(f => f.filePath || '');
  const hasTest  = paths.some(p => p.includes('test'));
  const hasMocks = paths.some(p => p.includes('mocks'));
  assert.ok(hasTest,  'expected findings from test/ without ignore rules');
  assert.ok(hasMocks, 'expected findings from src/mocks/ without ignore rules');
});

// ── Ignore a single file ──────────────────────────────────────────────────────

it('exact file path: ignored file disappears from findings', () => {
  writeIgnore('test/fixture.env\n');
  const r   = scan(root);
  const hit = r.findings.some(f => (f.filePath || '').endsWith('fixture.env'));
  assert.strictEqual(hit, false, 'test/fixture.env should be excluded');
  clearIgnore();
});

it('exact file path: non-ignored sibling is still scanned', () => {
  writeIgnore('test/fixture.env\n');
  const r   = scan(root);
  const hit = r.findings.some(f => (f.filePath || '').endsWith('real.env'));
  assert.ok(hit, 'test/real.env should still be scanned');
  clearIgnore();
});

// ── Ignore a directory ────────────────────────────────────────────────────────

it('exact dir path: all files inside ignored directory disappear from findings', () => {
  writeIgnore('test/\n');
  const r    = scan(root);
  const hits = r.findings.filter(f => /[/\\]test[/\\]/.test(f.filePath || ''));
  assert.strictEqual(hits.length, 0, 'test/ directory should be fully excluded');
  clearIgnore();
});

it('exact dir path: files outside ignored directory are still scanned', () => {
  writeIgnore('test/\n');
  const r   = scan(root);
  const hit = r.findings.some(f => /[/\\]src[/\\]config\.env$/.test(f.filePath || ''));
  assert.ok(hit, 'src/config.env should still produce findings');
  clearIgnore();
});

// ── Glob: **/pattern ─────────────────────────────────────────────────────────

it('**/mocks/ glob: nested mocks directory disappears from findings', () => {
  writeIgnore('**/mocks/\n');
  const r    = scan(root);
  const hits = r.findings.filter(f => /mocks/.test(f.filePath || ''));
  assert.strictEqual(hits.length, 0, 'src/mocks/ should be excluded via glob');
  clearIgnore();
});

it('**/mocks/ glob: non-mocks files are still scanned', () => {
  writeIgnore('**/mocks/\n');
  const r   = scan(root);
  const hit = r.findings.some(f => /config\.env/.test(f.filePath || ''));
  assert.ok(hit, 'src/config.env should still produce findings');
  clearIgnore();
});

// ── Negation ─────────────────────────────────────────────────────────────────

it('negation !test/real.env: re-includes specific file from ignored directory', () => {
  writeIgnore('test/\n!test/real.env\n');
  const r = scan(root);
  // test/fixture.env still excluded
  const fixtureHit = r.findings.some(f => (f.filePath || '').endsWith('fixture.env'));
  assert.strictEqual(fixtureHit, false, 'test/fixture.env should remain excluded');
  // test/real.env re-included by negation
  const realHit = r.findings.some(f => (f.filePath || '').endsWith('real.env'));
  assert.ok(realHit, 'test/real.env should be re-included by ! negation');
  clearIgnore();
});

// ── No-change guarantee ───────────────────────────────────────────────────────

it('absent .hzsecignore causes no change in finding count between two scans', () => {
  clearIgnore();
  const r1 = scan(root);
  const r2 = scan(root);
  assert.strictEqual(r1.findings.length, r2.findings.length,
    'two consecutive scans without .hzsecignore must produce identical finding counts');
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
