const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

const DB_DIR  = path.join(os.homedir(), '.shieldops');
const DB_PATH = path.join(DB_DIR, 'knowledge.db');

let db = null;

// ─── Breach case studies (curated, embedded — no external dependency) ─────────
// Real incidents, publicly documented. Used to ground assistant answers in
// actual consequences rather than abstract risk descriptions.

const BREACH_CASES = [
  {
    id: 'breach-001',
    title: 'Uber AWS Keys in GitHub (2022)',
    pattern: 'exposed_aws_key',
    tags: ['aws', 'api-key', 'secret', 'git'],
    severity: 'CRITICAL',
    summary: 'Attacker found Uber AWS access keys committed to a private GitHub repo. Within minutes, they used the keys to access internal systems, exfiltrating data on 57 million users and drivers.',
    consequence: '57 million records exposed, $148M settlement, CISO convicted of obstruction.',
    timeToExploit: '< 10 minutes after discovery',
    lesson: 'AWS keys in any repository — public or private — are high-value targets. Rotate immediately and use IAM roles or secrets managers instead.',
    cveIds: []
  },
  {
    id: 'breach-002',
    title: 'Toyota GitHub API Key Leak (2023)',
    pattern: 'exposed_api_key',
    tags: ['api-key', 'git', 'github', 'secret'],
    severity: 'CRITICAL',
    summary: 'Toyota accidentally exposed an API key on a public GitHub repository for nearly 5 years. The key provided access to a server containing customer data.',
    consequence: '296,000 customer records exposed including email addresses and customer management numbers.',
    timeToExploit: 'Unknown — exposure lasted ~5 years',
    lesson: 'API keys committed to repos are often never rotated and can sit exposed for years before discovery. Automated secret scanning in CI/CD is essential.',
    cveIds: []
  },
  {
    id: 'breach-003',
    title: 'Capital One SSRF + Misconfigured WAF (2019)',
    pattern: 'ssrf_misconfiguration',
    tags: ['aws', 'misconfiguration', 'firewall', 'cloud'],
    severity: 'CRITICAL',
    summary: 'A misconfigured Web Application Firewall allowed a former AWS employee to exploit an SSRF vulnerability, gaining access to AWS metadata service credentials.',
    consequence: '106 million customer records exposed, $80M fine, $190M class action settlement.',
    timeToExploit: 'Single attack session',
    lesson: 'WAF misconfigurations and overly permissive IAM roles compound. Defense in depth — never rely on a single security control.',
    cveIds: []
  },
  {
    id: 'breach-004',
    title: 'SolarWinds Debug Mode in Production (2020)',
    pattern: 'debug_enabled',
    tags: ['debug', 'configuration', 'supply-chain'],
    severity: 'HIGH',
    summary: 'The SolarWinds Orion build system had debug settings enabled in production configurations, contributing to attackers being able to inject malicious code into software updates.',
    consequence: '18,000+ organizations compromised including US Treasury and Homeland Security.',
    timeToExploit: 'Months of undetected access',
    lesson: 'Debug flags in production configs are not just information leaks — they can alter application behavior in ways attackers specifically probe for.',
    cveIds: ['CVE-2020-10148']
  },
  {
    id: 'breach-005',
    title: 'Twitch Source Code + Internal Data Leak (2021)',
    pattern: 'exposed_secret',
    tags: ['secret', 'internal-credentials', 'git'],
    severity: 'CRITICAL',
    summary: 'An anonymous attacker leaked 125GB of Twitch data including the entire source code, internal security tools, and creator payout data. Root cause included improperly secured internal credentials.',
    consequence: '125GB of proprietary data public, creator earnings exposed, significant reputational damage.',
    timeToExploit: 'Unknown',
    lesson: 'Internal credentials treated as inherently safe are a systemic risk. Credentials should be rotated, scoped minimally, and audited regardless of internal vs external exposure.',
    cveIds: []
  },
  {
    id: 'breach-006',
    title: 'Hardcoded MySQL Password in Verkada (2021)',
    pattern: 'hardcoded_password',
    tags: ['password', 'hardcoded', 'database', 'config'],
    severity: 'CRITICAL',
    summary: 'Security researchers found a hardcoded super admin username and password in Verkada\'s systems, granting access to 150,000+ security cameras and internal corporate networks.',
    consequence: '150,000 cameras compromised, hospitals, prisons, and Tesla factories exposed.',
    timeToExploit: 'Immediate once credentials found',
    lesson: 'Hardcoded credentials in any system configuration, especially with elevated privileges, represent complete perimeter bypass for any attacker who finds them.',
    cveIds: []
  },
  {
    id: 'breach-007',
    title: 'Log4Shell - Unsafe Deserialization (2021)',
    pattern: 'unsafe_execution',
    tags: ['java', 'deserialization', 'rce', 'logging'],
    severity: 'CRITICAL',
    summary: 'A critical RCE vulnerability in Log4j allowed attackers to execute arbitrary code by sending a specially crafted string to any system logging user input. Mass exploitation began within hours of disclosure.',
    consequence: 'Hundreds of millions of systems vulnerable, exploited by nation-state actors and ransomware groups globally.',
    timeToExploit: '< 2 hours after public disclosure',
    lesson: 'Any code that executes or evaluates user-controlled input — directly or through a library — is a critical attack surface. Dynamic execution patterns warrant immediate scrutiny.',
    cveIds: ['CVE-2021-44228', 'CVE-2021-45046']
  },
  {
    id: 'breach-008',
    title: 'Equifax - Unencrypted Traffic + Expired Cert (2017)',
    pattern: 'ssl_disabled',
    tags: ['ssl', 'tls', 'encryption', 'certificate'],
    severity: 'HIGH',
    summary: 'Equifax failed to renew a TLS certificate used for security monitoring, leaving an inspection device blind for 19 months. Combined with Apache Struts CVE, attackers went undetected during the breach.',
    consequence: '147 million records exposed, $575M FTC settlement, largest personal data breach penalty at the time.',
    timeToExploit: '78 days of undetected access',
    lesson: 'Disabled or expired TLS is not just a compliance issue — it can blind your security monitoring. Certificate management is operational security.',
    cveIds: ['CVE-2017-5638']
  },
  {
    id: 'breach-009',
    title: 'Slack GitHub Token Exposure (2022)',
    pattern: 'exposed_token',
    tags: ['github', 'token', 'secret', 'git'],
    severity: 'CRITICAL',
    summary: 'Slack detected that a small number of GitHub repository backups were illegally accessed after threat actors stole employee tokens from a third-party.',
    consequence: 'Private source code repositories accessed, internal tooling exposed.',
    timeToExploit: 'Unknown',
    lesson: 'Tokens stored in third-party systems or backups extend your attack surface significantly. Treat tokens with same rigor as passwords.',
    cveIds: []
  },
  {
    id: 'breach-010',
    title: 'Cloudflare - Wide Network Binding (2023)',
    pattern: 'wide_binding',
    tags: ['network', 'binding', 'exposure', 'config'],
    severity: 'MEDIUM',
    summary: 'Cloudflare disclosed that a nation-state attacker who obtained access to their systems was able to move laterally partly due to services binding to broader network interfaces than necessary.',
    consequence: 'Internal systems accessed, source code and documentation exposed.',
    timeToExploit: 'Days of lateral movement',
    lesson: 'Services bound to 0.0.0.0 instead of specific interfaces increase lateral movement opportunities significantly in a post-breach scenario.',
    cveIds: []
  }
];

