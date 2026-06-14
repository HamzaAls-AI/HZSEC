// Compact JSON output. Used by CI scripts that want to grep / jq the
// findings. Stable shape — additions go at the end, never renamed in
// place. Matches the desktop app's report shape exactly.

function formatJson(report, { pretty = true } = {}) {
  const out = {
    schema:   'hzsec.report.v1',
    version:  require('../../package.json').version,
    target:   report.target,
    mode:     report.mode,
    scannedAt: report.scannedAt || new Date().toISOString(),
    posture:  report.posture || null,
    filesScanned: report.filesScanned ?? 0,
    findings: report.findings || []
  };
  return pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
}

module.exports = { formatJson };
