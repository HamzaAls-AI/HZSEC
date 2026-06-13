const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const STORE_DIR = path.join(os.homedir(), '.shieldops');
const FILE = path.join(STORE_DIR, 'suppressions.json');

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(parsed.suppressions) ? parsed : { version: 1, suppressions: [] };
  } catch {
    return { version: 1, suppressions: [] };
  }
}

function save(data) {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getAll() {
  return load().suppressions;
}

function add(suppression) {
  const data = load();
  const entry = {
    ...suppression,
    id: `sup_${crypto.randomBytes(6).toString('hex')}`,
    createdAt: new Date().toISOString()
  };
  data.suppressions.push(entry);
  save(data);
  return entry;
}

function remove(suppressionId) {
  const data = load();
  const before = data.suppressions.length;
  data.suppressions = data.suppressions.filter(s => s.id !== suppressionId);
  if (data.suppressions.length !== before) save(data);
}

function matchesGlob(filePath, pattern) {
  // Supports * (single path segment) and ** (any depth)
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped
    .replace(/\*\*/g, '\x00')    // placeholder for **
    .replace(/\*/g, '[^/]*')     // * matches within a single segment
    .replace(/\x00/g, '.*');     // ** matches across segments
  return new RegExp(`(^|/)${regexStr}($|/)`).test(filePath);
}

function matchesFinding(finding, suppression) {
  switch (suppression.kind) {
    case 'finding':      return finding.id === suppression.findingId;
    case 'rule':         return finding.title === suppression.ruleTitle;
    case 'file':         return finding.filePath === suppression.filePath;
    case 'path-pattern': return matchesGlob(finding.filePath, suppression.pattern);
    default:             return false;
  }
}

function applySuppressions(findings, suppressions) {
  const active = [];
  const acknowledged = [];
  const suppressed = [];

  for (const finding of findings) {
    let matched = null;
    for (const s of suppressions) {
      if (matchesFinding(finding, s)) { matched = s; break; }
    }

    if (!matched) {
      active.push(finding);
    } else if (matched.reason === 'acknowledged') {
      acknowledged.push({ ...finding, suppressionId: matched.id, suppressionNote: matched.note || '' });
    } else {
      suppressed.push({ ...finding, suppressionId: matched.id, suppressionReason: matched.reason });
    }
  }

  return { active, acknowledged, suppressed };
}

module.exports = { getAll, add, remove, applySuppressions };
