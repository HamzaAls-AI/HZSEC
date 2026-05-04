const path = require('path');

function severityWeight(severity) {
  const map = { CRITICAL: 35, HIGH: 20, MEDIUM: 10, LOW: 4, INFO: 1 };
  return map[severity] || 1;
}

function severityRank(severity) {
  const map = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };
  return map[severity] || 0;
}

function buildFinding({
  title,
  filePath,
  lineNumber,
  severity,
  why,
  fix,
  type,
  rawLine,
  source,
  fixType = 'manual'
}) {
  return {
    id: `${type}-${filePath}-${lineNumber}-${title}`.replace(/[^\w\-:.]/g, '_'),
    title,
    file: path.basename(filePath),
    filePath,
    lineNumber,
    severity,
    whyItMatters: why,
    recommendedFix: fix,
    type,
    source,
    rawLine,
    status: 'OPEN',
    fixType,
    autoFixAvailable: fixType !== 'manual'
  };
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

module.exports = {
  severityWeight,
  severityRank,
  buildFinding,
  dedupeFindings
};