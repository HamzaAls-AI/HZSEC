const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { MODE_DEFINITIONS } = require('../config/modes');
const {
  isFilePath,
  isDirectoryPath,
  getAllFilesRecursive,
  isConfigFile,
  isWebFile,
  isPotentialCodeFile,
  detectProjectType,
  detectPlatform
} = require('../core/file-utils');
const { severityRank, dedupeFindings } = require('../core/findings');
const { loadIgnoreRules } = require('../core/ignore-rules');
const { getAll: getSuppressions, applySuppressions } = require('../storage/suppressions');
const { scanFile, extractCustomRules } = require('./scan-file');
const {
  bucketCounts,
  previousBucketsFromCurrent,
  getRisingCategory,
  getThreatLevel,
  buildFindingStatuses,
  scoreBreakdown,
  generateRecentActivity,
  generateTrendSnapshot
} = require('../scoring/posture');

// ─── File scoping per mode ────────────────────────────────────────────────────

function shouldInspectFile(filePath, mode) {
  if (mode === 'quick')     return isPotentialCodeFile(filePath) || isConfigFile(filePath) || isWebFile(filePath);
  if (mode === 'config')    return isConfigFile(filePath);
  if (mode === 'secret')    return true; // secrets can hide anywhere
  if (mode === 'web')       return isWebFile(filePath);
  if (mode === 'hardening') return isConfigFile(filePath) || /ssh|firewall|policy|sudoers|sysctl|hosts/i.test(filePath);
  if (mode === 'custom')    return isConfigFile(filePath) || isPotentialCodeFile(filePath) || isWebFile(filePath);
  return true; // full
}

// ─── Rich environment snapshot ────────────────────────────────────────────────

function tryExec(cmd) {
  try { return execSync(cmd, { timeout: 2000, stdio: 'pipe' }).toString().trim(); }
  catch { return null; }
}

function getRuntimeVersions(files) {
  const names = files.map(f => path.basename(f).toLowerCase());
  const versions = {};

  if (names.includes('package.json')) {
    versions.node = tryExec('node --version') || 'Unknown';
    versions.npm  = tryExec('npm --version') ? `npm ${tryExec('npm --version')}` : null;
  }
  if (names.includes('requirements.txt') || names.includes('pyproject.toml')) {
    versions.python = tryExec('python3 --version') || tryExec('python --version') || 'Unknown';
  }
  if (names.some(n => n.endsWith('.go') || n === 'go.mod')) {
    versions.go = tryExec('go version')?.split(' ')[2] || 'Unknown';
  }

  return versions;
}

function getGitInfo(targetPath) {
  const dir = fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
  const branch = tryExec(`git -C "${dir}" rev-parse --abbrev-ref HEAD`);
  const lastCommit = tryExec(`git -C "${dir}" log -1 --format="%cr by %an"`);
  const dirty = tryExec(`git -C "${dir}" status --porcelain`);
  if (!branch) return null;
  return {
    branch,
    lastCommit: lastCommit || 'Unknown',
    uncommittedChanges: dirty ? dirty.split('\n').length : 0
  };
}

function countLinesOfCode(files) {
  let total = 0;
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      total += content.split('\n').length;
    } catch { /* skip */ }
  }
  return total;
}

function buildEnvironmentSnapshot(targetPath, allFiles, scopedFiles, mode, monitorTargetPath) {
  const isMonitored = monitorTargetPath &&
    path.resolve(monitorTargetPath) === path.resolve(targetPath);

  const runtimeVersions = getRuntimeVersions(allFiles);
  const gitInfo = getGitInfo(targetPath);
  const totalLines = countLinesOfCode(scopedFiles);
  const extensions = [...new Set(scopedFiles.map(f => path.extname(f)).filter(Boolean))];

  return {
    selectedTarget: targetPath,
    platform: detectPlatform(allFiles),
    projectType: detectProjectType(allFiles),
    scanEnginesActive: MODE_DEFINITIONS[mode] || MODE_DEFINITIONS.full,
    monitoringStatus: isMonitored ? 'Active' : 'Inactive',
    totalFiles: allFiles.length,
    scannedFiles: scopedFiles.length,
    totalLinesScanned: totalLines,
    fileTypes: extensions.slice(0, 8).join(', ') || 'Mixed',
    runtimeVersions,
    git: gitInfo
  };
}