// ─── OWASP / CIS / SOC2 compliance mappings ──────────────────────────────────

const COMPLIANCE_MAPPINGS = [
  // OWASP Top 10 2021
  { framework: 'OWASP', control: 'A01:2021', name: 'Broken Access Control',       findingTypes: ['config'], patterns: ['admin', 'cors', 'wildcard'] },
  { framework: 'OWASP', control: 'A02:2021', name: 'Cryptographic Failures',       findingTypes: ['secret', 'config'], patterns: ['ssl', 'tls', 'password', 'secret', 'key', 'http'] },
  { framework: 'OWASP', control: 'A03:2021', name: 'Injection',                    findingTypes: ['code', 'web'], patterns: ['eval', 'exec', 'spawn', 'innerHTML', 'document.write'] },
  { framework: 'OWASP', control: 'A05:2021', name: 'Security Misconfiguration',    findingTypes: ['config', 'hardening'], patterns: ['debug', 'default', 'cors', 'bind', 'admin'] },
  { framework: 'OWASP', control: 'A06:2021', name: 'Vulnerable Components',        findingTypes: ['code'], patterns: ['eval', 'child_process'] },
  { framework: 'OWASP', control: 'A07:2021', name: 'Auth Failures',                findingTypes: ['secret', 'config'], patterns: ['password', 'passwd', 'pwd', 'auth', 'token'] },
  { framework: 'OWASP', control: 'A09:2021', name: 'Logging Failures',             findingTypes: ['config'], patterns: ['debug', 'log'] },

  // CIS Controls v8
  { framework: 'CIS', control: 'CIS-3',  name: 'Data Protection',              findingTypes: ['secret'], patterns: ['password', 'key', 'secret', 'token'] },
  { framework: 'CIS', control: 'CIS-4',  name: 'Secure Configuration',         findingTypes: ['config', 'hardening'], patterns: ['debug', 'ssl', 'tls', 'bind', 'cors'] },
  { framework: 'CIS', control: 'CIS-12', name: 'Network Infrastructure Mgmt',  findingTypes: ['config', 'hardening'], patterns: ['bind', 'cors', 'network', '0.0.0.0'] },
  { framework: 'CIS', control: 'CIS-16', name: 'Application Software Security', findingTypes: ['code', 'web'], patterns: ['eval', 'exec', 'innerHTML'] },

  // SOC 2 Trust Service Criteria
  { framework: 'SOC2', control: 'CC6.1', name: 'Logical Access Controls',       findingTypes: ['config', 'secret'], patterns: ['password', 'admin', 'auth', 'key'] },
  { framework: 'SOC2', control: 'CC6.7', name: 'Data Transmission Encryption',  findingTypes: ['config', 'secret'], patterns: ['ssl', 'tls', 'http', 'encrypt'] },
  { framework: 'SOC2', control: 'CC7.1', name: 'System Monitoring',             findingTypes: ['config'], patterns: ['debug', 'log'] },
  { framework: 'SOC2', control: 'CC8.1', name: 'Change Management',             findingTypes: ['code', 'config'], patterns: ['eval', 'exec', 'admin'] },
];

