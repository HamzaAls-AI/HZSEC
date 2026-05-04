'use strict';

// ─── Crash reporting (Sentry — renderer side) ────────────────────────────────
//
// Initialized first so unhandled errors during the rest of the script are
// captured. The DSN is exposed to the renderer via window.SENTRY_DSN
// (injected by main.js if needed) or just left blank → no-op.
try {
  if (window.SENTRY_DSN && typeof window.SENTRY_DSN === 'string') {
    // The @sentry/electron renderer bundle is bundled by electron-builder;
    // in dev (no bundling) the import lives via require if available.
    // We use eval-style require to keep this file usable without a bundler.
    const Sentry = (typeof require === 'function')
      ? require('@sentry/electron/renderer')
      : null;
    if (Sentry) Sentry.init({ dsn: window.SENTRY_DSN });
  }
} catch (err) {
  console.warn('[sentry] renderer init skipped:', err.message);
}

// ─── State ─────────────────────────────────────────────────────────────────
let selectedTarget = null;
let lastReport = null;
let selectedFindingId = null;
let currentSnippet = null;
let apiKeySet = false;
let includeFindings = true;
let includeSnippet = false;
let includeBreaches = false;
let chatHistory = [];
let pendingFixPlan = null;
let monitorStats = { files: 0, issues: 0, resolved: 0 };
let monitorAlertCount = 0;
let currentTheme = 'dark';
let postureView = 'bar'; // 'bar' or 'radial'
let allAuditEntries = [];
let activeFilter = 'all';
let settings = { highSensitivity: false, autoScan: false };
let allBreaches = [];           // loaded once for Breach Library
let libraryFilter = 'all';
let librarySearch = '';

// ─── DOM helpers ────────────────────────────────────────────────────────────
const el = id => document.getElementById(id);

function esc(v = '') {
  return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function setBanner(msg) { el('bannerMsg').textContent = msg; }

function timeStr(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }
  catch { return ''; }
}

function timeDisplay(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month:'short', day:'numeric' }) + ' ' +
      d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  } catch { return iso; }
}

function formatMd(text) {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

// ─── Theme ─────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  el('themeToggle').textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  if (el('themeSelect')) el('themeSelect').value = theme;
  window.securityAPI.savePrefs({ theme });
}

el('themeToggle').addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));

// ─── Panel switching ────────────────────────────────────────────────────────
function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('[data-panel]').forEach(t => t.classList.remove('active'));
  const panel = el(name + 'Panel');
  if (panel) panel.classList.add('active');
  document.querySelectorAll(`[data-panel="${name}"]`).forEach(t => t.classList.add('active'));
  if (name === 'monitor') { monitorAlertCount = 0; el('monitorBadge').style.display = 'none'; }
  if (name === 'audit') loadAuditLog();
  if (name === 'library') loadBreachLibrary();
}

document.querySelectorAll('[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-panel');
    if (target === 'assistant') {
      AsstDrawer.open();
    } else {
      switchPanel(target);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ASSISTANT DRAWER — state machine for the right-side drawer
// ═══════════════════════════════════════════════════════════════════════════
const AsstDrawer = (() => {
  const STATE = { CLOSED: 'closed', DOCKED: 'docked', FULL: 'full' };
  let current = STATE.CLOSED;
  let lastOpenState = STATE.DOCKED;
  let wired = false;
  const NARROW_BP = 1100;

  const drawerEl = () => document.getElementById('asstDrawer');
  const isNarrow = () => window.innerWidth < NARROW_BP;

  function applyState(state) {
    const d = drawerEl();
    if (!d) return;
    document.body.classList.remove('asst-docked', 'asst-full');
    d.classList.remove('open', 'full');

    if (state === STATE.DOCKED) {
      d.classList.add('open');
      document.body.classList.add('asst-docked');
      d.setAttribute('aria-hidden', 'false');
      lastOpenState = STATE.DOCKED;
    } else if (state === STATE.FULL) {
      d.classList.add('open', 'full');
      document.body.classList.add('asst-full');
      d.setAttribute('aria-hidden', 'false');
      lastOpenState = STATE.FULL;
    } else {
      d.setAttribute('aria-hidden', 'true');
    }
    current = state;
    try { window.securityAPI?.savePrefs?.({ asstDrawerState: state }); } catch {}
  }

  function open()       { applyState(STATE.DOCKED); }
  function close()      { applyState(STATE.CLOSED); }
  function toggle()     { current === STATE.CLOSED ? applyState(lastOpenState) : applyState(STATE.CLOSED); }
  function toggleFull() { current === STATE.FULL ? applyState(STATE.DOCKED) : applyState(STATE.FULL); }

  function init(savedState) {
    if (savedState === STATE.DOCKED || savedState === STATE.FULL) {
      const target = (savedState === STATE.FULL && isNarrow()) ? STATE.DOCKED : savedState;
      applyState(target);
    } else if (!wired) {
      applyState(STATE.CLOSED);
    }

    if (wired) return;
    wired = true;

    document.getElementById('asstLauncher')?.addEventListener('click', () => applyState(lastOpenState || STATE.DOCKED));
    document.getElementById('asstCloseBtn')?.addEventListener('click', close);
    document.getElementById('asstFullBtn')?.addEventListener('click', toggleFull);

    document.addEventListener('keydown', e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (e.shiftKey) toggleFull(); else toggle();
      }
      if (e.key === 'Escape' && current === STATE.FULL) applyState(STATE.DOCKED);
    });

    let lastNarrow = isNarrow();
    window.addEventListener('resize', () => {
      const narrow = isNarrow();
      if (narrow !== lastNarrow) {
        lastNarrow = narrow;
        if (narrow && current === STATE.FULL) applyState(STATE.DOCKED);
      }
    });

    // Bottom-strip context tabs in docked mode → open overlay
    const strip = document.querySelectorAll('.asst-ctx-strip-tab');
    const overlay = document.getElementById('asstCtxOverlay');
    const overlayTitle = document.getElementById('asstCtxOverlayTitle');
    const showOverlay = (which) => {
      strip.forEach(b => b.classList.toggle('active', b.getAttribute('data-ctx-strip') === which));
      const titles = { findings: 'Findings', breaches: 'Breaches', compliance: 'Compliance' };
      overlayTitle.textContent = titles[which] || 'Context';
      ['Findings', 'Breaches', 'Compliance'].forEach(name => {
        const elx = document.getElementById('ctxOverlay' + name);
        if (elx) elx.style.display = (name.toLowerCase() === which) ? '' : 'none';
      });
      overlay.classList.add('open');
    };
    strip.forEach(b => b.addEventListener('click', () => {
      const which = b.getAttribute('data-ctx-strip');
      if (overlay.classList.contains('open') && b.classList.contains('active')) {
        overlay.classList.remove('open');
      } else {
        showOverlay(which);
      }
    }));
    document.getElementById('asstCtxOverlayClose')?.addEventListener('click', () => {
      overlay.classList.remove('open');
    });
  }

  return { init, open, close, toggle, toggleFull, get state() { return current; } };
})();

// Wire drawer controls as soon as the DOM is parsed, independent of
// initApp/getPrefs(). initApp later re-calls AsstDrawer.init(savedState) to
// restore the open/closed state — the wired flag prevents double-binding.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AsstDrawer.init());
} else {
  AsstDrawer.init();
}

