const path = require('path');
const { safeReadFile } = require('../core/file-utils');
const { buildFinding } = require('../core/findings');
const { detectSecretIssue } = require('../detectors/secret');
const { detectConfigIssue } = require('../detectors/config');
const { detectWebIssue } = require('../detectors/web');
const { detectHardeningIssue } = require('../detectors/hardening');
const { detectCodeIssue } = require('../detectors/code');

const CREDENTIAL_FIELD_RE  = /"?_?authToken"?\s*[:=]|"?authToken"?\s*[:=]|\btoken\b|\bpassword\b|\busername\b/i;
const EMBEDDED_CRED_URL_RE = /https?:\/\/[^@\s\/]+@/;

const NPM_RESOLVED_RE   = /^\s*"?(?:resolved|_resolved|tarball)"\s*[":]\s*"?https?:\/\//;
const NPM_INTEGRITY_RE  = /^\s*"?(?:integrity|_integrity)"\s*[":]\s*"?sha\d+-/;
const YARN_RESOLVED_RE  = /^\s*resolved\s+"https?:\/\//;
const YARN_INTEGRITY_RE = /^\s*integrity\s+sha\d+-/;
const YARN_CHECKSUM_RE  = /^\s*checksum\s+\S/;
const PNPM_INTEGRITY_RE  = /^\s*integrity:\s+sha\d+-/;
const PNPM_TARBALL_RE    = /^\s*tarball:\s+https?:\/\//;
const PNPM_RESOLUTION_RE = /^\s*resolution:\s+\{[^}]*integrity:\s+sha\d+-/;
const CARGO_CHECKSUM_RE = /^\s*checksum\s*=\s*"/;
const CARGO_REGISTRY_RE = /^\s*source\s*=\s*"registry\+/;
const GOSUM_LINE_RE = /^[^\s]+\s+v\S+\s+h1:[A-Za-z0-9+/]+=*\s*$/;
const POETRY_HASH_RE = /hash\s*=\s*"sha\d+:[A-Za-z0-9+/]+=*"/;
const PKG_METADATA_FIELD_RE =
  /^\s*"(?:resolved|_resolved|integrity|_integrity|homepage|bugs|repository|funding|tarball|url)"\s*:/;

function isPackageManagerNoiseLine(filePath, line) {
  const name = path.basename(filePath);
  if (CREDENTIAL_FIELD_RE.test(line))   return false;
  if (EMBEDDED_CRED_URL_RE.test(line))  return false;
  switch (name) {
    case 'package-lock.json':
      return NPM_RESOLVED_RE.test(line) || NPM_INTEGRITY_RE.test(line);
    case 'yarn.lock':
      return YARN_RESOLVED_RE.test(line) || YARN_INTEGRITY_RE.test(line) || YARN_CHECKSUM_RE.test(line);
    case 'pnpm-lock.yaml':
      return PNPM_INTEGRITY_RE.test(line) || PNPM_TARBALL_RE.test(line) || PNPM_RESOLUTION_RE.test(line);
    case 'Cargo.lock':
      return CARGO_CHECKSUM_RE.test(line) || CARGO_REGISTRY_RE.test(line);
    case 'go.sum':
      return GOSUM_LINE_RE.test(line);
    case 'poetry.lock':
      return POETRY_HASH_RE.test(line);
    case 'package.json':
      return PKG_METADATA_FIELD_RE.test(line);
    default:
      return false;
  }
}

function extractCustomRules(customPolicyText = '') {
  return customPolicyText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^forbid:\s*(.+)$/i);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);
}

function scanFile(filePath, enabledCategories = [], customRules = []) {
  const findings = [];
  const content = safeReadFile(filePath);

  if (!content) return findings;

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const skipNoisyDetectors = isPackageManagerNoiseLine(filePath, line);

    if (!skipNoisyDetectors && enabledCategories.includes('secret')) {
      const issue = detectSecretIssue(filePath, line);
      if (issue) {
        findings.push(buildFinding({
          title: issue.title,
          filePath,
          lineNumber,
          severity: issue.severity,
          why: issue.why,
          fix: issue.fix,
          type: 'secret',
          source: 'Secret Exposure',
          rawLine: line,
          fixType: issue.fixType
        }));
      }
    }

    if (!skipNoisyDetectors && enabledCategories.includes('config')) {
      const issue = detectConfigIssue(filePath, line);
      if (issue) {
        findings.push(buildFinding({
          title: issue.title,
          filePath,
          lineNumber,
          severity: issue.severity,
          why: issue.why,
          fix: issue.fix,
          type: 'config',
          source: 'Configuration Rule',
          rawLine: line,
          fixType: issue.fixType
        }));
      }
    }

    if (!skipNoisyDetectors && enabledCategories.includes('web')) {
      const issue = detectWebIssue(filePath, line);
      if (issue) {
        findings.push(buildFinding({
          title: issue.title,
          filePath,
          lineNumber,
          severity: issue.severity,
          why: issue.why,
          fix: issue.fix,
          type: 'web',
          source: 'Web / Front-End Rule',
          rawLine: line,
          fixType: issue.fixType
        }));
      }
    }

    if (enabledCategories.includes('hardening')) {
      const issue = detectHardeningIssue(filePath, line);
      if (issue) {
        findings.push(buildFinding({
          title: issue.title,
          filePath,
          lineNumber,
          severity: issue.severity,
          why: issue.why,
          fix: issue.fix,
          type: 'hardening',
          source: 'Hardening Rule',
          rawLine: line,
          fixType: issue.fixType
        }));
      }
    }

    if (enabledCategories.includes('code')) {
      const issue = detectCodeIssue(filePath, line);
      if (issue) {
        findings.push(buildFinding({
          title: issue.title,
          filePath,
          lineNumber,
          severity: issue.severity,
          why: issue.why,
          fix: issue.fix,
          type: 'code',
          source: 'Code Safety Rule',
          rawLine: line,
          fixType: issue.fixType
        }));
      }
    }

    if (enabledCategories.includes('custom') && customRules.length) {
      customRules.forEach((rule) => {
        if (line.toLowerCase().includes(rule.toLowerCase())) {
          findings.push(buildFinding({
            title: `Custom policy hit: ${rule}`,
            filePath,
            lineNumber,
            severity: 'HIGH',
            why: 'This matched a custom organization rule provided for the scan.',
            fix: `Remove or replace the forbidden pattern "${rule}" according to your policy.`,
            type: 'custom',
            source: 'Custom Policy Rule',
            rawLine: line,
            fixType: 'manual'
          }));
        }
      });
    }
  });

  return findings;
}

module.exports = {
  scanFile,
  extractCustomRules
};