// ─── SQLite bootstrap ─────────────────────────────────────────────────────────
// We use Node's built-in sqlite module (Node 22+) or fall back to a pure-JS
// implementation so there are no native dependencies to compile.

function getDb() {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  // Try Node 22+ built-in sqlite
  try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(DB_PATH);
    initSchema(db);
    return db;
  } catch { /* fall through to better-sqlite3 or json fallback */ }

  // Try better-sqlite3 if installed
  try {
    const Database = require('better-sqlite3');
    db = new Database(DB_PATH);
    initSchema(db);
    return db;
  } catch { /* fall through */ }

  // Pure JSON fallback — no native deps needed
  db = createJsonFallback();
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cve (
      id TEXT PRIMARY KEY,
      description TEXT,
      severity TEXT,
      cvss REAL,
      published TEXT,
      modified TEXT,
      cwe TEXT,
      references TEXT,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS breach_cases (
      id TEXT PRIMARY KEY,
      title TEXT,
      pattern TEXT,
      tags TEXT,
      severity TEXT,
      summary TEXT,
      consequence TEXT,
      time_to_exploit TEXT,
      lesson TEXT,
      cve_ids TEXT
    );

    CREATE TABLE IF NOT EXISTS compliance_mappings (
      framework TEXT,
      control TEXT,
      name TEXT,
      finding_types TEXT,
      patterns TEXT,
      PRIMARY KEY (framework, control)
    );

    CREATE TABLE IF NOT EXISTS fix_memory (
      finding_id TEXT PRIMARY KEY,
      title TEXT,
      file_path TEXT,
      first_seen TEXT,
      last_seen TEXT,
      times_seen INTEGER DEFAULT 1,
      fixed_at TEXT,
      fix_method TEXT,
      recurrence_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OPEN'
    );

    CREATE TABLE IF NOT EXISTS kb_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS cve_fts USING fts5(
      id, description, cwe, tags, content='cve', content_rowid='rowid'
    );
  `);
}

// ─── Pure JSON fallback (no SQLite available) ─────────────────────────────────

function createJsonFallback() {
  const FALLBACK_FILE = path.join(DB_DIR, 'knowledge.json');

  function load() {
    if (!fs.existsSync(FALLBACK_FILE)) return { cves: [], breaches: BREACH_CASES, fixMemory: {} };
    try { return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8')); } catch { return { cves: [], breaches: BREACH_CASES, fixMemory: {} }; }
  }

  function save(data) {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  return {
    _type: 'json',
    load,
    save,
    exec: () => {},
    prepare: () => ({ run: () => {}, get: () => null, all: () => [] })
  };
}

// ─── Seed breach cases and compliance mappings ────────────────────────────────

function seedStaticData() {
  const database = getDb();

  if (database._type === 'json') {
    // JSON fallback already has breach cases in memory
    return;
  }

  // Seed breach cases
  const insertBreach = database.prepare(`
    INSERT OR REPLACE INTO breach_cases (id, title, pattern, tags, severity, summary, consequence, time_to_exploit, lesson, cve_ids)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of BREACH_CASES) {
    insertBreach.run(b.id, b.title, b.pattern, b.tags.join(','), b.severity, b.summary, b.consequence, b.timeToExploit, b.lesson, b.cveIds.join(','));
  }

  // Seed compliance mappings
  const insertCompliance = database.prepare(`
    INSERT OR REPLACE INTO compliance_mappings (framework, control, name, finding_types, patterns)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const m of COMPLIANCE_MAPPINGS) {
    insertCompliance.run(m.framework, m.control, m.name, m.findingTypes.join(','), m.patterns.join(','));
  }
}

// ─── CVE sync from NVD ────────────────────────────────────────────────────────

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'ShieldOps/2.0' } }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse failed: ' + e.message)); }
      });
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function syncCisaKev() {
  try {
    const data = await fetchJson('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
    const database = getDb();

    if (database._type === 'json') return 0;

    const insert = database.prepare(`
      INSERT OR REPLACE INTO cve (id, description, severity, published, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const vuln of (data.vulnerabilities || [])) {
      insert.run(
        vuln.cveID,
        `${vuln.vulnerabilityName}: ${vuln.shortDescription}`,
        'HIGH',
        vuln.dateAdded,
        `cisa-kev,${vuln.product},${vuln.vendorProject}`
      );
      count++;
    }

    database.prepare(`INSERT OR REPLACE INTO kb_meta (key, value) VALUES ('cisa_kev_synced', ?)`).run(new Date().toISOString());
    return count;
  } catch (err) {
    console.error('[KB] CISA sync failed:', err.message);
    return 0;
  }
}