// Helper: mirror context HTML into both side panel and docked overlay
function setCtx(panelId, overlayId, html) {
  const a = document.getElementById(panelId);
  const b = document.getElementById(overlayId);
  if (a) a.innerHTML = html;
  if (b) b.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// BREACH LIBRARY
// ═══════════════════════════════════════════════════════════════════════════
async function loadBreachLibrary() {
  if (allBreaches.length === 0) {
    try {
      const result = await window.securityAPI.getAllBreaches();
      if (result?.success) allBreaches = result.breaches || [];
    } catch (err) {
      console.error('[Library] failed to load:', err);
    }
  }
  renderBreachLibrary();
}

function renderBreachLibrary() {
  const grid = el('libraryGrid');
  const countEl = el('libraryCount');
  if (!grid) return;

  let filtered = allBreaches.slice();

  // Filter
  if (libraryFilter !== 'all') {
    const f = libraryFilter.toUpperCase();
    if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(f)) {
      filtered = filtered.filter(b => (b.severity || '').toUpperCase() === f);
    } else {
      // Tag-based filter
      filtered = filtered.filter(b => Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(libraryFilter.toLowerCase())));
    }
  }

  // Search
  const q = librarySearch.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(b => {
      const hay = [b.title, b.summary, b.consequence, b.lesson, ...(b.tags || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  countEl.textContent = `${filtered.length} of ${allBreaches.length} breach case${allBreaches.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="library-empty">No matching breach cases.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(b => `
    <div class="library-card" data-sev="${esc(b.severity || 'MEDIUM')}" data-id="${esc(b.id || '')}">
      <div class="library-card-sev-bar"></div>
      <div class="library-card-hdr">
        <div class="library-card-title">${esc(b.title || 'Untitled')}</div>
        <div class="library-card-sev">${esc(b.severity || 'MEDIUM')}</div>
      </div>
      <div class="library-card-summary">${esc(b.summary || '')}</div>
      ${(b.tags || []).length > 0 ? `<div class="library-card-tags">${b.tags.slice(0, 5).map(t => `<span class="library-tag">${esc(t)}</span>`).join('')}</div>` : ''}
      ${b.consequence ? `<div class="library-card-consequence">${esc(b.consequence)}</div>` : ''}
    </div>
  `).join('');

  // Wire card clicks → open detail modal
  grid.querySelectorAll('.library-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const breach = allBreaches.find(b => b.id === id);
      if (breach) openBreachModal(breach);
    });
  });
}

function openBreachModal(breach) {
  el('breachModalTitle').textContent = breach.title || 'Breach';
  const sev = breach.severity || 'MEDIUM';
  el('breachModalSev').textContent = sev;
  el('breachModalSev').className = 'library-card-sev';
  // sev coloring via parent attribute
  const modal = el('breachModal').querySelector('.breach-modal');
  modal.setAttribute('data-sev', sev);
  // Set on the card-sev to inherit colors (use inline override since we're not in a card)
  if (sev === 'CRITICAL')      el('breachModalSev').style.cssText = 'background: rgba(248,113,113,0.12); color: var(--red);';
  else if (sev === 'HIGH')     el('breachModalSev').style.cssText = 'background: rgba(251,146,60,0.12); color: var(--orange);';
  else if (sev === 'MEDIUM')   el('breachModalSev').style.cssText = 'background: rgba(251,191,36,0.12); color: var(--yellow);';
  else                          el('breachModalSev').style.cssText = 'background: rgba(56,189,248,0.12); color: var(--accent);';

  const body = el('breachModalBody');
  body.innerHTML = `
    ${breach.summary ? `<div class="breach-modal-section"><h4>What happened</h4><p>${esc(breach.summary)}</p></div>` : ''}
    ${breach.consequence ? `<div class="breach-modal-section consequence"><h4>Consequence</h4><p>${esc(breach.consequence)}</p></div>` : ''}
    ${breach.timeToExploit ? `<div class="breach-modal-section"><h4>Time to exploit</h4><p>${esc(breach.timeToExploit)}</p></div>` : ''}
    ${breach.lesson ? `<div class="breach-modal-section lesson"><h4>Lesson</h4><p>${esc(breach.lesson)}</p></div>` : ''}
    ${(breach.tags || []).length > 0 ? `<div class="breach-modal-section"><h4>Tags</h4><div class="library-card-tags">${breach.tags.map(t => `<span class="library-tag">${esc(t)}</span>`).join('')}</div></div>` : ''}
  `;
  el('breachModal').classList.add('open');
}

function closeBreachModal() { el('breachModal').classList.remove('open'); }

// Wire library search/filter (after DOM ready it's safe — these elements exist)
setTimeout(() => {
  el('librarySearch')?.addEventListener('input', e => {
    librarySearch = e.target.value;
    renderBreachLibrary();
  });
  el('libraryFilters')?.querySelectorAll('.library-filter').forEach(b => {
    b.addEventListener('click', () => {
      el('libraryFilters').querySelectorAll('.library-filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      libraryFilter = b.getAttribute('data-filter');
      renderBreachLibrary();
    });
  });
  el('breachModalClose')?.addEventListener('click', closeBreachModal);
  el('breachModal')?.addEventListener('click', e => {
    if (e.target.id === 'breachModal') closeBreachModal();
  });
}, 0);

// ─── Posture toggle ─────────────────────────────────────────────────────────
function setPostureView(view) {
  postureView = view;
  el('postureBarView').style.display    = view === 'bar'    ? 'flex' : 'none';
  el('postureRadialView').style.display = view === 'radial' ? 'flex' : 'none';
  el('postureToggle').textContent = view === 'bar' ? 'Switch to radial view' : 'Switch to bar view';
  if (el('postureViewSelect')) el('postureViewSelect').value = view;
  window.securityAPI.savePrefs({ postureView: view });
}

el('postureToggle').addEventListener('click', () => setPostureView(postureView === 'bar' ? 'radial' : 'bar'));

// ─── File selection ─────────────────────────────────────────────────────────
el('scanFolderBtn').addEventListener('click', async () => {
  const folder = await window.securityAPI.selectFolder();
  if (!folder) return;
  selectedTarget = folder;
  el('targetDisplay').textContent = folder;
  el('targetDisplay').classList.add('has');
  setBanner('Folder selected.');
  if (settings.autoScan) runScan();
});

el('scanFileBtn').addEventListener('click', async () => {
  const file = await window.securityAPI.selectFile();
  if (!file) return;
  selectedTarget = file;
  el('targetDisplay').textContent = file;
  el('targetDisplay').classList.add('has');
  setBanner('File selected.');
  if (settings.autoScan) runScan();
});

// ─── Scan panel empty state ─────────────────────────────────────────────────
//
// The drop-zone shown when no scan has run delegates to the same selectFolder /
// selectFile dialogs the sidebar buttons use. Drag-and-drop accepts any file
// or folder; we resolve to its on-disk path via webUtils.

el('scanEmptyFolderBtn')?.addEventListener('click', () => el('scanFolderBtn').click());
el('scanEmptyFileBtn')?.addEventListener('click',   () => el('scanFileBtn').click());

(function wireEmptyDrop() {
  const drop = el('scanEmptyDrop');
  if (!drop) return;
  ['dragenter', 'dragover'].forEach(evt => drop.addEventListener(evt, e => {
    e.preventDefault();
    drop.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(evt => drop.addEventListener(evt, e => {
    e.preventDefault();
    if (evt === 'dragleave' && e.target !== drop) return;
    drop.classList.remove('dragover');
  }));
  drop.addEventListener('drop', async e => {
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    // Electron exposes f.path on dropped files (if not, the user can use the
    // button instead — drag-and-drop is a nicety, not the only path).
    const p = f.path || (window.electron?.webUtils?.getPathForFile?.(f));
    if (!p) {
      setBanner('Drag-drop not available — use Select Folder / File.');
      return;
    }
    selectedTarget = p;
    el('targetDisplay').textContent = p;
    el('targetDisplay').classList.add('has');
    setBanner('Target set from drop. Running scan…');
    runScan();
  });
})();

// ─── Scanning ────────────────────────────────────────────────────────────────
async function runScan() {
  if (!selectedTarget) { setBanner('Select a file or folder first.'); return; }
  setBanner('Scanning...');
  el('runScanBtn').disabled = true;

  const result = await window.securityAPI.runScan(selectedTarget, {
    mode: el('scanMode').value,
    customPolicyText: el('customPolicy').value,
    highSensitivity: settings.highSensitivity
  });

  el('runScanBtn').disabled = false;
  if (!result.success) { setBanner(result.error || 'Scan failed.'); return; }

  lastReport = result.data;
  renderScanResults(result.data);
  updateCtxFindings(result.data.findings);
  loadScoreHistory();
  loadIntelligenceData(result.data.findings).catch(() => {});
  setBanner(`Scan complete — ${result.data.findings.length} finding(s) across ${result.data.filesScanned} file(s).`);
}

el('runScanBtn').addEventListener('click', runScan);

el('exportBtn').addEventListener('click', async () => {
  if (!lastReport) { setBanner('Run a scan before exporting.'); return; }
  const result = await window.securityAPI.exportReport(lastReport);
  setBanner(result.success ? 'Report exported.' : (result.error || 'Export failed.'));
});

// ─── Posture renderers ────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return 'var(--green)';
  if (score >= 60) return 'var(--yellow)';
  if (score >= 40) return 'var(--orange)';
  return 'var(--red)';
}

function renderPostureBar(score, threatLevel, totalFindings, criticalFindings, mode) {
  el('postureScoreLabel').textContent = score;
  el('postureMarker').style.left = score + '%';

  const threat = String(threatLevel).toUpperCase();
  el('postureTags').innerHTML = `
    <div class="posture-tag threat-${threat}"><div class="posture-tag-dot"></div>${threat} THREAT</div>
    <div class="posture-tag">${totalFindings} finding${totalFindings !== 1 ? 's' : ''}</div>
    <div class="posture-tag" style="color:var(--red)">${criticalFindings} critical</div>
    <div class="posture-tag">${esc(mode)} mode</div>`;
}

function renderRadial(score, threatLevel, totalFindings, criticalFindings, mode) {
  el('radialScore').textContent = score;
  el('radialScore').style.color = scoreColor(score);
  el('radialThreat').textContent = threatLevel;
  el('radialThreat').style.color = scoreColor(score);
  el('radialFindings').textContent = totalFindings;
  el('radialCritical').textContent = criticalFindings;
  el('radialCritical').style.color = criticalFindings > 0 ? 'var(--red)' : 'var(--green)';
  el('radialMode').textContent = mode;

  // Animate arc: circumference = 2π×44 ≈ 276.46
  const circ = 276.46;
  const offset = circ - (score / 100) * circ;
  el('radialFill').style.strokeDashoffset = offset;
  el('radialFill').style.stroke = scoreColor(score);
}

// ─── Render scan results ─────────────────────────────────────────────────────
function renderScanResults(data) {
  const p = data.posture;
  const score = p.overallSecurityScore;

  // Reveal the regular scan UI (and hide the empty-state drop zone).
  el('scanPanel')?.classList.add('has-scan');

  el('scoreChip').style.display = 'inline-flex';
  el('scoreVal').textContent = score;

  renderPostureBar(score, p.currentThreatLevel, p.totalFindings, p.criticalFindings, data.mode);
  renderRadial(score, p.currentThreatLevel, p.totalFindings, p.criticalFindings, data.mode);

  const r = data.riskDistribution.current;
  const total = (r.CRITICAL + r.HIGH + r.MEDIUM + r.LOW) || 1;
  el('riskC').textContent = r.CRITICAL; el('barC').style.width = Math.round((r.CRITICAL/total)*100)+'%';
  el('riskH').textContent = r.HIGH;     el('barH').style.width = Math.round((r.HIGH/total)*100)+'%';
  el('riskM').textContent = r.MEDIUM;   el('barM').style.width = Math.round((r.MEDIUM/total)*100)+'%';
  el('riskL').textContent = r.LOW;      el('barL').style.width = Math.round((r.LOW/total)*100)+'%';
  el('risingCat').textContent = data.riskDistribution.risingCategory;

  renderPriority(data.topPriorityIssue);
  renderEnvironment(data.environmentSnapshot);
  renderFindings(data.findings);
}

function renderPriority(issue) {
  if (!issue) { el('priorityPanel').innerHTML = `<div class="empty-state">No priority issue found.</div>`; return; }
  el('priorityPanel').innerHTML = `
    <div class="priority-card">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px">${esc(issue.title)}</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:7px">
        <span class="pill ${issue.severity}">${issue.severity}</span>
        <span style="font-size:11px;color:var(--muted);font-family:'Space Mono',monospace">${esc(issue.file)} · L${issue.lineNumber}</span>
      </div>
      <div style="font-size:12px;opacity:.8;margin-bottom:4px"><strong>Why:</strong> ${esc(issue.whyItMatters)}</div>
      <div style="font-size:12px;color:var(--green)"><strong>Fix:</strong> ${esc(issue.recommendedFix)}</div>
      <div class="finding-actions" style="margin-top:8px">
        <button class="abtn blue" data-action="view" data-id="${esc(issue.id)}">View snippet</button>
        ${issue.autoFixAvailable ? `<button class="abtn green" data-action="fix" data-id="${esc(issue.id)}">Quick fix</button>` : ''}
        <button class="abtn purple" data-action="ask" data-id="${esc(issue.id)}">Ask assistant</button>
      </div>
    </div>`;
}

function renderEnvironment(snap) {
  if (!snap) { el('environmentBox').innerHTML = `<div class="empty-state">No data yet.</div>`; return; }

  const rows = [];

  rows.push({ key: 'Target', val: snap.selectedTarget.split('/').pop() || snap.selectedTarget, cls: '' });
  rows.push({ key: 'Platform', val: snap.platform, cls: '' });
  rows.push({ key: 'Project type', val: snap.projectType, cls: '' });
  rows.push({ key: 'Files scanned', val: `${snap.scannedFiles} of ${snap.totalFiles}`, cls: '' });

  if (snap.totalLinesScanned) {
    rows.push({ key: 'Lines scanned', val: snap.totalLinesScanned.toLocaleString(), cls: '' });
  }

  if (snap.fileTypes) {
    rows.push({ key: 'File types', val: snap.fileTypes, cls: '' });
  }

  // Runtime versions
  if (snap.runtimeVersions) {
    const rv = snap.runtimeVersions;
    if (rv.node)   rows.push({ key: 'Node.js', val: rv.node, cls: '' });
    if (rv.npm)    rows.push({ key: 'npm', val: rv.npm, cls: '' });
    if (rv.python) rows.push({ key: 'Python', val: rv.python, cls: '' });
    if (rv.go)     rows.push({ key: 'Go', val: rv.go, cls: '' });
  }

  // Git info
  if (snap.git) {
    const g = snap.git;
    rows.push({
      key: 'Git branch',
      val: `<span class="env-badge git">${esc(g.branch)}</span>${g.uncommittedChanges > 0 ? ` <span class="env-badge dirty">${g.uncommittedChanges} uncommitted</span>` : ''}`,
      raw: true
    });
    if (g.lastCommit) rows.push({ key: 'Last commit', val: g.lastCommit, cls: 'env-val' });
  }

  rows.push({ key: 'Monitor', val: snap.monitoringStatus, cls: snap.monitoringStatus === 'Active' ? 'good' : '' });
  rows.push({ key: 'Engines', val: snap.scanEnginesActive.join(', '), cls: '' });

  el('environmentBox').innerHTML = rows.map(r => `
    <div class="env-row">
      <span class="env-key">${esc(r.key)}</span>
      <span class="env-val ${r.cls || ''}">${r.raw ? r.val : esc(r.val)}</span>
    </div>`).join('');
}

function renderFindings(findings = []) {
  if (!findings.length) { el('findingsList').innerHTML = `<div class="empty-state">No findings — looking clean.</div>`; return; }
  el('findingsList').innerHTML = findings.map(f => `
    <div class="finding-card">
      <div class="finding-top"><div class="finding-title">${esc(f.title)}</div><span class="pill ${f.severity}">${f.severity}</span></div>
      <div class="finding-meta">${esc(f.file)} · line ${f.lineNumber} · ${esc(f.type)}</div>
      <div class="finding-why"><strong>Why:</strong> ${esc(f.whyItMatters)}</div>
      <div class="finding-fix"><strong>Fix:</strong> ${esc(f.recommendedFix)}</div>
      <div class="finding-actions">
        <button class="abtn blue" data-action="view" data-id="${esc(f.id)}">View snippet</button>
        ${f.autoFixAvailable ? `<button class="abtn green" data-action="fix" data-id="${esc(f.id)}">Quick fix</button>` : ''}
        <button class="abtn purple" data-action="ask" data-id="${esc(f.id)}">Ask assistant</button>
      </div>
    </div>`).join('');
}

// ─── Score history ─────────────────────────────────────────────────────────
async function loadScoreHistory() {
  const result = await window.securityAPI.getHistory();
  if (!result.success || !result.history.length) {
    el('clearHistoryBtn').style.display = 'none';
    return;
  }

  const history = result.history.slice(0, 14).reverse();
  el('scoreHistoryEmpty').style.display = 'none';
  el('historyChart').style.display = 'flex';
  el('historyMeta').style.display = 'flex';
  el('clearHistoryBtn').style.display = 'inline-flex';

  el('historyChart').innerHTML = history.map(h => {
    const pct = Math.max(5, Math.round((h.score / 100) * 100));
    const color = h.score >= 75 ? 'var(--green)' : h.score >= 50 ? 'var(--yellow)' : 'var(--red)';
    const date = new Date(h.scannedAt).toLocaleDateString([], { month:'short', day:'numeric' });
    return `<div class="history-bar" style="height:${pct}%;background:${color}" title="${date}: ${h.score}/100"></div>`;
  }).join('');

  const latest = result.history[0];
  const oldest = history[0];
  const trend = latest.score - oldest.score;
  el('historyMeta').innerHTML = `
    <span>${history.length} scans</span>
    <span style="color:${trend >= 0 ? 'var(--green)' : 'var(--red)'}">${trend >= 0 ? '+' : ''}${trend} pts trend</span>`;
}

el('clearHistoryBtn').addEventListener('click', async () => {
  if (!confirm('Reset score history? This cannot be undone.')) return;
  await window.securityAPI.clearHistory();
  el('historyChart').style.display = 'none';
  el('historyMeta').style.display = 'none';
  el('clearHistoryBtn').style.display = 'none';
  el('scoreHistoryEmpty').style.display = 'block';
  el('scoreHistoryEmpty').textContent = 'History cleared. Run scans to build a new trend.';
  setBanner('Score history reset.');
});

// ─── Snippet ─────────────────────────────────────────────────────────────────
async function showSnippet(issue) {
  const result = await window.securityAPI.readFileSnippet(issue.filePath, issue.lineNumber, 4);
  if (!result.success) { el('snippetViewer').textContent = result.error || 'Could not load.'; return; }
  currentSnippet = result.snippet.map(l => `${l.highlight ? '>>' : '  '} ${l.lineNumber}: ${l.content}`).join('\n');
  el('snippetViewer').innerHTML = result.snippet.map(l =>
    `<span class="snip-line${l.highlight ? ' hl' : ''}">${l.highlight ? '>> ' : '   '}${l.lineNumber}: ${esc(l.content)}</span>`
  ).join('\n');
}

async function applyQuickFix(issue) {
  const result = await window.securityAPI.applySafeFix(issue);
  if (!result.success) { setBanner(result.error || 'Fix failed.'); return; }
  setBanner(`Fixed ${issue.file} — backup saved to ~/.hzsec/backups/`);
  await runScan();
}

function findById(id) { return lastReport?.findings?.find(f => f.id === id) || null; }

// ─── Global click delegation ─────────────────────────────────────────────────
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const issue = id ? findById(id) : null;

  if (action === 'view' && issue) {
    await showSnippet(issue);
    switchPanel('scan');
    setTimeout(() => el('snippetViewer').scrollIntoView({ behavior:'smooth', block:'center' }), 100);
  }
  if (action === 'fix' && issue) await applyQuickFix(issue);
  if (action === 'ask' && issue) {
    selectedFindingId = id;
    AsstDrawer.open();
    el('chatInput').value = `Can you explain and fix this?\n\nIssue: ${issue.title}\nFile: ${issue.file}, line ${issue.lineNumber}\nWhy: ${issue.whyItMatters}`;
    updateCtxSelection(id);
    el('chatInput').focus();
  }
  if (action === 'ctx-select') {
    selectedFindingId = selectedFindingId === id ? null : id;
    updateCtxSelection(selectedFindingId);
  }
});

// ─── Monitor ─────────────────────────────────────────────────────────────────
function setMonitorActive(active) {
  const cls = active ? 'monitor-pill active' : 'monitor-pill';
  el('monitorPill').className = cls;
  el('monitorHdrPill').className = cls;
  el('monitorStatusText').textContent = active ? 'Active' : 'Inactive';
  el('monitorHdrStatus').textContent  = active ? 'Active' : 'Inactive';
}

el('startMonitorBtn').addEventListener('click', async () => {
  if (!selectedTarget) { setBanner('Select a target first.'); return; }
  const result = await window.securityAPI.startMonitor(selectedTarget);
  if (!result.success) { setBanner(result.error || 'Could not start monitor.'); return; }
  setMonitorActive(true);
  monitorStats = { files: 0, issues: 0, resolved: 0 };
  updateMStats();
  setBanner('Live monitor started. Watching for changes in files and folders.');
});

el('stopMonitorBtn').addEventListener('click', async () => {
  await window.securityAPI.stopMonitor();
  setMonitorActive(false);
  setBanner('Monitor stopped.');
});

el('clearFeedBtn').addEventListener('click', () => {
  el('monitorEvents').innerHTML = `<div class="monitor-empty"><div class="monitor-empty-icon">◎</div><p>Feed cleared. Monitoring continues.</p></div>`;
});

function updateMStats() {
  el('mstatFiles').textContent    = monitorStats.files;
  el('mstatIssues').textContent   = monitorStats.issues;
  el('mstatResolved').textContent = monitorStats.resolved;
}

function addMonitorEvent(payload) {
  const empty = el('monitorEvents').querySelector('.monitor-empty');
  if (empty) empty.remove();

  const card = document.createElement('div');

  if (payload.type === 'file-changed') {
    card.className = 'event-card';
    card.innerHTML = `<div class="event-top"><span class="event-badge info">FILE CHANGED</span><span class="event-time">${timeStr(payload.time)}</span></div><div class="event-file">${esc(payload.filename)}</div>`;
    monitorStats.files++;
  }
  else if (payload.type === 'new-issues') {
    card.className = 'event-card alert';
    card.innerHTML = `
      <div class="event-top"><span class="event-badge alert">⚠ NEW ISSUES (${payload.findings.length})</span><span class="event-time">${timeStr(payload.time)}</span></div>
      <div class="event-file">${esc(payload.filename)}</div>
      <div class="event-findings">
        ${payload.findings.slice(0,4).map(f => `<div class="event-finding-row"><span class="pill ${f.severity}" style="font-size:10px">${f.severity}</span><span>${esc(f.title)}</span><span style="color:var(--muted);font-size:11px;margin-left:auto">L${f.lineNumber}</span></div>`).join('')}
        ${payload.findings.length > 4 ? `<div style="font-size:11px;color:var(--muted)">+${payload.findings.length - 4} more</div>` : ''}
      </div>`;
    monitorStats.issues += payload.findings.length;
    monitorAlertCount += payload.findings.length;
    if (!document.querySelector('[data-panel="monitor"].active')) {
      el('monitorBadge').textContent = monitorAlertCount;
      el('monitorBadge').style.display = 'inline-flex';
    }
    addRecentAlert(payload.filename, payload.findings.length, payload.time);
  }
  else if (payload.type === 'ai-alert') {
    card.className = 'event-card alert';
    card.innerHTML = `
      <div class="event-top"><span class="event-badge ai">✦ AI ALERT</span><span class="event-time">${timeStr(payload.time)}</span></div>
      <div class="event-file">${esc(payload.filename)}</div>
      ${payload.aiMessage ? `<div class="event-ai-label">AI Assessment</div><div class="event-ai-msg">${esc(payload.aiMessage)}</div>` : ''}
      ${payload.aiFixSuggestion ? `<div class="event-fix-block"><div class="event-fix-label">Suggested Fix</div><div class="event-fix-text">${esc(payload.aiFixSuggestion)}</div></div>` : ''}
      <div style="margin-top:7px"><button class="abtn blue" data-action="ask" data-id="${esc(payload.topIssue?.id || '')}">Open in assistant</button></div>`;
  }
  else if (payload.type === 'issues-resolved') {
    card.className = 'event-card resolved';
    card.innerHTML = `<div class="event-top"><span class="event-badge resolve">✓ RESOLVED (${payload.count})</span><span class="event-time">${timeStr(payload.time)}</span></div><div class="event-file">${esc(payload.filename)}</div>`;
    monitorStats.resolved += payload.count;
  }
  else if (payload.type === 'monitor-error') {
    card.className = 'event-card';
    card.innerHTML = `<div class="event-top"><span class="event-badge info">ERROR</span><span class="event-time">${timeStr(payload.time)}</span></div><div style="font-size:12px;color:var(--red)">${esc(payload.error)}</div>`;
  }

  if (card.innerHTML) el('monitorEvents').insertBefore(card, el('monitorEvents').firstChild);
  updateMStats();
}

function addRecentAlert(filename, count, time) {
  const c = el('recentAlerts');
  const placeholder = c.querySelector('div');
  if (placeholder && !placeholder.className) placeholder.remove();
  const row = document.createElement('div');
  row.className = 'recent-alert-row';
  row.innerHTML = `<div class="recent-alert-file">${esc(filename)} (+${count})</div><div class="recent-alert-time">${timeStr(time)}</div>`;
  c.insertBefore(row, c.firstChild);
  while (c.children.length > 8) c.removeChild(c.lastChild);
}

window.securityAPI.onMonitorEvent(addMonitorEvent);

// ─── Assistant context ────────────────────────────────────────────────────────
function updateCtxFindings(findings = []) {
  el('ctxCount').textContent = findings.length;
  if (!findings.length) {
    setCtx('ctxFindingsList', 'ctxOverlayFindings', `<div class="empty-state" style="font-size:12px">No findings.</div>`);
    return;
  }
  const html = findings.slice(0,20).map(f => `
    <div class="ctx-finding ${selectedFindingId === f.id ? 'selected' : ''}" data-action="ctx-select" data-id="${esc(f.id)}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px"><span class="pill ${f.severity}" style="font-size:10px">${f.severity}</span><div class="ctx-finding-title">${esc(f.title)}</div></div>
      <div class="ctx-finding-meta">${esc(f.file)} · L${f.lineNumber}</div>
    </div>`).join('');
  setCtx('ctxFindingsList', 'ctxOverlayFindings', html);
}

function updateCtxSelection(id) {
  selectedFindingId = id;
  document.querySelectorAll('.ctx-finding').forEach(c => c.classList.toggle('selected', c.getAttribute('data-id') === id));
}

el('ctxFindingsChip').addEventListener('click', () => { includeFindings = !includeFindings; el('ctxFindingsChip').classList.toggle('on', includeFindings); });
el('ctxSnippetChip').addEventListener('click', () => { includeSnippet = !includeSnippet; el('ctxSnippetChip').classList.toggle('on', includeSnippet); });
el('ctxBreachesChip')?.addEventListener('click', () => { includeBreaches = !includeBreaches; el('ctxBreachesChip').classList.toggle('on', includeBreaches); });

// ─── Assistant chat ───────────────────────────────────────────────────────────
function addMessage(role, content, time) {
  const wrapper = document.createElement('div');
  wrapper.className = `msg ${role}`;
  const av = document.createElement('div');
  av.className = `msg-av ${role === 'assistant' ? 'ai' : 'user'}`;
  av.textContent = role === 'assistant' ? 'Hz' : 'U';
  const inner = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = role === 'assistant' ? formatMd(content) : esc(content).replace(/\n/g,'<br>');
  const t = document.createElement('div');
  t.className = 'msg-time';
  t.textContent = time || new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  inner.appendChild(bubble); inner.appendChild(t);
  wrapper.appendChild(av); wrapper.appendChild(inner);
  el('chatMessages').appendChild(wrapper);
  el('chatMessages').scrollTop = el('chatMessages').scrollHeight;
  return { wrapper, bubble };
}

function addFixPlanMessage(message, fixes) {
  const { bubble } = addMessage('assistant', message);
  if (fixes && fixes.length > 0) {
    const planCard = document.createElement('div');
    planCard.className = 'fix-plan-card';
    planCard.innerHTML = `
      <div class="fix-plan-title">✦ ${fixes.length} proposed fix${fixes.length > 1 ? 'es' : ''}</div>
      <div class="fix-plan-items">
        ${fixes.slice(0,5).map(f => `<div class="fix-plan-item"><div class="fix-plan-item-file">${esc((f.filePath||'').split('/').pop())} · L${f.lineNumber}</div><div>${esc(f.reason||'')}</div></div>`).join('')}
        ${fixes.length > 5 ? `<div style="font-size:11px;color:var(--muted)">+${fixes.length-5} more</div>` : ''}
      </div>
      <div class="fix-plan-actions">
        <button class="abtn green" id="reviewFixesBtn">Review & apply</button>
        <button class="abtn" id="rejectFixesBtn">Reject</button>
      </div>`;
    bubble.appendChild(planCard);
    el('chatMessages').scrollTop = el('chatMessages').scrollHeight;
    el('reviewFixesBtn').addEventListener('click', () => openDiffModal(message, fixes));
    el('rejectFixesBtn').addEventListener('click', () => { planCard.innerHTML = `<div style="font-size:12px;color:var(--muted)">Fix plan rejected.</div>`; });
  }
  return { bubble };
}

function addTyping() {
  const w = document.createElement('div');
  w.className = 'msg'; w.id = 'typingIndicator';
  const av = document.createElement('div'); av.className = 'msg-av ai'; av.textContent = 'Hz';
  const b = document.createElement('div'); b.className = 'msg-bubble';
  b.innerHTML = `<div class="typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  w.appendChild(av); w.appendChild(b);
  el('chatMessages').appendChild(w);
  el('chatMessages').scrollTop = el('chatMessages').scrollHeight;
}

function removeTyping() { const t = el('typingIndicator'); if (t) t.remove(); }

async function sendMessage() {
  const text = el('chatInput').value.trim();
  if (!text) return;
  el('chatInput').value = '';
  el('sendBtn').disabled = true;
  chatHistory.push({ role:'user', content:text });
  addMessage('user', text);
  addTyping();

  const findings = (includeFindings && lastReport?.findings) ? lastReport.findings : null;
  const snippet  = (includeSnippet && currentSnippet) ? currentSnippet : null;
  const result = await window.securityAPI.assistantMessage({ messages:chatHistory, findings, snippet, includeBreaches });
  removeTyping();
  el('sendBtn').disabled = false;

  if (!result.success) {
    const err = result.error || 'Something went wrong.';
    chatHistory.push({ role:'assistant', content:err });
    addMessage('assistant', err);
    return;
  }

  if (result.type === 'fix-plan') {
    pendingFixPlan = result.fixes;
    chatHistory.push({ role:'assistant', content:result.message });
    const { bubble } = addFixPlanMessage(result.message, result.fixes) || {};
    appendToolTrace(bubble, result.toolCalls);
  } else {
    chatHistory.push({ role:'assistant', content:result.message });
    const { bubble } = addMessage('assistant', result.message);
    appendToolTrace(bubble, result.toolCalls);
  }
}

function appendToolTrace(bubble, toolCalls) {
  if (!bubble || !toolCalls?.length) return;
  const summary = toolCalls.map(tc => {
    const firstArg = tc.input ? Object.values(tc.input)[0] : '';
    const argStr = typeof firstArg === 'string' && firstArg.length > 30 ? firstArg.slice(0, 30) + '…' : firstArg;
    return `${tc.name}(${argStr || ''})${tc.hadError ? ' ⚠' : ''}`;
  }).join(' · ');
  bubble.insertAdjacentHTML('beforeend', `<div class="tool-trace">⚙ ${esc(summary)}</div>`);
}

el('sendBtn').addEventListener('click', sendMessage);
el('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
el('asstClearBtn')?.addEventListener('click', () => {
  chatHistory = [];
  el('chatMessages').innerHTML = `<div class="msg"><div class="msg-av ai">Hz</div><div><div class="msg-bubble"><strong>Chat cleared.</strong></div><div class="msg-time">HZSec</div></div></div>`;
});

// ─── Diff modal ───────────────────────────────────────────────────────────────
function openDiffModal(message, fixes) {
  pendingFixPlan = fixes;
  el('diffMessage').textContent = message;
  el('diffSubtitle').textContent = `${fixes.length} change${fixes.length > 1 ? 's' : ''} proposed`;
  el('diffItems').innerHTML = fixes.map(fix => `
    <div class="diff-item">
      <div class="diff-item-hdr"><span class="diff-item-file">${esc((fix.filePath||'').split('/').pop())}</span><span class="diff-item-line">Line ${fix.lineNumber}</span></div>
      <div><div class="diff-line removed"><span class="diff-line-sign">−</span><span>${esc(fix.originalLine||'')}</span></div><div class="diff-line added"><span class="diff-line-sign">+</span><span>${esc(fix.newLine||'')}</span></div></div>
      ${fix.reason ? `<div class="diff-reason">${esc(fix.reason)}</div>` : ''}
    </div>`).join('');
  el('diffModal').classList.remove('hidden');
}

el('diffClose').addEventListener('click', () => el('diffModal').classList.add('hidden'));
el('diffReject').addEventListener('click', () => {
  el('diffModal').classList.add('hidden');
  pendingFixPlan = null;
  addMessage('assistant', 'Fix plan rejected — no changes made.');
  chatHistory.push({ role:'assistant', content:'Fix plan rejected — no changes made.' });
});
el('diffApprove').addEventListener('click', async () => {
  if (!pendingFixPlan) return;
  el('diffApprove').textContent = 'Applying...';
  el('diffApprove').disabled = true;
  const result = await window.securityAPI.applyAgentFixes(pendingFixPlan);
  el('diffModal').classList.add('hidden');
  el('diffApprove').textContent = 'Apply all fixes';
  el('diffApprove').disabled = false;

  if (!result.success) { addMessage('assistant', 'Some fixes could not be applied. Check files manually.'); return; }
  const applied = result.results.filter(r => r.success).length;
  const failed  = result.results.filter(r => !r.success).length;
  const summary = `Applied ${applied} fix${applied !== 1 ? 'es' : ''}${failed ? ` (${failed} failed)` : ''}. Rescanning...`;
  addMessage('assistant', summary);
  chatHistory.push({ role:'assistant', content:summary });
  pendingFixPlan = null;
  await runScan();
  const newCount = lastReport?.findings?.length ?? 0;
  const followUp = `Rescan complete. ${newCount} finding(s) remaining.`;
  addMessage('assistant', followUp);
  chatHistory.push({ role:'assistant', content:followUp });
});

// ─── API key ──────────────────────────────────────────────────────────────────
el('apiKeySaveBtn').addEventListener('click', async () => {
  const key = el('apiKeyInput').value.trim();
  if (!key) return;
  await window.securityAPI.setApiKey(key);
  apiKeySet = true;
  el('apiKeyStatus').textContent = 'Saved & encrypted ✓';
  el('apiKeyStatus').className = 'api-status set';
  el('apiKeyInput').value = '';
  setBanner('API key saved. AI features active.');
});

// ─── Account / HZSec license ─────────────────────────────────────────────────
//
// Two transports are mutually compatible: license-key wins when set (proxy
// mode), otherwise we fall back to the BYO Anthropic key. The UI in Settings
// shows whichever is active and lets the user switch.

function showAcctMessage(text, kind = 'info') {
  const node = el('acctMessage');
  if (!node) return;
  node.textContent = text;
  node.style.display = text ? 'block' : 'none';
  node.style.color = kind === 'error' ? 'var(--danger,#dc2626)' :
                     kind === 'ok'    ? 'var(--green,#10b981)' :
                     'var(--muted)';
}

async function refreshAccountUI() {
  const status = await window.securityAPI.getLicenseStatus();
  const desc       = el('acctStatusDesc');
  const signIn     = el('acctSignInBtn');
  const signOut    = el('acctSignOutBtn');
  const licenseRow = el('acctLicenseRow');
  const usageRow   = el('acctUsageRow');

  if (!status.hasLicense) {
    desc.textContent = 'Sign in to use the managed AI assistant — no API key required. Or paste a license key below.';
    signIn.style.display = '';
    signOut.style.display = 'none';
    licenseRow.style.display = 'none';
    usageRow.style.display = 'none';
    return;
  }

  desc.textContent = 'Signed in to HZSec. Assistant calls go through the managed proxy — your code still stays local; only chat messages reach the backend.';
  signIn.style.display = 'none';
  signOut.style.display = '';

  el('acctLicenseValue').textContent = status.licenseKey;
  licenseRow.style.display = '';

  const v = status.validation || {};
  el('acctTier').textContent = v.tier ? `Tier: ${v.tier}` : 'Tier: ?';
  el('acctStatus').textContent = v.status ? `Status: ${v.status}` : 'Status: unknown';

  if (v.usage && v.usage.cap > 0) {
    el('acctUsageUsed').textContent = String(v.usage.used ?? 0);
    el('acctUsageCap').textContent  = String(v.usage.cap ?? 0);
    usageRow.style.display = '';
  } else {
    usageRow.style.display = 'none';
  }
}

el('acctSignInBtn')?.addEventListener('click', async () => {
  showAcctMessage('Opening browser for sign-in. After you complete sign-in, the website will hand the license key back to this app automatically.');
  await window.securityAPI.openAccountPage();
});

el('acctSignOutBtn')?.addEventListener('click', async () => {
  if (!confirm('Sign out of HZSec? Your subscription stays active — you can sign back in any time.')) return;
  await window.securityAPI.clearLicense();
  showAcctMessage('Signed out.', 'ok');
  await refreshAccountUI();
});

el('acctLicenseSaveBtn')?.addEventListener('click', async () => {
  const key = el('acctLicenseInput').value.trim().toUpperCase();
  if (!key) return showAcctMessage('Paste a license key first.', 'error');
  showAcctMessage('Validating with backend…');
  const res = await window.securityAPI.setLicense(key);
  if (!res.success) {
    showAcctMessage('Could not save: ' + (res.error || 'unknown error'), 'error');
    return;
  }
  el('acctLicenseInput').value = '';
  showAcctMessage('Saved + validated ✓', 'ok');
  await refreshAccountUI();
});

el('acctRevalidateBtn')?.addEventListener('click', async () => {
  showAcctMessage('Re-checking…');
  const res = await window.securityAPI.validateLicense();
  if (!res?.ok) {
    showAcctMessage('Re-check failed: ' + (res?.error || 'unknown'), 'error');
    return;
  }
  showAcctMessage('License is valid.', 'ok');
  await refreshAccountUI();
});

// Deep-link from website: hzsec://license/HZSEC-... arrives in main.js,
// which forwards it to us via this event.
window.securityAPI.onLicenseUpdated?.(async ({ licenseKey } = {}) => {
  setBanner('Signed in to HZSec ✓');
  showAcctMessage(`License linked: ${licenseKey}`, 'ok');
  await refreshAccountUI();
});

// ─── Intelligence merged into assistant context sidebar ───────────────────────

// Context sidebar tab switching
document.querySelectorAll('.ctx-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ctx-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-ctx');
    el('ctxTabFindings').style.display   = target === 'findings'   ? 'flex' : 'none';
    el('ctxTabBreaches').style.display   = target === 'breaches'   ? 'flex' : 'none';
    el('ctxTabCompliance').style.display = target === 'compliance' ? 'flex' : 'none';
  });
});

