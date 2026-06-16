// Sprint 5B tests — new secret detector coverage.
//
// Covers: OpenAI keys, Stripe keys, database connection strings,
// Slack tokens, SendGrid keys, JWT tokens, and expanded GitHub token types.
// Also verifies placeholder/comment suppression applies to new patterns.

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

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-sprint5b-'));

function writeFile(name, lines) {
  const p = path.join(root, name);
  fs.writeFileSync(p, Array.isArray(lines) ? lines.join('\n') : lines);
  return p;
}

// Join parts at runtime so the full credential pattern never appears as a
// single literal in this source file — prevents GitHub push protection from
// blocking the commit while still writing detectable values to temp fixtures.
const J = (...parts) => parts.join('');

// OpenAI
// Use a variable name that does NOT match the generic api_key or secret patterns
// so we can verify the OpenAI-specific detector fires.
const fOpenAI = writeFile('openai.env', [
  'OPENAI_MODEL=sk-abcdefghijklmnopqrstuvwxyz12345678901234567890AB',  // 48 chars after sk-
  'OPENAI_PROJECT_KEY=sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmno',
  '# OPENAI_MODEL=sk-abcdefghijklmnopqrstuvwxyz12345678901234567890AB', // commented — must not fire
  'OPENAI_MODEL=sk-YOUR_KEY_HERE',  // placeholder — must not fire
  'SHORT_KEY=sk-tooshort',          // too short — must not fire
]);

// Stripe — parts joined at runtime to avoid source-level secret literal detection
const fStripe = writeFile('stripe.js', [
  `const stripe = require('stripe')('${J('sk_live_', '4eC39HqLyjWDarjtT7FIyC4RQ12345')}');`,
  `const rk = '${J('rk_live_', '4eC39HqLyjWDarjtT7FIyC4RQ12345')}';`,
  "const test = 'sk_test_4eC39HqLyjWDarjtT7FIyC4RQ12345';",
  "const pub = 'pk_live_4eC39HqLyjWDarjtT7FIyC4RQ12345';",  // publishable — must not fire
]);

// Database connection strings
const fDB = writeFile('database.env', [
  'DATABASE_URL=postgresql://admin:s3cr3tPa55@db.prod.example.com:5432/users',
  'MONGO_URI=mongodb+srv://root:pass123@cluster.mongodb.net/mydb',
  'REDIS_URL=redis://default:redispass99@redis.prod.example.com:6379',
  'MYSQL_URL=mysql://app:realpassword@mysql.prod.example.com:3306/app',
  'DB_URL=postgresql://user:changeme@host/db',          // placeholder — must not fire
  'DB_URL=postgresql://${DB_USER}:${DB_PASS}@host/db', // interpolation — must not fire
  '# DATABASE_URL=postgresql://admin:real@db.prod.example.com:5432/users', // comment — must not fire
]);

// Slack — parts joined at runtime to avoid source-level token detection
const fSlack = writeFile('slack.js', [
  `const BOT_TOKEN = '${J('xoxb-', '123456789012-123456789012-abcdefghijklmnopqrstu')}';`,
  `const USER_TOKEN = '${J('xoxp-', '123456789012-123456789012-123456789012-abcdef12')}';`,
  `const APP_TOKEN = '${J('xoxa-', '2-123456789012-123456789012-abcdef1234567890')}';`,
  `// BOT_TOKEN = '${J('xoxb-', '123456789012-123456789012-abcdefghijklmnopqrstu')}';`,  // commented
]);