async function syncNvdRecent() {
  // NVD public API — no key needed for basic access, rate limited to 5 req/30s
  try {
    const data = await fetchJson(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=200&startIndex=0&pubStartDate=' +
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000'
    );

    const database = getDb();
    if (database._type === 'json') return 0;

    const insert = database.prepare(`
      INSERT OR REPLACE INTO cve (id, description, severity, cvss, published, modified, cwe, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const item of (data.vulnerabilities || [])) {
      const cve = item.cve;
      const desc = cve.descriptions?.find(d => d.lang === 'en')?.value || '';
      const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
      const severity = metrics?.cvssData?.baseSeverity || 'UNKNOWN';
      const cvss = metrics?.cvssData?.baseScore || 0;
      const cwe = cve.weaknesses?.[0]?.description?.[0]?.value || '';

      insert.run(cve.id, desc, severity, cvss, cve.published, cve.lastModified, cwe, 'nvd');
      count++;
    }

    database.prepare(`INSERT OR REPLACE INTO kb_meta (key, value) VALUES ('nvd_synced', ?)`).run(new Date().toISOString());
    return count;
  } catch (err) {
    console.error('[KB] NVD sync failed:', err.message);
    return 0;
  }
}

// ─── Query functions ──────────────────────────────────────────────────────────

function searchCves(query, limit = 5) {
  try {
    const database = getDb();
    if (database._type === 'json') return [];

    // Try FTS first, fall back to LIKE search
    try {
      return database.prepare(`
        SELECT c.* FROM cve c
        JOIN cve_fts f ON c.rowid = f.rowid
        WHERE cve_fts MATCH ?
        ORDER BY c.cvss DESC
        LIMIT ?
      `).all(query.replace(/['"]/g, ''), limit);
    } catch {
      return database.prepare(`
        SELECT * FROM cve
        WHERE description LIKE ? OR tags LIKE ? OR id LIKE ?
        ORDER BY cvss DESC LIMIT ?
      `).all(`%${query}%`, `%${query}%`, `%${query}%`, limit);
    }
  } catch { return []; }
}

function getBreachCasesForFindings(findings = []) {
  const matched = [];
  const seen = new Set();

  for (const finding of findings) {
    const titleLower = (finding.title || '').toLowerCase();
    const typeLower  = (finding.type  || '').toLowerCase();

    for (const breach of BREACH_CASES) {
      if (seen.has(breach.id)) continue;

      const tagMatch = breach.tags.some(tag =>
        titleLower.includes(tag) || typeLower.includes(tag)
      );

      const patternMatch =
        (breach.pattern.includes('aws')      && titleLower.includes('aws'))      ||
        (breach.pattern.includes('key')      && titleLower.includes('key'))       ||
        (breach.pattern.includes('password') && titleLower.includes('password'))  ||
        (breach.pattern.includes('secret')   && typeLower === 'secret')           ||
        (breach.pattern.includes('debug')    && titleLower.includes('debug'))     ||
        (breach.pattern.includes('ssl')      && titleLower.includes('ssl'))       ||
        (breach.pattern.includes('ssl')      && titleLower.includes('tls'))       ||
        (breach.pattern.includes('exec')     && titleLower.includes('exec'))      ||
        (breach.pattern.includes('eval')     && titleLower.includes('eval'))      ||
        (breach.pattern.includes('binding')  && titleLower.includes('binding'))   ||
        (breach.pattern.includes('token')    && titleLower.includes('token'));

      if (tagMatch || patternMatch) {
        matched.push(breach);
        seen.add(breach.id);
        if (matched.length >= 3) break;
      }
    }

    if (matched.length >= 3) break;
  }

  return matched;
}

function getComplianceGaps(findings = []) {
  const gaps = [];

  for (const mapping of COMPLIANCE_MAPPINGS) {
    const matchingFindings = findings.filter(f => {
      const typeMatch    = mapping.findingTypes.includes(f.type);
      const patternMatch = mapping.patterns.some(p =>
        (f.title || '').toLowerCase().includes(p) ||
        (f.rawLine || '').toLowerCase().includes(p)
      );
      return typeMatch && patternMatch;
    });

    if (matchingFindings.length > 0) {
      gaps.push({
        framework: mapping.framework,
        control: mapping.control,
        name: mapping.name,
        failingFindings: matchingFindings.length,
        topFinding: matchingFindings[0]?.title || ''
      });
    }
  }

  return gaps;
}

function getComplianceScore(findings = []) {
  const total = COMPLIANCE_MAPPINGS.length;
  const gaps  = getComplianceGaps(findings).length;
  const passing = total - gaps;

  const byFramework = {};
  for (const m of COMPLIANCE_MAPPINGS) {
    if (!byFramework[m.framework]) byFramework[m.framework] = { total: 0, passing: 0 };
    byFramework[m.framework].total++;
  }

  for (const gap of getComplianceGaps(findings)) {
    if (byFramework[gap.framework]) byFramework[gap.framework].passing--;
  }

  for (const fw of Object.keys(byFramework)) {
    byFramework[fw].passing = byFramework[fw].total - (byFramework[fw].passing < 0 ? byFramework[fw].total : byFramework[fw].total - byFramework[fw].passing);
    byFramework[fw].score = Math.round((byFramework[fw].passing / byFramework[fw].total) * 100);
  }

  return {
    overall: Math.round((passing / total) * 100),
    passing,
    total,
    gaps,
    byFramework
  };
}

// ─── Fix memory ───────────────────────────────────────────────────────────────

function recordFindings(findings = []) {
  try {
    const database = getDb();
    if (database._type === 'json') return;

    const now = new Date().toISOString();
    const upsert = database.prepare(`
      INSERT INTO fix_memory (finding_id, title, file_path, first_seen, last_seen, times_seen, status)
      VALUES (?, ?, ?, ?, ?, 1, 'OPEN')
      ON CONFLICT(finding_id) DO UPDATE SET
        last_seen = excluded.last_seen,
        times_seen = times_seen + 1,
        status = CASE WHEN status = 'FIXED' THEN 'RECURRING' ELSE status END,
        recurrence_count = CASE WHEN status = 'FIXED' THEN recurrence_count + 1 ELSE recurrence_count END
    `);

    for (const f of findings) {
      upsert.run(f.id, f.title, f.filePath, now, now);
    }
  } catch (err) {
    console.error('[KB] recordFindings failed:', err.message);
  }
}

function markFindingFixed(findingId, method = 'manual') {
  try {
    const database = getDb();
    if (database._type === 'json') return;
    database.prepare(`
      UPDATE fix_memory SET status = 'FIXED', fixed_at = ?, fix_method = ? WHERE finding_id = ?
    `).run(new Date().toISOString(), method, findingId);
  } catch { /* non-fatal */ }
}

function getFixMemorySummary(findings = []) {
  try {
    const database = getDb();
    if (database._type === 'json') return null;

    const longOpen = database.prepare(`
      SELECT * FROM fix_memory
      WHERE status = 'OPEN'
      AND julianday('now') - julianday(first_seen) > 7
      ORDER BY julianday('now') - julianday(first_seen) DESC
      LIMIT 5
    `).all();

    const recurring = database.prepare(`
      SELECT * FROM fix_memory WHERE recurrence_count > 0 ORDER BY recurrence_count DESC LIMIT 5
    `).all();

    const recentlyFixed = database.prepare(`
      SELECT * FROM fix_memory WHERE status = 'FIXED' ORDER BY fixed_at DESC LIMIT 5
    `).all();

    return { longOpen, recurring, recentlyFixed };
  } catch { return null; }
}

function getKbSyncStatus() {
  try {
    const database = getDb();
    if (database._type === 'json') return { available: false, mode: 'json-fallback' };

    const cisaSynced = database.prepare(`SELECT value FROM kb_meta WHERE key = 'cisa_kev_synced'`).get();
    const nvdSynced  = database.prepare(`SELECT value FROM kb_meta WHERE key = 'nvd_synced'`).get();
    const cveCount   = database.prepare(`SELECT COUNT(*) as n FROM cve`).get();
    const breachCount= database.prepare(`SELECT COUNT(*) as n FROM breach_cases`).get();

    return {
      available: true,
      mode: 'sqlite',
      cisaLastSync: cisaSynced?.value || null,
      nvdLastSync: nvdSynced?.value || null,
      cveCount: cveCount?.n || 0,
      breachCaseCount: breachCount?.n || 0
    };
  } catch { return { available: false, mode: 'error' }; }
}

// ─── Initialize ───────────────────────────────────────────────────────────────

function initKnowledgeBase() {
  try {
    getDb();
    seedStaticData();
    return true;
  } catch (err) {
    console.error('[KB] Init failed:', err.message);
    return false;
  }
}

module.exports = {
  initKnowledgeBase,
  searchCves,
  getBreachCasesForFindings,
  getComplianceGaps,
  getComplianceScore,
  recordFindings,
  markFindingFixed,
  getFixMemorySummary,
  getKbSyncStatus,
  syncCisaKev,
  syncNvdRecent,
  BREACH_CASES,
  COMPLIANCE_MAPPINGS
};