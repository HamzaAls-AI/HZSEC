const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('securityAPI', {
  // File selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFile: () => ipcRenderer.invoke('select-file'),

  // Scanning
  runScan: (targetPath, options) => ipcRenderer.invoke('run-scan', targetPath, options),
  readFileSnippet: (filePath, lineNumber, context) =>
    ipcRenderer.invoke('read-file-snippet', filePath, lineNumber, context),
  readFullFile: (filePath) => ipcRenderer.invoke('read-full-file', filePath),

  // Fixes
  applySafeFix: (issue) => ipcRenderer.invoke('apply-safe-fix', issue),
  applyAgentFixes: (fixes) => ipcRenderer.invoke('apply-agent-fixes', fixes),

  // Export
  exportReport: (report) => ipcRenderer.invoke('export-report', report),

  // API key (BYO Anthropic)
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  getApiKeyStatus: () => ipcRenderer.invoke('get-api-key-status'),

  // HZSec license (managed proxy)
  setLicense:        (key) => ipcRenderer.invoke('set-license', key),
  getLicenseStatus:  ()    => ipcRenderer.invoke('get-license-status'),
  validateLicense:   ()    => ipcRenderer.invoke('validate-license'),
  clearLicense:      ()    => ipcRenderer.invoke('clear-license'),
  openAccountPage:   ()    => ipcRenderer.invoke('open-account-page'),
  onLicenseUpdated:  (cb)  => {
    ipcRenderer.removeAllListeners('license-updated');
    ipcRenderer.on('license-updated', (_, payload) => cb(payload));
  },

  // Assistant
  assistantMessage: (args) => ipcRenderer.invoke('assistant-message', args),

  // Auto-updater (electron-updater)
  updaterCheckNow:  ()    => ipcRenderer.invoke('updater:check-now'),
  updaterInstall:   ()    => ipcRenderer.invoke('updater:install'),
  onUpdaterStatus:  (cb)  => {
    ipcRenderer.removeAllListeners('updater:status');
    ipcRenderer.on('updater:status', (_, payload) => cb(payload));
  },
  onUpdaterProgress: (cb) => {
    ipcRenderer.removeAllListeners('updater:progress');
    ipcRenderer.on('updater:progress', (_, payload) => cb(payload));
  },
  onUpdaterDownloaded: (cb) => {
    ipcRenderer.removeAllListeners('updater:downloaded');
    ipcRenderer.on('updater:downloaded', (_, payload) => cb(payload));
  },

  // History & prefs
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  listBackups: (filePath) => ipcRenderer.invoke('list-backups', filePath),
  getPrefs: () => ipcRenderer.invoke('get-prefs'),
  savePrefs: (prefs) => ipcRenderer.invoke('save-prefs', prefs),

  // Knowledge base & compliance
  getComplianceScore: (findings) => ipcRenderer.invoke('get-compliance-score', findings),
  getBreachCases: (findings) => ipcRenderer.invoke('get-breach-cases', findings),
  getAllBreaches: () => ipcRenderer.invoke('get-all-breaches'),
  getKbStatus: () => ipcRenderer.invoke('get-kb-status'),
  syncKb: () => ipcRenderer.invoke('sync-kb'),
  markFindingFixed: (id, method) => ipcRenderer.invoke('mark-finding-fixed', id, method),

  // Audit log
  getAuditLog: (limit) => ipcRenderer.invoke('get-audit-log', limit),
  clearAuditLog: () => ipcRenderer.invoke('clear-audit-log'),

  // Monitor
  startMonitor: (targetPath) => ipcRenderer.invoke('start-monitor', targetPath),
  stopMonitor: () => ipcRenderer.invoke('stop-monitor'),
  onMonitorEvent: (callback) => {
    ipcRenderer.removeAllListeners('monitor-event');
    ipcRenderer.on('monitor-event', (_, payload) => callback(payload));
  }
});