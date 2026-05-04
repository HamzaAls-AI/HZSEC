const { safeReadFile } = require('../core/file-utils');
const { buildFinding } = require('../core/findings');
const { detectSecretIssue } = require('../detectors/secret');
const { detectConfigIssue } = require('../detectors/config');
const { detectWebIssue } = require('../detectors/web');
const { detectHardeningIssue } = require('../detectors/hardening');
const { detectCodeIssue } = require('../detectors/code');

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

    if (enabledCategories.includes('secret')) {
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

    if (enabledCategories.includes('config')) {
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

    if (enabledCategories.includes('web')) {
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