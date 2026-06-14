const fs = require('fs');
const path = require('path');
const { generateMonitorAlert, generateFixSuggestion } = require('../assistant/assistant-handler');
const { IGNORED_DIRS } = require('../core/file-utils');

let previousFindingsMap = {};

function stopLiveMonitor(state) {
  if (state?.watcher) {
    try { state.watcher.close(); } catch { /* ignore */ }
  }
  if (state?.debounceTimers) {
    Object.values(state.debounceTimers).forEach(clearTimeout);
  }
}

function findingKey(f) {
  return `${f.filePath}:${f.lineNumber}:${f.title}`;
}

function diffFindings(oldFindings = [], newFindings = []) {
  const oldKeys = new Set(oldFindings.map(findingKey));
  const newKeys = new Set(newFindings.map(findingKey));
  return {
    added:    newFindings.filter(f => !oldKeys.has(findingKey(f))),
    resolved: oldFindings.filter(f => !newKeys.has(findingKey(f)))
  };
}

function createSmartMonitor(targetPath, scanFn, sendEvent, getApiKey, previousState = {}) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) throw new Error('Target path does not exist.');

  stopLiveMonitor(previousState);
  previousFindingsMap = {};

  const targetIsFile = fs.statSync(resolved).isFile();
  const watchRoot    = targetIsFile ? path.dirname(resolved) : resolved;
  const state = { watcher: null, targetPath: resolved, debounceTimers: {} };

  // Watch the parent directory when monitoring a single file —
  // this is reliable on macOS, Linux, and Windows unlike watching a file directly.
  // We filter events to only react to the specific file we care about.
  state.watcher = fs.watch(watchRoot, { recursive: !targetIsFile }, async (eventType, filename) => {
    if (!filename) return;

    const fullPath = targetIsFile
      ? resolved                            // single file mode — always the same file
      : path.join(watchRoot, filename);

    // Single file mode: ignore events for other files
    if (targetIsFile && path.resolve(fullPath) !== resolved) return;

    // Skip ignored directories and non-existent paths
    if (filename && filename.split(path.sep).some(seg => IGNORED_DIRS.has(seg))) return;

    try {
      if (!fs.existsSync(fullPath)) return;
      if (fs.statSync(fullPath).isDirectory()) return;
    } catch { return; }

    const debounceKey = fullPath;
    clearTimeout(state.debounceTimers[debounceKey]);

    state.debounceTimers[debounceKey] = setTimeout(async () => {
      try {
        const relName = targetIsFile
          ? path.basename(resolved)
          : path.relative(watchRoot, fullPath);

        sendEvent({
          type: 'file-changed',
          filename: relName,
          fullPath,
          time: new Date().toISOString()
        });

        const newFindings = await scanFn(fullPath);
        const oldFindings = previousFindingsMap[fullPath] || [];
        const { added, resolved: resolvedIssues } = diffFindings(oldFindings, newFindings);
        previousFindingsMap[fullPath] = newFindings;

        if (resolvedIssues.length > 0) {
          sendEvent({
            type: 'issues-resolved',
            filename: relName,
            count: resolvedIssues.length,
            time: new Date().toISOString()
          });
        }

        if (added.length > 0) {
          sendEvent({
            type: 'new-issues',
            filename: relName,
            findings: added,
            time: new Date().toISOString()
          });

          // Log to audit trail
          try {
            const { appendAuditLog } = require('../storage/store');
            appendAuditLog({
              action: 'monitor-alert',
              target: fullPath,
              detail: `${added.length} new issue(s) · Top: ${added[0]?.title} [${added[0]?.severity}]`
            });
          } catch { /* non-fatal */ }

          // AI-enhanced alert
          const apiKey = getApiKey();
          const aiMessage = await generateMonitorAlert(apiKey, relName, added);
          const topIssue  = added[0];
          const aiFixSuggestion = topIssue ? await generateFixSuggestion(apiKey, topIssue) : null;

          sendEvent({
            type: 'ai-alert',
            filename: relName,
            findings: added,
            aiMessage,
            topIssue,
            aiFixSuggestion,
            time: new Date().toISOString()
          });
        }
      } catch (err) {
        sendEvent({
          type: 'monitor-error',
          filename: filename || 'unknown',
          error: err.message,
          time: new Date().toISOString()
        });
      }
    }, 800); // debounce — wait for rapid saves to settle
  });

  return state;
}

function resetFindingsCache() {
  previousFindingsMap = {};
}

module.exports = { createSmartMonitor, stopLiveMonitor, resetFindingsCache };