function renderCtxBreaches(cases = []) {
  if (!cases.length) {
    setCtx('ctxBreachList', 'ctxOverlayBreaches', `<div class="empty-state" style="font-size:12px">No matching breach cases for current findings.</div>`);
    return;
  }
  const html = cases.map(b => `
    <div class="ctx-breach-card" data-action="breach-to-chat" data-breach-title="${b.title.replace(/"/g,"&quot;")}">
      <div class="ctx-breach-title">${b.title}</div>
      <div class="ctx-breach-consequence">${b.consequence}</div>
      <div class="ctx-breach-tag">&#9200; ${b.timeToExploit}</div>
    </div>`).join('');
  setCtx('ctxBreachList', 'ctxOverlayBreaches', html);
}

function renderCtxCompliance(score) {
  if (!score) {
    setCtx('ctxComplianceList', 'ctxOverlayCompliance', `<div class="empty-state" style="font-size:12px">Run a scan to see compliance gaps.</div>`);
    return;
  }
  const fw = score.byFramework || {};
  const items = Object.entries(fw).map(([framework, data]) => {
    const failing = data.total - data.passing;
    const passing = failing === 0;
    return `<div class="ctx-compliance-item ${passing ? 'pass' : 'fail'}" data-action="compliance-to-chat" data-fw="${framework}">
      <div class="ctx-compliance-fw">${framework}</div>
      <div class="ctx-compliance-name">${failing > 0 ? `${failing} control(s) failing` : 'All controls passing'}</div>
      <div class="ctx-compliance-status" style="color:${passing ? 'var(--green)' : 'var(--red)'}">
        ${data.passing}/${data.total} passing &middot; ${data.score}%
      </div>
    </div>`;
  });
  const html = items.length ? items.join('') : `<div class="empty-state" style="font-size:12px">No compliance data yet.</div>`;
  setCtx('ctxComplianceList', 'ctxOverlayCompliance', html);
}

