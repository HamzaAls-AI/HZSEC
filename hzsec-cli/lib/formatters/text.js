// Human-readable output. ANSI colors via chalk; falls back to plain text
// when stdout isn't a TTY (e.g. piped to a file or another tool).

const SEV_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

function formatText(report, { chalk, useColor }) {
  const lines = [];
  const c = useColor ? chalk : passthrough();

  const findings = report.findings || [];
  const counts = countBySeverity(findings);

  // Header
  lines.push('');
  lines.push(c.bold(`HZSec scan — ${findings.length} finding${findings.length === 1 ? '' : 's'}`));
  lines.push(c.dim(`${report.mode} mode · ${report.target}`));
  lines.push('');

  // Severity tally
  if (findings.length > 0) {
    const tally = SEV_ORDER
      .filter(sev => counts[sev] > 0)
      .map(sev => sevColor(c, sev)(`${sev}: ${counts[sev]}`))
      .join('  ');
    lines.push('  ' + tally);
    lines.push('');
  }

  // Per-finding (sorted by severity desc, then file)
  const sorted = [...findings].sort((a, b) => {
    const sa = SEV_ORDER.indexOf(a.severity);
    const sb = SEV_ORDER.indexOf(b.severity);
    if (sa !== sb) return sa - sb;
    return (a.filePath || '').localeCompare(b.filePath || '');
  });

  for (const f of sorted) {
    const sev = sevColor(c, f.severity)(f.severity.padEnd(8));
    const loc = c.dim(`${f.filePath}:${f.lineNumber}`);
    lines.push(`  ${sev} ${c.bold(f.title)}`);
    lines.push(`           ${loc}`);
    if (f.whyItMatters) lines.push(`           ${c.dim(truncate(f.whyItMatters, 120))}`);
    lines.push('');
  }

  // Footer
  if (findings.length === 0) {
    lines.push(c.green('  ✓ No findings.'));
    lines.push('');
  } else {
    const score = report.posture?.overallSecurityScore;
    if (typeof score === 'number') {
      lines.push(c.dim(`  Posture score: ${score} / 100  ·  threat: ${report.posture.currentThreatLevel || '?'}`));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function sevColor(c, sev) {
  switch (sev) {
    case 'CRITICAL': return c.bold.red;
    case 'HIGH':     return c.red;
    case 'MEDIUM':   return c.yellow;
    case 'LOW':      return c.cyan;
    default:         return c.dim;
  }
}

function countBySeverity(findings) {
  const out = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  for (const f of findings) {
    if (out[f.severity] !== undefined) out[f.severity]++;
  }
  return out;
}

function truncate(s, n) {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// No-color shim — every chalk method becomes identity.
function passthrough() {
  const id = (s) => s;
  const handler = { get: () => new Proxy(id, handler), apply: (_t, _self, args) => args[0] };
  return new Proxy(id, handler);
}

module.exports = { formatText };