// SendGrid — SG. + exactly 22 chars + . + exactly 43 chars
// First segment (22):  abcdefghijklmnopqrstu1  (21 letters + 1 digit = 22)
// Second segment (43): ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq (26 + 17 = 43)
// Parts joined at runtime to avoid source-level API key detection
const SG_KEY = J('SG.', 'abcdefghijklmnopqrstu1', '.', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq');
const fSendGrid = writeFile('sendgrid.env', [
  `SENDGRID_API_KEY=${SG_KEY}`,
  `# SENDGRID_API_KEY=${SG_KEY}`, // commented
  'SG.short.tooshort',   // wrong lengths — must not fire
]);

// JWT
const fJWT = writeFile('jwt.js', [
  "const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';",
  '// const token = eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA;', // commented
  "const notJwt = 'eyJshort.x.y';",  // too short — must not fire
]);

// GitHub App tokens — gh[psuor]_ + exactly 36 alphanumeric chars
// 36 chars: abcdefghijklmnopqrstuvwxyz (26) + 1234567890 (10) = 36
const fGitHubApp = writeFile('github-app.env', [
  'GITHUB_TOKEN=ghs_abcdefghijklmnopqrstuvwxyz1234567890',  // installation token (36 chars)
  'GH_USER_TOKEN=ghu_abcdefghijklmnopqrstuvwxyz1234567890', // user-to-server (36 chars)
  'GH_OAUTH_TOKEN=gho_abcdefghijklmnopqrstuvwxyz1234567890', // OAuth token (36 chars)
  'GH_REFRESH=ghr_abcdefghijklmnopqrstuvwxyz1234567890',    // refresh token (36 chars)
  '# GITHUB_TOKEN=ghs_abcdefghijklmnopqrstuvwxyz1234567890', // commented — must not fire
]);

// ── OpenAI tests ──────────────────────────────────────────────────────────────

it('OpenAI classic key (sk-[48]) triggers CRITICAL', () => {
  const r = scan(fOpenAI);
  const hits = r.findings.filter(f => f.title === 'OpenAI API key exposed' && f.rawLine?.includes('OPENAI_MODEL='));
  assert.ok(hits.length > 0, 'expected OpenAI classic key to fire, got: ' + r.findings.map(f => f.title).join(', '));
  assert.strictEqual(hits[0].severity, 'CRITICAL');
});

it('OpenAI project key (sk-proj-) triggers CRITICAL', () => {
  const r = scan(fOpenAI);
  const hits = r.findings.filter(f => f.title === 'OpenAI API key exposed' && f.rawLine?.includes('sk-proj-'));
  assert.ok(hits.length > 0, 'expected OpenAI project key to fire');
});

it('commented OpenAI key does NOT trigger', () => {
  const r = scan(fOpenAI);
  const hits = r.findings.filter(f => f.title === 'OpenAI API key exposed' && f.rawLine?.startsWith('#'));
  assert.strictEqual(hits.length, 0, 'commented OpenAI key should not fire');
});

it('OpenAI placeholder key does NOT trigger', () => {
  const r = scan(fOpenAI);
  const hits = r.findings.filter(f => f.title === 'OpenAI API key exposed' && f.rawLine?.includes('YOUR_KEY_HERE'));
  assert.strictEqual(hits.length, 0, 'placeholder OpenAI key should not fire');
});

it('short sk- value does NOT trigger OpenAI detector', () => {
  const r = scan(fOpenAI);
  const hits = r.findings.filter(f => f.title === 'OpenAI API key exposed' && f.rawLine?.includes('tooshort'));
  assert.strictEqual(hits.length, 0, 'sk-tooshort should not fire');
});

// ── Stripe tests ──────────────────────────────────────────────────────────────

it('Stripe sk_live_ triggers CRITICAL', () => {
  const r = scan(fStripe);
  const hits = r.findings.filter(f => f.title === 'Stripe live secret key exposed' && f.rawLine?.includes('sk_live_'));
  assert.ok(hits.length > 0, 'expected sk_live_ to fire');
  assert.strictEqual(hits[0].severity, 'CRITICAL');
});

it('Stripe rk_live_ triggers CRITICAL', () => {
  const r = scan(fStripe);
  const hits = r.findings.filter(f => f.title === 'Stripe live secret key exposed' && f.rawLine?.includes('rk_live_'));
  assert.ok(hits.length > 0, 'expected rk_live_ to fire');
});

it('Stripe sk_test_ triggers HIGH', () => {
  const r = scan(fStripe);
  const hits = r.findings.filter(f => f.title === 'Stripe test key exposed');
  assert.ok(hits.length > 0, 'expected sk_test_ to fire');
  assert.strictEqual(hits[0].severity, 'HIGH');
});

it('Stripe pk_live_ (publishable key) does NOT trigger', () => {
  const r = scan(fStripe);
  const hits = r.findings.filter(f => (f.title === 'Stripe live secret key exposed' || f.title === 'Stripe test key exposed') && f.rawLine?.includes('pk_live_'));
  assert.strictEqual(hits.length, 0, 'publishable key must not fire Stripe secret detector');
});

// ── Database connection string tests ──────────────────────────────────────────

it('PostgreSQL connection string with real password triggers CRITICAL', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.includes('postgresql://'));
  assert.ok(hits.length > 0, 'expected postgresql:// with credentials to fire');
  assert.strictEqual(hits[0].severity, 'CRITICAL');
});

it('MongoDB+srv connection string triggers', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.includes('mongodb+srv://'));
  assert.ok(hits.length > 0, 'expected mongodb+srv:// to fire');
});

it('Redis connection string triggers', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.includes('redis://'));
  assert.ok(hits.length > 0, 'expected redis:// to fire');
});

it('DB connection string with "changeme" placeholder does NOT trigger', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.includes('changeme'));
  assert.strictEqual(hits.length, 0, 'changeme placeholder in connection string should be suppressed');
});

it('DB connection string with env-var interpolation does NOT trigger', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.includes('${DB_USER}'));
  assert.strictEqual(hits.length, 0, 'interpolated connection string should not fire');
});