function updateComplianceStrip(score) {
  if (!score) return;
  el('complianceStrip').style.display = 'flex';
  const fw = score.byFramework || {};
  function setVal(id, val) {
    const e = el(id);
    if (!e) return;
    e.textContent = val + '%';
    e.style.color = val >= 70 ? 'var(--green)' : val >= 40 ? 'var(--yellow)' : 'var(--red)';
  }
  setVal('complianceOverall', score.overall);
  if (fw.OWASP) setVal('complianceOwasp', fw.OWASP.score);
  if (fw.CIS)   setVal('complianceCis',   fw.CIS.score);
  if (fw.SOC2)  setVal('complianceSoc2',  fw.SOC2.score);
}

async function loadKbStatus() {
  try {
    const result = await window.securityAPI.getKbStatus();
    if (!result.success) return;
    const s = result.status;
    const pill = el('kbStatusPill');
    if (!pill) return;
    if (s.mode === 'sqlite') {
      pill.textContent = `${(s.cveCount||0).toLocaleString()} CVEs · ${s.breachCaseCount||0} breach cases · Last sync: ${s.cisaLastSync ? new Date(s.cisaLastSync).toLocaleDateString() : 'Never'}`;
      pill.className = 'kb-status-text active';
    } else {
      pill.textContent = 'Lightweight mode — breach cases embedded, CVE sync unavailable';
      pill.className = 'kb-status-text';
    }
  } catch { /* non-fatal */ }
}

