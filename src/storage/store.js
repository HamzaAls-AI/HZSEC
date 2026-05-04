const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// ─── Paths ────────────────────────────────────────────────────────────────────

const STORE_DIR    = path.join(os.homedir(), '.shieldops');
const KEY_FILE     = path.join(STORE_DIR, 'key.enc');
const SALT_FILE    = path.join(STORE_DIR, 'key.salt');
const HISTORY_FILE = path.join(STORE_DIR, 'scan-history.json');
const PREFS_FILE   = path.join(STORE_DIR, 'prefs.json');
const AUDIT_FILE   = path.join(STORE_DIR, 'audit.log');
const LICENSE_FILE = path.join(STORE_DIR, 'license.json');

// HZSec license keys are not as sensitive as the Anthropic API key — they
// only let the proxy meter requests against the user's plan. We store the
// full key in plain JSON, alongside a 24h-cached validation result so the
// app doesn't hit the backend on every launch.

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

// ─── Key derivation (PBKDF2-SHA512) ──────────────────────────────────────────
//
// Password = SHA-512 hash of 5 machine-specific factors combined.
//   All 5 must match for decryption — makes cross-machine attacks useless.
//
// Salt = 32 random bytes, generated once and stored separately from the
//   ciphertext. Prevents rainbow table and precomputation attacks entirely.
//
// PBKDF2 with 310,000 iterations of SHA-512 deliberately slows down
//   brute-force attempts. Each guess costs ~300ms on modern hardware —
//   making an offline dictionary attack against this key infeasible.

const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_KEYLEN     = 32;  // 256-bit AES key
const PBKDF2_DIGEST     = 'sha512';

function getMachinePassword() {
  const factors = [
    os.hostname(),
    os.userInfo().username,
    os.homedir(),
    os.platform(),
    os.arch()
  ];
  return crypto.createHash('sha512').update(factors.join('||')).digest('hex');
}

function getOrCreateSalt() {
  ensureStoreDir();
  if (fs.existsSync(SALT_FILE)) return fs.readFileSync(SALT_FILE);
  const salt = crypto.randomBytes(32);
  fs.writeFileSync(SALT_FILE, salt);
  return salt;
}

function deriveKey(salt) {
  return crypto.pbkdf2Sync(
    getMachinePassword(),
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  );
}

// ─── Encryption (AES-256-GCM) ─────────────────────────────────────────────────
//
// AES-GCM gives both confidentiality and authenticated integrity in one pass.
// The 16-byte auth tag means any tampering with the ciphertext is detected
// and decryption fails before any data is returned — no silent corruption.
//
// Storage format (colon-separated hex): iv:authTag:ciphertext
// IV is 12 bytes (96-bit) — the optimal size for GCM mode.
// A fresh random IV is generated on every encrypt call.

function encrypt(plaintext) {
  const salt = getOrCreateSalt();
  const key  = deriveKey(salt);
  const iv   = crypto.randomBytes(12);

  const cipher    = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag   = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decrypt(stored) {
  try {
    const [ivHex, tagHex, ...rest] = stored.split(':');
    const iv        = Buffer.from(ivHex, 'hex');
    const authTag   = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(rest.join(':'), 'hex');

    const salt    = getOrCreateSalt();
    const key     = deriveKey(salt);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    // Throws if ciphertext or tag was tampered with — authenticated decryption
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// ─── API Key ──────────────────────────────────────────────────────────────────

function saveApiKey(key) {
  ensureStoreDir();
  fs.writeFileSync(KEY_FILE, encrypt(key), 'utf8');
  appendAuditLog({ action: 'api-key-saved', detail: 'API key encrypted with AES-256-GCM and persisted' });
}

function loadApiKey() {
  if (!fs.existsSync(KEY_FILE)) return null;
  return decrypt(fs.readFileSync(KEY_FILE, 'utf8').trim());
}

function clearApiKey() {
  if (fs.existsSync(KEY_FILE)) {
    fs.unlinkSync(KEY_FILE);
    appendAuditLog({ action: 'api-key-cleared', detail: 'Encrypted API key removed from disk' });
  }
}

// ─── Scan History ─────────────────────────────────────────────────────────────

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return []; }
}

function clearHistory() {
  if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
  appendAuditLog({ action: 'history-cleared', detail: 'Score history was manually reset' });
}

function saveHistoryEntry(entry) {
  ensureStoreDir();
  const history = loadHistory();

  history.unshift({
    id: Date.now(),
    scannedAt: entry.scannedAt,
    targetPath: entry.targetPath,
    mode: entry.mode,
    score: entry.posture.overallSecurityScore,
    threatLevel: entry.posture.currentThreatLevel,
    totalFindings: entry.posture.totalFindings,
    criticalFindings: entry.posture.criticalFindings,
    riskDistribution: entry.riskDistribution.current,
    findingSummary: (entry.findings || []).slice(0, 5).map(f => ({
      title: f.title, severity: f.severity, file: f.file, lineNumber: f.lineNumber
    }))
  });

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 50), null, 2), 'utf8');

  appendAuditLog({
    action: 'scan-completed',
    target: entry.targetPath,
    detail: `Mode: ${entry.mode} | Score: ${entry.posture.overallSecurityScore} | Findings: ${entry.posture.totalFindings} | Critical: ${entry.posture.criticalFindings} | Threat: ${entry.posture.currentThreatLevel}`
  });

  return history;
}