// ─── Main scan ────────────────────────────────────────────────────────────────

async function runSecurityScan(targetPath, options = {}, monitorTargetPath = null) {
  const resolved = path.resolve(targetPath);
  const mode = options.mode || 'full';
  const enabledCategories = MODE_DEFINITIONS[mode] || MODE_DEFINITIONS.full;
  const customRules = extractCustomRules(options.customPolicyText || '');

  // In full mode, secret detector runs in high-sensitivity mode
  const scanOptions = { mode, highSensitivity: mode === 'full' || mode === 'secret' };

  let allFiles = [];
  if (isFilePath(resolved)) {
    const projectRoot  = path.dirname(resolved);
    const ignoreRules  = loadIgnoreRules(projectRoot);
    if (!ignoreRules.shouldIgnore(resolved, projectRoot)) allFiles = [resolved];
  } else if (isDirectoryPath(resolved)) {
    const ignoreRules = loadIgnoreRules(resolved);
    allFiles = getAllFilesRecursive(resolved, [], ignoreRules, resolved);
  } else {
    throw new Error('Selected path no longer exists.');
  }

  const scopedFiles = allFiles.filter(f => shouldInspectFile(f, mode));
  const findings = dedupeFindings(
    scopedFiles.flatMap(f => scanFile(f, enabledCategories, customRules, scanOptions))
  );

  findings.sort((a, b) => {
    const sd = severityRank(b.severity) - severityRank(a.severity);
    if (sd !== 0) return sd;
    const fd = Number(b.autoFixAvailable) - Number(a.autoFixAvailable);
    if (fd !== 0) return fd;
    if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
    return a.lineNumber - b.lineNumber;
  });

  // Apply suppressions: split findings into active / acknowledged / suppressed
  const { active: activeFindings, acknowledged: acknowledgedFindings, suppressed: suppressedFindings } =
    applySuppressions(findings, getSuppressions());

  const scannedAt = new Date().toISOString();
  const buckets = bucketCounts(activeFindings);
  const previousBuckets = previousBucketsFromCurrent(buckets);
  const breakdown = scoreBreakdown(activeFindings);
  const threatLevel = getThreatLevel(activeFindings);
  const environment = buildEnvironmentSnapshot(resolved, allFiles, scopedFiles, mode, monitorTargetPath);
  const recentActivity = generateRecentActivity(activeFindings, scannedAt, mode, environment.monitoringStatus === 'Active');

  return {
    scannedAt,
    mode,
    targetPath: resolved,
    posture: {
      overallSecurityScore: breakdown.overall,
      currentThreatLevel: threatLevel,
      totalFindings: activeFindings.length,
      criticalFindings: buckets.CRITICAL,
      acknowledgedCount: acknowledgedFindings.length,
      suppressedCount: suppressedFindings.length,
      openSecrets: activeFindings.filter(f => f.type === 'secret').length,
      unresolvedConfigIssues: activeFindings.filter(f => f.type === 'config' || f.type === 'hardening').length,
      monitoredAlerts: environment.monitoringStatus === 'Active' ? Math.max(0, buckets.CRITICAL + buckets.HIGH) : 0,
      lastScanTime: scannedAt,
      monitoredStatus: environment.monitoringStatus
    },
    topPriorityIssue: activeFindings[0] || null,
    riskDistribution: {
      current: buckets,
      previous: previousBuckets,
      risingCategory: getRisingCategory(buckets, previousBuckets)
    },
    securityScoreBreakdown: breakdown.items,
    statusCounts: buildFindingStatuses(activeFindings),
    recentActivity,
    trendSnapshot: generateTrendSnapshot(activeFindings),
    environmentSnapshot: environment,
    findings: activeFindings,
    acknowledgedFindings,
    suppressedFindings,
    filesScanned: scopedFiles.length
  };
}

module.exports = { runSecurityScan };