async function loadIntelligenceData(findings) {
  if (!findings || !findings.length) return;
  try {
    const breachResult = await window.securityAPI.getBreachCases(findings);
    if (breachResult.success) renderCtxBreaches(breachResult.cases);
    const compResult = await window.securityAPI.getComplianceScore(findings);
    if (compResult.success) {
      renderCtxCompliance(compResult.score);
      updateComplianceStrip(compResult.score);
    }
  } catch (err) {
    console.error('[Intelligence]', err.message);
  }
}

el('complianceDetailBtn').addEventListener('click', () => {
  AsstDrawer.open();
  el('chatInput').value = 'Give me a full compliance breakdown for my current scan. Which OWASP, CIS, and SOC 2 controls am I failing and what should I fix first?';
  el('chatInput').focus();
});

document.addEventListener('click', e => {
  const breachCard = e.target.closest('[data-action="breach-to-chat"]');
  if (breachCard) {
    const title = breachCard.getAttribute('data-breach-title') || '';
    AsstDrawer.open();
    el('chatInput').value = `Tell me more about the "${title}" breach and how it relates to my current findings. What should I fix first to avoid the same outcome?`;
    el('chatInput').focus();
  }
  const compCard = e.target.closest('[data-action="compliance-to-chat"]');
  if (compCard) {
    const fw = compCard.getAttribute('data-fw');
    AsstDrawer.open();
    el('chatInput').value = `Which specific ${fw} controls am I failing based on my current scan, and what is the fastest path to fixing them?`;
    el('chatInput').focus();
  }
});