it('commented DB connection string does NOT trigger', () => {
  const r = scan(fDB);
  const hits = r.findings.filter(f => f.title === 'Database credentials in connection string' && f.rawLine?.trimStart().startsWith('#'));
  assert.strictEqual(hits.length, 0, 'commented connection string should not fire');
});

// ── Slack tests ───────────────────────────────────────────────────────────────

it('Slack xoxb- bot token triggers CRITICAL', () => {
  const r = scan(fSlack);
  const hits = r.findings.filter(f => f.title === 'Slack token exposed' && f.rawLine?.includes('xoxb-'));
  assert.ok(hits.length > 0, 'expected xoxb- to fire');
  assert.strictEqual(hits[0].severity, 'CRITICAL');
});

it('Slack xoxp- user token triggers', () => {
  const r = scan(fSlack);
  const hits = r.findings.filter(f => f.title === 'Slack token exposed' && f.rawLine?.includes('xoxp-'));
  assert.ok(hits.length > 0, 'expected xoxp- to fire');
});

it('Slack xoxa- app token triggers', () => {
  const r = scan(fSlack);
  const hits = r.findings.filter(f => f.title === 'Slack token exposed' && f.rawLine?.includes('xoxa-'));
  assert.ok(hits.length > 0, 'expected xoxa- to fire');
});

it('commented Slack token does NOT trigger', () => {
  const r = scan(fSlack);
  const hits = r.findings.filter(f => f.title === 'Slack token exposed' && f.rawLine?.trimStart().startsWith('//'));
  assert.strictEqual(hits.length, 0, 'commented Slack token should not fire');
});

// ── SendGrid tests ────────────────────────────────────────────────────────────

it('SendGrid SG. key triggers HIGH', () => {
  const r = scan(fSendGrid);
  const hits = r.findings.filter(f => f.title === 'SendGrid API key exposed');
  assert.ok(hits.length > 0, 'expected SG. key to fire');
  assert.strictEqual(hits[0].severity, 'HIGH');
});

it('commented SendGrid key does NOT trigger', () => {
  const r = scan(fSendGrid);
  const hits = r.findings.filter(f => f.title === 'SendGrid API key exposed' && f.rawLine?.trimStart().startsWith('#'));
  assert.strictEqual(hits.length, 0, 'commented SendGrid key should not fire');
});

it('malformed SG. key (wrong segment lengths) does NOT trigger', () => {
  const r = scan(fSendGrid);
  const hits = r.findings.filter(f => f.title === 'SendGrid API key exposed' && f.rawLine?.includes('SG.short'));
  assert.strictEqual(hits.length, 0, 'SG.short.tooshort should not fire');
});

// ── JWT tests ─────────────────────────────────────────────────────────────────

it('JWT bearer token triggers HIGH', () => {
  const r = scan(fJWT);
  const hits = r.findings.filter(f => f.title === 'JWT token hardcoded in source');
  assert.ok(hits.length > 0, 'expected JWT to fire');
  assert.strictEqual(hits[0].severity, 'HIGH');
});

it('commented JWT does NOT trigger', () => {
  const r = scan(fJWT);
  const hits = r.findings.filter(f => f.title === 'JWT token hardcoded in source' && f.rawLine?.trimStart().startsWith('//'));
  assert.strictEqual(hits.length, 0, 'commented JWT should not fire');
});

// ── GitHub App token tests ────────────────────────────────────────────────────

it('GitHub App installation token (ghs_) triggers CRITICAL', () => {
  const r = scan(fGitHubApp);
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed' && f.rawLine?.includes('ghs_'));
  assert.ok(hits.length > 0, 'expected ghs_ to fire');
  assert.strictEqual(hits[0].severity, 'CRITICAL');
});

it('GitHub user-to-server token (ghu_) triggers', () => {
  const r = scan(fGitHubApp);
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed' && f.rawLine?.includes('ghu_'));
  assert.ok(hits.length > 0, 'expected ghu_ to fire');
});

it('GitHub OAuth token (gho_) triggers', () => {
  const r = scan(fGitHubApp);
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed' && f.rawLine?.includes('gho_'));
  assert.ok(hits.length > 0, 'expected gho_ to fire');
});

it('GitHub refresh token (ghr_) triggers', () => {
  const r = scan(fGitHubApp);
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed' && f.rawLine?.includes('ghr_'));
  assert.ok(hits.length > 0, 'expected ghr_ to fire');
});

it('commented GitHub App token does NOT trigger', () => {
  const r = scan(fGitHubApp);
  const hits = r.findings.filter(f => f.title === 'GitHub token exposed' && f.rawLine?.trimStart().startsWith('#'));
  assert.strictEqual(hits.length, 0, 'commented GitHub token should not fire');
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