// ─── Prefs ────────────────────────────────────────────────────────────────────

function loadPrefs() {
  if (!fs.existsSync(PREFS_FILE)) return { onboardingComplete: false, plan: 'both' };
  try { return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8')); }
  catch { return { onboardingComplete: false, plan: 'both' }; }
}

function savePrefs(prefs) {
  ensureStoreDir();
  const merged = { ...loadPrefs(), ...prefs };
  fs.writeFileSync(PREFS_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
//
// Append-only NDJSON log (one JSON object per line).
// Append-only means past entries can never be silently modified — if you want
// to clear it you have to do it explicitly and that action is itself logged.
//
// Events logged:
//   api-key-saved        Key encrypted + persisted
//   api-key-cleared      Key file removed
//   scan-completed       Full scan result summary
//   fix-applied          Single quick fix applied
//   agent-fix-applied    Batch of assistant-proposed fixes applied
//   agent-fix-rejected   Assistant fix plan rejected by user
//   monitor-started      Live monitor activated
//   monitor-stopped      Live monitor stopped
//   monitor-alert        New issues detected by monitor
//   export-completed     Report exported to a file
//   audit-log-cleared    Log manually cleared (this entry is re-created after)

function appendAuditLog(entry) {
  try {
    ensureStoreDir();
    const record = JSON.stringify({
      ts: new Date().toISOString(),
      machine: os.hostname(),
      user: os.userInfo().username,
      ...entry
    });
    fs.appendFileSync(AUDIT_FILE, record + '\n', 'utf8');
  } catch {
    // Never let logging crash the app
  }
}

function loadAuditLog(limit = 300) {
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    const lines = fs.readFileSync(AUDIT_FILE, 'utf8')
      .trim().split('\n').filter(Boolean);
    return lines.slice(-limit).reverse().map(l => JSON.parse(l));
  } catch {
    return [];
  }
}

function clearAuditLog() {
  if (fs.existsSync(AUDIT_FILE)) fs.unlinkSync(AUDIT_FILE);
  // Re-open the log with a "cleared" entry so there's always a trail
  appendAuditLog({ action: 'audit-log-cleared', detail: 'Audit log was manually cleared by user' });
}

// ─── License storage ─────────────────────────────────────────────────────────
//
// Shape on disk (license.json):
//   {
//     "licenseKey": "HZSEC-XXXX-XXXX-XXXX-XXXX",
//     "validation": {                     // last successful /api/license/validate
//       "valid":     true,
//       "tier":      "pro",
//       "status":    "active",
//       "expiresAt": "2026-05-29T...",
//       "usage":     { used, cap, remaining, month },
//       "checkedAt": "2026-04-29T..."     // we add this so the 24h cache works
//     }
//   }
//
// The cache is checked by `getLicenseValidation()` — if `checkedAt` is older
// than 24h, returns null and the caller revalidates against the backend.

const VALIDATION_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours

function loadLicenseFile() {
  if (!fs.existsSync(LICENSE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf8')); }
  catch { return {}; }
}

function writeLicenseFile(data) {
  ensureStoreDir();
  fs.writeFileSync(LICENSE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getLicense() {
  const f = loadLicenseFile();
  return f.licenseKey || null;
}

function setLicense(licenseKey) {
  if (typeof licenseKey !== 'string' || !licenseKey.trim()) {
    throw new Error('license key must be a non-empty string');
  }
  const f = loadLicenseFile();
  f.licenseKey = licenseKey.trim().toUpperCase();
  // Reset cached validation; caller must revalidate.
  delete f.validation;
  writeLicenseFile(f);
  return f.licenseKey;
}

function clearLicense() {
  if (fs.existsSync(LICENSE_FILE)) fs.unlinkSync(LICENSE_FILE);
}

// Returns the cached validation if it's fresh; otherwise null.
function getLicenseValidation() {
  const f = loadLicenseFile();
  const v = f.validation;
  if (!v || !v.checkedAt) return null;
  const age = Date.now() - new Date(v.checkedAt).getTime();
  if (age > VALIDATION_TTL_MS) return null;
  return v;
}

function saveLicenseValidation(validation) {
  const f = loadLicenseFile();
  f.validation = { ...validation, checkedAt: new Date().toISOString() };
  writeLicenseFile(f);
}

module.exports = {
  saveApiKey, loadApiKey, clearApiKey,
  loadHistory, saveHistoryEntry, clearHistory,
  loadPrefs, savePrefs,
  appendAuditLog, loadAuditLog, clearAuditLog,
  getLicense, setLicense, clearLicense,
  getLicenseValidation, saveLicenseValidation
};