el('syncKbBtn').addEventListener('click', async () => {
  el('syncKbBtn').textContent = 'Syncing...';
  el('syncKbBtn').disabled = true;
  const result = await window.securityAPI.syncKb();
  el('syncKbBtn').textContent = '\u21bb Sync CVE feeds';
  el('syncKbBtn').disabled = false;
  if (result.success) {
    setBanner(`KB synced \u2014 CISA: ${result.cisaCount} entries, NVD: ${result.nvdCount} entries`);
    await loadKbStatus();
  } else {
    setBanner('KB sync failed: ' + (result.error || 'Network error'));
  }
});

// ─── Audit log ────────────────────────────────────────────────────────────────
const ACTION_CLASS = { 'scan-completed':'action-scan','fix-applied':'action-fix','agent-fix-applied':'action-agent-fix','agent-fix-rejected':'action-agent-fix','monitor-started':'action-monitor','monitor-stopped':'action-monitor','monitor-alert':'action-alert','api-key-saved':'action-key','api-key-cleared':'action-key','export-completed':'action-other','audit-log-cleared':'action-other','history-cleared':'action-other' };
const ACTION_LABEL = { 'scan-completed':'SCAN','fix-applied':'FIX','agent-fix-applied':'AGENT FIX','agent-fix-rejected':'REJECTED','monitor-started':'MON START','monitor-stopped':'MON STOP','monitor-alert':'ALERT','api-key-saved':'KEY SAVED','api-key-cleared':'KEY CLEARED','export-completed':'EXPORT','audit-log-cleared':'LOG CLEARED','history-cleared':'HIST CLEAR' };

