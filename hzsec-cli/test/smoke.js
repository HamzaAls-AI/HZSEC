// Smoke test — invokes the CLI three different ways, checks the report shape
// in each, and exits non-zero if anything regresses. Intentionally has no
// dependency on a test framework — Node + assert keeps the package tiny.

const assert  = require('assert');
const fs      = require('fs');
const os      = require('os');
const path    = require('path');
const { execFileSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'bin', 'hzsec.js');

function run(args, opts = {}) {
  try {
    return execFileSync('node', [CLI, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts
    });
  } catch (err) {
    err.stdout = err.stdout?.toString();
    err.stderr = err.stderr?.toString();
    throw err;
  }
}

// ── Fixture: a folder with one obvious secret ──────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-smoke-'));
fs.writeFileSync(path.join(tmp, 'leaky.js'),
  'const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";\n' +
  'const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";\n');

let pass = 0, fail = 0;
function it(name, fn) {
  try { fn(); console.log(`ok   ${name}`); pass++; }
  catch (err) { console.log(`FAIL ${name}\n     ${err.message}`); fail++; }
}

// ── Tests ──────────────────────────────────────────────────────────────────

it('--version prints something semver-ish', () => {
  const out = run(['--version']).trim();
  assert.match(out, /^\d+\.\d+\.\d+/, 'version output: ' + out);
});

it('scan against fixture finds at least one secret', () => {
  const out = run(['scan', tmp, '--format', 'json', '--quiet']);
  const report = JSON.parse(out);
  assert.strictEqual(report.schema, 'hzsec.report.v1');
  assert.ok(report.findings.length > 0, 'expected findings');
  assert.ok(report.findings.some(f => f.type === 'secret'), 'expected a secret finding');
});

it('SARIF output is valid JSON with required keys', () => {
  const out = run(['scan', tmp, '--format', 'sarif', '--quiet']);
  const sarif = JSON.parse(out);
  assert.strictEqual(sarif.version, '2.1.0');
  assert.ok(Array.isArray(sarif.runs) && sarif.runs.length === 1);
  assert.ok(sarif.runs[0].tool.driver.name === 'HZSec');
  assert.ok(sarif.runs[0].results.length > 0);
});

it('--fail-on critical exits 1 when criticals exist', () => {
  let exited = 0;
  try { run(['scan', tmp, '--quiet', '--no-color', '--fail-on', 'critical,high']); }
  catch (e) { exited = e.status; }
  assert.strictEqual(exited, 1, 'expected exit 1, got ' + exited);
});

it('--fail-on info exits 0 on clean fixture', () => {
  const clean = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-clean-'));
  fs.writeFileSync(path.join(clean, 'app.js'), 'console.log("hi")\n');
  const out = run(['scan', clean, '--quiet', '--no-color', '--fail-on', 'info']);
  assert.ok(out.includes('No findings') || out.length === 0);
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
