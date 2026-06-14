// Targeted tests for lock-file / package-manager noise reduction.
// Covers all 9 required cases:
//   Noise (must NOT trigger): resolved http URL, integrity hash, yarn registry URL,
//     pnpm integrity, package.json metadata URL
//   Signal (MUST trigger): _authToken, GitHub PAT in Cargo.lock, user:pass@ URL,
//     real secret in package.json
// Plus: SARIF output validity from a lock file scan.

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

// ── Fixtures ───────────────────────────────────────────────────────────────
// Each fixture lives in its own temp dir so the file name is correct
// (the filter dispatches on path.basename).

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-locktest-'));

function mkdir(name) {
  const d = path.join(root, name);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

// ── Noise fixtures (should produce 0 findings) ─────────────────────────────

// package-lock.json: http resolved URL + sha integrity hash + admin:true package field
const dirLock = mkdir('lock');
fs.writeFileSync(path.join(dirLock, 'package-lock.json'), JSON.stringify({
  name: 'test-project',
  lockfileVersion: 2,
  packages: {
    'node_modules/old-pkg': {
      version: '1.0.0',
      resolved: 'http://registry.npmjs.org/old-pkg/-/old-pkg-1.0.0.tgz',
      integrity: 'sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==',
      admin: true
    }
  }
}, null, 2));

// yarn.lock: https + http resolved URLs + integrity hash
const dirYarn = mkdir('yarn');
fs.writeFileSync(path.join(dirYarn, 'yarn.lock'), [
  'lodash@^4.17.21:',
  '  version "4.17.21"',
  '  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"',
  '  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZhrNekegXR5BbMaYle5A==',
  '',
  'old-pkg@^1.0.0:',
  '  version "1.0.0"',
  '  resolved "http://registry.yarnpkg.com/old-pkg/-/old-pkg-1.0.0.tgz#abc123"',
  '  integrity sha1-abc123def456ghi789=',
].join('\n'));

// pnpm-lock.yaml: integrity hash + tarball URL
const dirPnpm = mkdir('pnpm');
fs.writeFileSync(path.join(dirPnpm, 'pnpm-lock.yaml'), [
  'lockfileVersion: 6.0',
  'packages:',
  '  /lodash@4.17.21:',
  '    resolution:',
  '      integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZhrNekegXR5BbMaYle5A==',
  '      tarball: https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
].join('\n'));

// package.json: metadata http URLs (homepage, bugs, repository.url)
const dirMeta = mkdir('pkg-meta');
fs.writeFileSync(path.join(dirMeta, 'package.json'), JSON.stringify({
  name: 'legacy-app',
  version: '1.0.0',
  homepage: 'http://github.com/user/legacy-app',
  bugs: 'http://github.com/user/legacy-app/issues',
  repository: { type: 'git', url: 'http://github.com/user/legacy-app.git' }
}, null, 2));

// ── Signal fixtures (MUST produce findings) ────────────────────────────────

// package-lock.json with _authToken — private registry credential
const dirAuthToken = mkdir('auth-token');
fs.writeFileSync(path.join(dirAuthToken, 'package-lock.json'), JSON.stringify({
  name: 'enterprise-app',
  lockfileVersion: 2,
  packages: {
    'node_modules/private-pkg': {
      version: '1.0.0',
      resolved: 'https://npm.internal.company.com/private-pkg-1.0.0.tgz',
      integrity: 'sha512-abc123def456==',
      _authToken: 'npm_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890'
    }
  }
}, null, 2));

// Cargo.lock with GitHub fine-grained PAT embedded in a git source URL
const dirCargo = mkdir('cargo');
fs.writeFileSync(path.join(dirCargo, 'Cargo.lock'), [
  '[[package]]',
  'name = "internal-crate"',
  'version = "0.1.0"',
  'source = "git+https://github_pat_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456@github.com/org/private.git#abc"',
  '',
  '[[package]]',
  'name = "serde"',
  'version = "1.0.0"',
  'source = "registry+https://github.com/rust-lang/crates.io-index"',
  'checksum = "e978d28fa4e9d3c2c4b0e8f2a5e1d3c4b5e6f7a8"',
].join('\n'));

// package-lock.json with user:password@ embedded in a resolved URL (private registry)
const dirEmbedCred = mkdir('embed-cred');
fs.writeFileSync(path.join(dirEmbedCred, 'package-lock.json'), JSON.stringify({
  name: 'enterprise-app',
  lockfileVersion: 2,
  packages: {
    'node_modules/private-pkg': {
      version: '2.0.0',
      resolved: 'https://deploy_user:s3cr3tRegistryPass@npm.internal.company.com/private-pkg-2.0.0.tgz',
      integrity: 'sha512-xyz789=='
    }
  }
}, null, 2));

// package.json with a real AWS access key (must still be caught)
const dirPkgSecret = mkdir('pkg-secret');
fs.writeFileSync(path.join(dirPkgSecret, 'package.json'), JSON.stringify({
  name: 'test',
  version: '1.0.0',
  api_key: 'AKIAIOSFODNN7EXAMPLE'
}, null, 2));

// ── Tests ──────────────────────────────────────────────────────────────────

// ─ Noise: must NOT produce findings ────────────────────────────────────────

it('package-lock.json http resolved URL is NOT flagged', () => {
  const r = scan(path.join(dirLock, 'package-lock.json'));
  const hits = r.findings.filter(f => f.title === 'Unencrypted endpoint reference');
  assert.strictEqual(hits.length, 0,
    'http resolved URL should be suppressed, got: ' + hits.map(f => f.rawLine?.trim()).join('; '));
});

it('package-lock.json sha512 integrity hash is NOT flagged', () => {
  const r = scan(path.join(dirLock, 'package-lock.json'));
  const hits = r.findings.filter(f => f.rawLine && f.rawLine.includes('sha512-'));
  assert.strictEqual(hits.length, 0, 'integrity hash line produced a finding');
});

it('yarn.lock registry URLs are NOT flagged', () => {
  const r = scan(path.join(dirYarn, 'yarn.lock'));
  assert.strictEqual(r.findings.length, 0,
    'yarn.lock produced findings: ' + r.findings.map(f => f.title).join(', '));
});

it('pnpm-lock.yaml integrity hash is NOT flagged', () => {
  const r = scan(path.join(dirPnpm, 'pnpm-lock.yaml'));
  const hits = r.findings.filter(f => f.rawLine && /integrity/.test(f.rawLine));
  assert.strictEqual(hits.length, 0, 'pnpm integrity line produced a finding');
});

it('package.json metadata http URLs (homepage/bugs/repository) are NOT flagged', () => {
  const r = scan(path.join(dirMeta, 'package.json'));
  const hits = r.findings.filter(f => f.title === 'Unencrypted endpoint reference');
  assert.strictEqual(hits.length, 0,
    'metadata URL produced HTTP finding: ' + hits.map(f => f.rawLine?.trim()).join('; '));
});

// ─ Signal: MUST produce findings ───────────────────────────────────────────

it('_authToken in package-lock.json DOES trigger', () => {
  const r = scan(path.join(dirAuthToken, 'package-lock.json'));
  const hits = r.findings.filter(f => f.title === 'Registry auth token exposed');
  assert.ok(hits.length > 0,
    'expected "Registry auth token exposed" finding for _authToken, got: ' +
    (r.findings.length === 0 ? 'no findings at all' : r.findings.map(f => f.title).join(', ')));
});

it('GitHub PAT in Cargo.lock git source URL DOES trigger', () => {
  const r = scan(path.join(dirCargo, 'Cargo.lock'));
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed');
  assert.ok(hits.length > 0,
    'expected "GitHub token exposed" for github_pat_ in Cargo.lock git source, got: ' +
    (r.findings.length === 0 ? 'no findings at all' : r.findings.map(f => f.title).join(', ')));
});

it('user:password@ embedded in resolved URL DOES trigger', () => {
  const r = scan(path.join(dirEmbedCred, 'package-lock.json'));
  const hits = r.findings.filter(f => f.title === 'Credentials embedded in URL');
  assert.ok(hits.length > 0,
    'expected "Credentials embedded in URL" finding, got: ' +
    (r.findings.length === 0 ? 'no findings at all' : r.findings.map(f => f.title).join(', ')));
});

it('real AWS key inside package.json DOES trigger', () => {
  const r = scan(path.join(dirPkgSecret, 'package.json'));
  const hits = r.findings.filter(f => f.type === 'secret');
  assert.ok(hits.length > 0,
    'expected a secret finding for AWS key in package.json, got 0');
});

// ─ Format ──────────────────────────────────────────────────────────────────

it('SARIF output from lock file scan is valid JSON with required keys', () => {
  const out = run(['scan', path.join(dirLock, 'package-lock.json'), '--format', 'sarif', '--quiet']);
  const sarif = JSON.parse(out);
  assert.strictEqual(sarif.version, '2.1.0');
  assert.ok(Array.isArray(sarif.runs) && sarif.runs.length === 1);
  assert.strictEqual(sarif.runs[0].tool.driver.name, 'HZSec');
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