function filterMatches(entry, filter) {
  if (filter === 'all') return true;
  if (filter === 'scan') return entry.action === 'scan-completed';
  if (filter === 'fix') return entry.action.includes('fix');
  if (filter === 'monitor') return entry.action.includes('monitor');
  if (filter === 'key') return entry.action.includes('api-key');
  return true;
}

function renderAuditLog(entries) {
  const filtered = entries.filter(e => filterMatches(e, activeFilter));
  el('auditCount').textContent = `${filtered.length} of ${entries.length} entries`;
  el('auditTotal').textContent   = entries.length;
  el('auditScans').textContent   = entries.filter(e => e.action === 'scan-completed').length;
  el('auditFixes').textContent   = entries.filter(e => e.action === 'fix-applied' || e.action === 'agent-fix-applied').length;
  el('auditAlerts').textContent  = entries.filter(e => e.action === 'monitor-alert').length;

  if (!filtered.length) {
    el('auditEntries').innerHTML = `<div class="audit-empty"><div class="audit-empty-icon">📋</div><span>${entries.length ? 'No entries match this filter.' : 'No events yet. Run a scan to start logging.'}</span></div>`;
    return;
  }

  el('auditEntries').innerHTML = filtered.map(entry => {
    const cls    = ACTION_CLASS[entry.action] || 'action-other';
    const label  = ACTION_LABEL[entry.action] || entry.action.toUpperCase();
    const target = (entry.target||'').split('/').slice(-2).join('/');
    return `<div class="audit-entry ${cls}"><span class="audit-ts">${timeDisplay(entry.ts)}</span><span class="audit-action-badge">${esc(label)}</span><span class="audit-detail">${esc(entry.detail||'')}</span><span class="audit-target" title="${esc(entry.target||'')}">${esc(target)}</span></div>`;
  }).join('');
}

async function loadAuditLog() {
  const result = await window.securityAPI.getAuditLog(300);
  if (!result.success) return;
  allAuditEntries = result.entries;
  renderAuditLog(allAuditEntries);
}

document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    activeFilter = chip.getAttribute('data-filter');
    renderAuditLog(allAuditEntries);
  });
});

el('refreshAuditBtn').addEventListener('click', loadAuditLog);
el('exportAuditBtn').addEventListener('click', async () => {
  if (!allAuditEntries.length) { setBanner('No audit entries to export.'); return; }
  await window.securityAPI.exportReport({ exportedAt: new Date().toISOString(), entries: allAuditEntries });
});
el('clearAuditBtn').addEventListener('click', async () => {
  if (!confirm('Clear the entire audit log?')) return;
  await window.securityAPI.clearAuditLog();
  await loadAuditLog();
  setBanner('Audit log cleared.');
});

// ─── Settings ────────────────────────────────────────────────────────────────
el('themeSelect').addEventListener('change', () => applyTheme(el('themeSelect').value));
el('postureViewSelect').addEventListener('change', () => setPostureView(el('postureViewSelect').value));

el('highSensitivityToggle').addEventListener('change', () => {
  settings.highSensitivity = el('highSensitivityToggle').checked;
  window.securityAPI.savePrefs({ highSensitivity: settings.highSensitivity });
});

el('autoScanToggle').addEventListener('change', () => {
  settings.autoScan = el('autoScanToggle').checked;
  window.securityAPI.savePrefs({ autoScan: settings.autoScan });
});

el('clearHistorySettingsBtn').addEventListener('click', async () => {
  if (!confirm('Reset score history?')) return;
  await window.securityAPI.clearHistory();
  el('historyChart').style.display = 'none';
  el('historyMeta').style.display = 'none';
  el('clearHistoryBtn').style.display = 'none';
  el('scoreHistoryEmpty').style.display = 'block';
  el('scoreHistoryEmpty').textContent = 'History cleared.';
  setBanner('Score history reset.');
});

// ─── Onboarding ───────────────────────────────────────────────────────────────
let obTarget = null;

async function initApp() {
  const { prefs } = await window.securityAPI.getPrefs();

  // Apply saved preferences
  if (prefs.theme) applyTheme(prefs.theme);
  if (prefs.postureView) setPostureView(prefs.postureView);
  if (prefs.highSensitivity) { settings.highSensitivity = true; el('highSensitivityToggle').checked = true; }
  if (prefs.autoScan)        { settings.autoScan = true;        el('autoScanToggle').checked = true; }

  // Init assistant drawer (restore last open state if user had it open)
  AsstDrawer.init(prefs.asstDrawerState);

  const { hasKey } = await window.securityAPI.getApiKeyStatus();
  if (hasKey) {
    apiKeySet = true;
    el('apiKeyStatus').textContent = 'Loaded from secure storage ✓';
    el('apiKeyStatus').className = 'api-status set';
  }

  // Populate the Settings → Account section. Catches its own errors so a
  // backend outage doesn't block the rest of initApp.
  try { await refreshAccountUI(); }
  catch (err) { console.warn('[account] initial refresh failed:', err.message); }

  if (!prefs.onboardingComplete) {
    el('onboardingOverlay').classList.remove('hidden');
    showObPane(0);
  }

  loadScoreHistory();
  loadKbStatus();
}

// ─── Onboarding (Phase 3 — 8-slide slideshow) ───────────────────────────────

const OB_TOTAL = 8;
let obCurrent = 0;
let obFurthest = 0;       // highest slide ever reached this session — gates back-jump

function showObPane(step) {
  if (typeof step !== 'number' || step < 0 || step >= OB_TOTAL) return;
  obCurrent = step;
  if (step > obFurthest) obFurthest = step;

  for (let i = 0; i < OB_TOTAL; i++) {
    const pane = el('obPane' + i);
    if (pane) pane.style.display = (i === step) ? 'block' : 'none';
    const dot = el('obStep' + i);
    if (!dot) continue;
    dot.className = 'ob-step' +
      (i === step ? ' active' :
       i  <  obFurthest ? ' done' :
       i === obFurthest ? ' done' : '');
  }

  // Re-trigger the fade animation on the now-visible pane.
  const visible = el('obPane' + step);
  if (visible) {
    visible.classList.remove('ob-anim');
    // Force reflow so the next class add restarts the animation.
    void visible.offsetWidth;
    visible.classList.add('ob-anim');
  }

  // Per-slide hooks — called when entering each slide.
  if (step === 6) refreshOnboardingAccountSlide();
}

function finishOnboarding() {
  el('onboardingOverlay').classList.add('hidden');
  window.securityAPI.savePrefs({ onboardingComplete: true });
  if (obTarget) {
    selectedTarget = obTarget;
    el('targetDisplay').textContent = obTarget;
    el('targetDisplay').classList.add('has');
  }
}

function startOnboarding() {
  obCurrent = 0;
  obFurthest = 0;
  el('onboardingOverlay').classList.remove('hidden');
  showObPane(0);
}
window.startOnboarding = startOnboarding;   // exposed for the Settings → "Show welcome tour" button

// Slide 6: render the right account branch based on whether a license is set.
async function refreshOnboardingAccountSlide() {
  try {
    const status = await window.securityAPI.getLicenseStatus();
    const signed = el('obAcctSignedIn');
    const choose = el('obAcctChoose');
    if (!signed || !choose) return;
    if (status?.hasLicense) {
      signed.style.display = 'block';
      choose.style.display = 'none';
      const lic = el('obAcctLicense');
      if (lic) lic.textContent = status.licenseKey || '';
    } else {
      signed.style.display = 'none';
      choose.style.display = 'block';
    }
  } catch (err) {
    console.warn('[ob] account refresh failed:', err.message);
  }
}

