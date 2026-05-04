const fs = require('fs');
const path = require('path');
const os = require('os');

const BACKUP_DIR = path.join(os.homedir(), '.shieldops', 'backups');
const MAX_BACKUPS_PER_FILE = 10;

// ─── Versioned backup system ──────────────────────────────────────────────────
// Backups live in ~/.shieldops/backups/ with timestamps.
// Never pollutes the user's project folder with .bak files.
// Keeps the last MAX_BACKUPS_PER_FILE versions per file — auto-prunes older ones.

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup(filePath) {
  ensureBackupDir();
  const resolved = path.resolve(filePath);

  // Flatten the file path into a safe backup filename
  const safeName = resolved
    .replace(/^[/\\]+/, '')
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${safeName}__${timestamp}`);

  fs.copyFileSync(resolved, backupPath);
  pruneOldBackups(safeName);

  return backupPath;
}

function pruneOldBackups(safeName) {
  try {
    const all = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(safeName + '__'))
      .sort().reverse(); // ISO timestamps sort correctly, newest first
    all.slice(MAX_BACKUPS_PER_FILE).forEach(f => {
      try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch { /* ignore */ }
    });
  } catch { /* ignore */ }
}

function listBackups(filePath) {
  try {
    ensureBackupDir();
    const safeName = path.resolve(filePath)
      .replace(/^[/\\]+/, '')
      .replace(/[/\\]/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '-');

    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(safeName + '__'))
      .sort().reverse()
      .map(f => ({
        name: f,
        fullPath: path.join(BACKUP_DIR, f),
        timestamp: f.replace(safeName + '__', '').slice(0, 19).replace(/-/g, ':')
      }));
  } catch { return []; }
}

// ─── Fix builders ─────────────────────────────────────────────────────────────

function replaceCredentialLine(line) {
  if (/BEGIN [A-Z ]*PRIVATE KEY/.test(line)) return '# PRIVATE KEY REMOVED - STORE SECURELY OUTSIDE PROJECT FILES';
  if (/^\s*[A-Z0-9_.-]+\s*=/.test(line))    return line.replace(/=(.*)$/u, '=REDACTED_CHANGE_ME');
  if (/^\s*["']?[A-Za-z0-9_.-]+["']?\s*:\s*/.test(line)) return line.replace(/(:\s*)(.+)$/u, '$1"REDACTED_CHANGE_ME"');
  return '# SECRET REMOVED - ADD SECURE VALUE AT RUNTIME';
}

function buildSafeReplacement(originalLine, issue) {
  if (issue.fixType === 'redact-secret')           return replaceCredentialLine(originalLine);
  if (issue.fixType === 'toggle-false')             return originalLine.replace(/true/gi, 'false');
  if (issue.fixType === 'toggle-true')              return originalLine.replace(/false/gi, 'true');
  if (issue.fixType === 'cors-allowlist')           return originalLine.replace(/\*/g, 'https://your-allowed-origin.com');
  if (issue.fixType === 'http-to-https')            return originalLine.replace(/http:\/\//gi, 'https://');
  if (issue.fixType === 'bind-local')               return originalLine.replace(/0\.0\.0\.0/g, '127.0.0.1');
  if (issue.fixType === 'toggle-root-login')        return originalLine.replace(/PermitRootLogin\s+yes/i, 'PermitRootLogin no');
  if (issue.fixType === 'toggle-password-auth')     return originalLine.replace(/PasswordAuthentication\s+yes/i, 'PasswordAuthentication no');
  if (issue.fixType === 'toggle-safe-verification') return originalLine
    .replace(/insecure\s*[:=]\s*true/gi, 'insecure=false')
    .replace(/verify\s*ssl\s*[:=]\s*false/gi, 'verify_ssl=true');
  return null;
}

module.exports = { createBackup, buildSafeReplacement, listBackups };