// SARIF v2.1.0 — the format GitHub Code Scanning ingests.
// Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
//
// Minimal but complete: one `run` per scan, one `result` per finding,
// one `rule` per detector type. Severity → SARIF level mapping per
// GitHub's docs: critical/high → "error", medium → "warning", low/info → "note".

const path = require('path');

function formatSarif(report) {
  const findings = report.findings || [];
  const rules = collectRules(findings);
  const ruleIndex = new Map(rules.map((r, i) => [r.id, i]));

  const sarif = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name:           'HZSec',
            informationUri: 'https://hzsec.io',
            version:        require('../../package.json').version,
            rules
          }
        },
        results: findings.map(f => ({
          ruleId:    f.type || 'unknown',
          ruleIndex: ruleIndex.get(f.type) ?? 0,
          level:     severityToLevel(f.severity),
          message: {
            text: composeMessage(f)
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: toRelative(f.filePath, report.target)
                },
                region: {
                  startLine:   Math.max(1, f.lineNumber || 1),
                  startColumn: 1,
                  snippet:     f.rawLine ? { text: String(f.rawLine).slice(0, 200) } : undefined
                }
              }
            }
          ],
          properties: {
            'security-severity': securityScore(f.severity)
          }
        })),
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc: report.scannedAt || new Date().toISOString()
          }
        ]
      }
    ]
  };

  return JSON.stringify(sarif, null, 2);
}

function collectRules(findings) {
  const seen = new Map();
  for (const f of findings) {
    const id = f.type || 'unknown';
    if (seen.has(id)) continue;
    seen.set(id, {
      id,
      name: id.replace(/[-_]/g, ' '),
      shortDescription: { text: id },
      fullDescription:  { text: f.title || id },
      defaultConfiguration: { level: severityToLevel(f.severity) },
      properties: { tags: ['security', f.source || 'hzsec'] }
    });
  }
  return Array.from(seen.values());
}

function composeMessage(f) {
  const parts = [f.title];
  if (f.whyItMatters) parts.push(f.whyItMatters);
  if (f.recommendedFix) parts.push('Fix: ' + f.recommendedFix);
  return parts.filter(Boolean).join('\n\n');
}

function severityToLevel(sev) {
  switch (sev) {
    case 'CRITICAL':
    case 'HIGH':   return 'error';
    case 'MEDIUM': return 'warning';
    case 'LOW':
    case 'INFO':   return 'note';
    default:       return 'note';
  }
}

// GitHub uses CVSS-like scores (0–10) in the security-severity property to
// drive its "critical/high/etc." UI buckets in Code Scanning alerts.
function securityScore(sev) {
  switch (sev) {
    case 'CRITICAL': return '9.5';
    case 'HIGH':     return '8.0';
    case 'MEDIUM':   return '5.5';
    case 'LOW':      return '3.0';
    default:         return '1.0';
  }
}

function toRelative(filePath, base) {
  if (!filePath) return '';
  if (!base) return filePath;
  try { return path.relative(base, filePath) || filePath; }
  catch { return filePath; }
}

module.exports = { formatSarif };