// ── Wiring ──────────────────────────────────────────────────────────────────
// Persistent skip in the corner — visible on every slide.
el('obSkipCornerBtn')?.addEventListener('click', finishOnboarding);

// Forward navigation buttons — one per slide, named obNext0..obNext6 + obFinish.
el('obNext0')?.addEventListener('click', () => showObPane(1));
el('obNext1')?.addEventListener('click', () => showObPane(2));
el('obNext2')?.addEventListener('click', () => showObPane(3));
el('obNext3')?.addEventListener('click', () => showObPane(4));
el('obNext4')?.addEventListener('click', () => showObPane(5));
el('obNext5')?.addEventListener('click', () => showObPane(6));
el('obNext6')?.addEventListener('click', () => showObPane(7));
el('obFinish')?.addEventListener('click', finishOnboarding);

// Back buttons — each carries data-back-to so we don't repeat ourselves.
document.querySelectorAll('#onboardingOverlay .ob-back').forEach(btn => {
  btn.addEventListener('click', () => {
    const to = parseInt(btn.getAttribute('data-back-to') || '0', 10);
    showObPane(isNaN(to) ? 0 : to);
  });
});

// Progress dots — clickable for any slide already reached.
document.querySelectorAll('#onboardingOverlay .ob-step').forEach(dot => {
  dot.addEventListener('click', () => {
    const to = parseInt(dot.getAttribute('data-step') || '0', 10);
    if (isNaN(to)) return;
    if (to <= obFurthest) showObPane(to);
  });
});

// Slide 2 — pick scan target.
el('obSelectFolder')?.addEventListener('click', async () => {
  const f = await window.securityAPI.selectFolder();
  if (!f) return;
  obTarget = f;
  el('obTargetDisplay').textContent = f;
  el('obTargetDisplay').className = 'ob-target-display has';
  el('obNext2').disabled = false;
});

el('obSelectFile')?.addEventListener('click', async () => {
  const f = await window.securityAPI.selectFile();
  if (!f) return;
  obTarget = f;
  el('obTargetDisplay').textContent = f;
  el('obTargetDisplay').className = 'ob-target-display has';
  el('obNext2').disabled = false;
});

// Slide 3 — quick scan, live count.
el('obRunScan')?.addEventListener('click', async () => {
  if (!obTarget) {
    el('obScanStatus').textContent = 'Pick a target on the previous slide first.';
    return;
  }
  el('obScanStatus').textContent = 'Scanning…';
  el('obRunScan').disabled = true;
  const result = await window.securityAPI.runScan(obTarget, { mode: 'full' });
  el('obRunScan').disabled = false;
  if (!result.success) { el('obScanStatus').textContent = result.error || 'Scan failed.'; return; }
  lastReport = result.data;
  renderScanResults(result.data);
  updateCtxFindings(result.data.findings);
  const n = result.data.findings.length;
  el('obScanStatus').textContent = n === 0 ? 'Clean. Nothing detected.' : 'Scan complete.';
  el('obScanCount').style.display = '';
  el('obScanCountNum').textContent = String(n);
  el('obNext3').disabled = false;
});

// Slide 6 — Sign in (delegates to the same IPC the Settings → Account button uses).
el('obAcctSignInBtn')?.addEventListener('click', async () => {
  await window.securityAPI.openAccountPage();
  el('obAcctSignedIn').style.display = 'block';
  el('obAcctChoose').style.display   = 'none';
});

// Slide 6 — BYO key save (preserves the existing Anthropic-key flow).
el('obSaveKey')?.addEventListener('click', async () => {
  const key = el('obApiKey').value.trim();
  if (!key) return;
  await window.securityAPI.setApiKey(key);
  apiKeySet = true;
  el('obKeyStatus').textContent = 'Saved ✓';
  el('obKeyStatus').className = 'api-status set';
  el('apiKeyStatus').textContent = 'Loaded from secure storage ✓';
  el('apiKeyStatus').className = 'api-status set';
});

// If a deep-link license arrives while the onboarding is open, refresh slide 6.
window.securityAPI.onLicenseUpdated?.(() => {
  if (!el('onboardingOverlay').classList.contains('hidden')) {
    refreshOnboardingAccountSlide();
  }
});

// ─── What's new — changelog popup ──────────────────────────────────────────
//
// The most recent entry's `version` is matched against `prefs.lastSeenVersion`.
// Mismatch (or absent) → show the popup once, then mark seen. Order is
// most-recent first.

const CHANGELOG = [
  {
    version: '1.1.0',
    date:    'Phase 3 release',
    summary: [
      'New 8-slide welcome tour. Re-open it from Settings → Help & tour.',
      'Sign in to HZSec from Settings → Account to use the managed assistant — no Anthropic key required.',
      'Floating chat bubble shows a ⌘J reminder on hover.',
      'Scan Center has a friendlier empty-state when no scan has run yet.'
    ]
  },
  {
    version: '1.0.0',
    date:    'Initial release',
    summary: [
      'Local security scanner with the assistant, live monitor, and Breach Library.'
    ]
  }
];

function openChangelog(entry = CHANGELOG[0]) {
  if (!entry) return;
  el('changelogVersion').textContent = 'v' + entry.version;
  el('changelogDate').textContent    = entry.date || '';
  el('changelogBody').innerHTML = '<ul class="diff-message" style="padding-left:18px;line-height:1.7">' +
    entry.summary.map(s => `<li>${esc(s)}</li>`).join('') +
    '</ul>';
  el('changelogModal').classList.remove('hidden');
}

function closeChangelog() {
  el('changelogModal').classList.add('hidden');
  // Mark the latest version as seen so we don't pop again until next bump.
  window.securityAPI.savePrefs({ lastSeenVersion: CHANGELOG[0].version });
}

el('changelogClose')?.addEventListener('click',   closeChangelog);
el('changelogDismiss')?.addEventListener('click', closeChangelog);
el('showChangelogBtn')?.addEventListener('click', () => openChangelog(CHANGELOG[0]));
el('restartTourBtn')?.addEventListener('click',   () => startOnboarding());

// On boot — show the changelog popup once after a version bump. Skipped if
// the user is going through onboarding (they'll see the new bits anyway).
async function maybeShowChangelogOnBoot() {
  try {
    const { prefs } = await window.securityAPI.getPrefs();
    const latest = CHANGELOG[0]?.version;
    if (!latest) return;
    if (prefs?.onboardingComplete && prefs?.lastSeenVersion !== latest) {
      // Wait a tick so the rest of the UI settles before we pop.
      setTimeout(() => openChangelog(CHANGELOG[0]), 500);
    }
  } catch { /* non-fatal */ }
}

// ─── Auto-update prompt ─────────────────────────────────────────────────────
//
// The actual download is handled in main.js via electron-updater. We just
// listen for the lifecycle events and pop the modal when a new version is
// fully downloaded and ready to install.

(function wireUpdater() {
  const api = window.securityAPI;
  if (!api?.onUpdaterDownloaded) return;

  function showUpdateModal({ version, releaseNotes }) {
    el('updateVersion').textContent = version ? 'v' + version : '';
    if (releaseNotes && typeof releaseNotes === 'string') {
      // Plain text only — release notes from GitHub are HTML and we don't
      // want to inject them blindly into the DOM.
      el('updateNotes').textContent = releaseNotes.replace(/<[^>]+>/g, '').slice(0, 800);
    }
    el('updateModal').classList.remove('hidden');
  }
  function closeUpdateModal() { el('updateModal').classList.add('hidden'); }

  api.onUpdaterDownloaded(showUpdateModal);

  // Status / progress events are ignored in v1 — we keep the UI quiet until
  // the update is actually ready. When we add a Settings → Updates section
  // these are where the progress bar would hook in.
  api.onUpdaterStatus?.(() => {});
  api.onUpdaterProgress?.(() => {});

  el('updateClose')?.addEventListener('click',  closeUpdateModal);
  el('updateLater')?.addEventListener('click',  closeUpdateModal);
  el('updateInstall')?.addEventListener('click', async () => {
    closeUpdateModal();
    try { await api.updaterInstall(); }
    catch (err) { setBanner('Update failed: ' + err.message); }
  });
})();

// ─── Boot ─────────────────────────────────────────────────────────────────────
initApp();
maybeShowChangelogOnBoot();


// Save license button
document.getElementById('acctLicenseSaveBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('acctLicenseInput');
  const msg = document.getElementById('acctMessage');

  const key = input.value.trim();

  if (!key) {
    msg.textContent = 'Enter a license key';
    return;
  }

  msg.textContent = 'Saving...';

  try {
    await window.securityAPI.setLicense(key);
    const result = await window.securityAPI.validateLicense();

    if (result?.valid) {
      msg.textContent = `✅ License active (${result.tier})`;
    } else {
      msg.textContent = '❌ Invalid license';
    }
  } catch (err) {
    msg.textContent = '❌ Error saving license';
    console.error(err);
  }
});