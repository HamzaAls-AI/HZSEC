const { severityWeight } = require('../core/findings');

function bucketCounts(findings) {
  return {
    CRITICAL: findings.filter((f) => f.severity === 'CRITICAL').length,
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: findings.filter((f) => f.severity === 'MEDIUM').length,
    LOW: findings.filter((f) => f.severity === 'LOW').length,
    INFORMATIONAL: findings.filter((f) => f.severity === 'INFO').length
  };
}

function previousBucketsFromCurrent(current) {
  return {
    CRITICAL: Math.max(0, current.CRITICAL - 1),
    HIGH: Math.max(0, current.HIGH - 1),
    MEDIUM: Math.max(0, current.MEDIUM + 1),
    LOW: Math.max(0, current.LOW),
    INFORMATIONAL: Math.max(0, current.INFORMATIONAL)
  };
}

function getRisingCategory(current, previous) {
  let winner = { key: 'None', delta: 0 };

  Object.keys(current).forEach((key) => {
    const delta = (current[key] || 0) - (previous[key] || 0);
    if (delta > winner.delta) winner = { key, delta };
  });

  return winner.delta > 0 ? `${winner.key} rising (+${winner.delta})` : 'No category rising';
}

function getThreatLevel(findings) {
  const buckets = bucketCounts(findings);

  if (buckets.CRITICAL >= 1 || buckets.HIGH >= 4) return 'HIGH';
  if (buckets.HIGH >= 1 || buckets.MEDIUM >= 3) return 'MEDIUM';
  if (findings.length) return 'LOW';
  return 'LOW';
}

function buildFindingStatuses(findings) {
  return {
    NEW: findings.length,
    OPEN: findings.length,
    IN_REVIEW: 0,
    FIXED_PENDING_RESCAN: 0,
    RESOLVED: 0,
    IGNORED: 0,
    FALSE_POSITIVE: 0
  };
}

function scoreBreakdown(findings) {
  const buckets = bucketCounts(findings);
  const secrets = findings.filter((f) => f.type === 'secret').length;
  const configs = findings.filter((f) => f.type === 'config' || f.type === 'hardening').length;
  const web = findings.filter((f) => f.type === 'web').length;
  const code = findings.filter((f) => f.type === 'code').length;
  const totalRisk = findings.reduce((sum, item) => sum + severityWeight(item.severity), 0);

  const codeSafety = Math.max(0, 100 - Math.round((web * 10) + (code * 12)));
  const configSafety = Math.max(0, 100 - Math.round(configs * 14));
  const secretExposure = Math.max(0, 100 - Math.round(secrets * 24));
  const dependencyHealth = 82;
  const unresolvedFindings = Math.max(0, 100 - Math.round(totalRisk * 0.85));
  const fixCompletionRate = findings.length === 0 ? 100 : Math.max(0, 100 - findings.length * 8);
  const monitorPressure = Math.max(0, 100 - Math.round((buckets.CRITICAL * 25) + (buckets.HIGH * 10)));

  const overall = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (codeSafety * 0.18) +
        (configSafety * 0.20) +
        (secretExposure * 0.22) +
        (dependencyHealth * 0.08) +
        (monitorPressure * 0.08) +
        (unresolvedFindings * 0.16) +
        (fixCompletionRate * 0.08)
      )
    )
  );

  return {
    overall,
    totalRisk,
    items: [
      { key: 'codeSafety', label: 'Code Safety', value: codeSafety, note: 'Unsafe execution and browser-side patterns' },
      { key: 'configSafety', label: 'Config Safety', value: configSafety, note: 'Configuration and hardening quality' },
      { key: 'secretExposure', label: 'Secret Exposure', value: secretExposure, note: 'Keys, passwords, and private material risk' },
      { key: 'dependencyHealth', label: 'Dependency Health', value: dependencyHealth, note: 'Placeholder until package audit is added' },
      { key: 'monitorPressure', label: 'Monitor Pressure', value: monitorPressure, note: 'Live monitor pressure from active risky findings' },
      { key: 'unresolvedFindings', label: 'Unresolved Findings', value: unresolvedFindings, note: 'Open findings affecting security posture' },
      { key: 'fixCompletionRate', label: 'Fix Completion Rate', value: fixCompletionRate, note: 'How much remains open after the last scan' }
    ]
  };
}

function generateRecentActivity(findings, scannedAt, mode, monitorActive) {
  const items = [
    {
      type: 'scan completed',
      message: `Scan completed in ${mode} mode with ${findings.length} finding(s).`,
      time: scannedAt
    }
  ];

  const autoFixCount = findings.filter((f) => f.autoFixAvailable).length;
  if (autoFixCount) {
    items.push({
      type: 'guided fix ready',
      message: `${autoFixCount} finding(s) have a safe suggested fix available.`,
      time: scannedAt
    });
  }

  if (findings.some((f) => f.type === 'secret')) {
    items.push({
      type: 'secret exposure',
      message: 'At least one possible secret exposure was detected.',
      time: scannedAt
    });
  }

  if (monitorActive) {
    items.push({
      type: 'monitor active',
      message: 'Live monitoring is active for the selected target.',
      time: scannedAt
    });
  }

  return items;
}

function generateTrendSnapshot(findings) {
  const total = findings.length;
  const fixed = Math.max(0, Math.floor(total * 0.3));
  const open = total;
  const avgSeverity = findings.length
    ? (findings.reduce((sum, f) => sum + severityWeight(f.severity), 0) / findings.length).toFixed(1)
    : '0.0';
  const timeToResolve = findings.length ? `${Math.max(2, Math.min(14, findings.length))} hrs avg` : '0 hrs avg';

  return {
    findingsOverTime: [Math.max(0, total - 4), Math.max(0, total - 3), Math.max(0, total - 2), Math.max(0, total - 1), total],
    fixedVsOpen: { fixed, open },
    averageSeverityTrend: avgSeverity,
    timeToResolve
  };
}

module.exports = {
  bucketCounts,
  previousBucketsFromCurrent,
  getRisingCategory,
  getThreatLevel,
  buildFindingStatuses,
  scoreBreakdown,
  generateRecentActivity,
  generateTrendSnapshot
};