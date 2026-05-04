// growth-store.js - Persistent storage for HZSec Growth
// Stores settings (API keys), keywords, seen opportunities, drafts,
// sent history, and the email list. Uses electron-store when available,
// falls back to an in-memory store so the engine can be unit tested.

let Store;
try {
  Store = require('electron-store');
} catch (err) {
  Store = null;
}

function createMemoryStore() {
  const data = new Map();
  return {
    get: (key, defaultValue) => (data.has(key) ? data.get(key) : defaultValue),
    set: (key, value) => data.set(key, value),
  };
}

const store = Store ? new Store({ name: 'hzsec-growth' }) : createMemoryStore();

const DEFAULT_KEYWORDS = [
  'exposed API key',
  'leaked credentials',
  'hardcoded password',
  'secrets in git',
  'insecure config',
  'security scanner',
  'dev security tool',
  'OWASP compliance',
  'scan for vulnerabilities',
  'AWS key leaked',
];

// ---------- Settings ----------

function getSettings() {
  return store.get('settings', {
    anthropicApiKey: '',
    anthropicModel: 'claude-sonnet-4-5',
    resendApiKey: '',
    resendFromEmail: '',
    resendFromName: 'HZSec',
    websiteUrl: 'https://hzsec.io',
    productPitch:
      'HZSec is a lightweight security scanner that catches exposed API keys, leaked credentials, and insecure configs before they ship.',
  });
}

function updateSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  store.set('settings', next);
  return next;
}

// ---------- Keywords ----------

function getKeywords() {
  return store.get('keywords', DEFAULT_KEYWORDS);
}

function setKeywords(keywords) {
  const clean = (keywords || [])
    .map((k) => String(k).trim())
    .filter(Boolean);
  store.set('keywords', clean);
  return clean;
}

function addKeyword(keyword) {
  const k = String(keyword || '').trim();
  if (!k) return getKeywords();
  const current = getKeywords();
  if (current.includes(k)) return current;
  const next = [...current, k];
  store.set('keywords', next);
  return next;
}

function removeKeyword(keyword) {
  const next = getKeywords().filter((k) => k !== keyword);
  store.set('keywords', next);
  return next;
}

// ---------- Opportunities (seen / dismissed) ----------

function getSeenIds() {
  return new Set(store.get('seenIds', []));
}

function markSeen(ids) {
  const set = getSeenIds();
  ids.forEach((id) => set.add(id));
  store.set('seenIds', [...set]);
}

function getDismissedIds() {
  return new Set(store.get('dismissedIds', []));
}

function dismissOpportunity(id) {
  const set = getDismissedIds();
  set.add(id);
  store.set('dismissedIds', [...set]);
  return [...set];
}

function getCachedOpportunities() {
  return store.get('cachedOpportunities', []);
}

function setCachedOpportunities(list) {
  store.set('cachedOpportunities', list || []);
  return list;
}

// ---------- Drafts ----------

function getDrafts() {
  return store.get('drafts', []);
}

function saveDraft(draft) {
  const drafts = getDrafts();
  const entry = {
    id: draft.id || `d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    opportunityId: draft.opportunityId,
    opportunityTitle: draft.opportunityTitle,
    opportunityUrl: draft.opportunityUrl,
    replies: draft.replies,
    selectedIndex: draft.selectedIndex ?? 0,
    createdAt: draft.createdAt || new Date().toISOString(),
  };
  drafts.push(entry);
  store.set('drafts', drafts);
  return entry;
}

function deleteDraft(id) {
  const next = getDrafts().filter((d) => d.id !== id);
  store.set('drafts', next);
  return next;
}

// ---------- Sent log ----------

function getSent() {
  return store.get('sent', []);
}

function logSent(entry) {
  const sent = getSent();
  const record = {
    id: entry.id || `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    opportunityId: entry.opportunityId || null,
    opportunityTitle: entry.opportunityTitle || '',
    platform: entry.platform || 'manual',
    url: entry.url || '',
    reply: entry.reply || '',
    channel: entry.channel || 'reply', // 'reply' | 'email'
    recipient: entry.recipient || null,
    sentAt: entry.sentAt || new Date().toISOString(),
    outcome: entry.outcome || null,
  };
  sent.unshift(record);
  store.set('sent', sent);
  return record;
}

function updateSentOutcome(id, outcome) {
  const sent = getSent();
  const idx = sent.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  sent[idx] = { ...sent[idx], outcome };
  store.set('sent', sent);
  return sent[idx];
}

// ---------- Email list ----------

function getEmails() {
  return store.get('emails', []);
}

function addEmail(entry) {
  const e = String(entry.email || '').trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    throw new Error(`Invalid email: ${entry.email}`);
  }
  const emails = getEmails();
  if (emails.some((x) => x.email === e)) return emails;
  const record = {
    email: e,
    name: entry.name || '',
    addedAt: new Date().toISOString(),
    status: 'pending',
    sentAt: null,
  };
  emails.push(record);
  store.set('emails', emails);
  return emails;
}

function markEmailSent(email, status = 'sent') {
  const emails = getEmails();
  const idx = emails.findIndex((x) => x.email === email);
  if (idx === -1) return null;
  emails[idx] = {
    ...emails[idx],
    status,
    sentAt: new Date().toISOString(),
  };
  store.set('emails', emails);
  return emails[idx];
}

function removeEmail(email) {
  const next = getEmails().filter((x) => x.email !== email);
  store.set('emails', next);
  return next;
}

module.exports = {
  DEFAULT_KEYWORDS,
  getSettings,
  updateSettings,
  getKeywords,
  setKeywords,
  addKeyword,
  removeKeyword,
  getSeenIds,
  markSeen,
  getDismissedIds,
  dismissOpportunity,
  getCachedOpportunities,
  setCachedOpportunities,
  getDrafts,
  saveDraft,
  deleteDraft,
  getSent,
  logSent,
  updateSentOutcome,
  getEmails,
  addEmail,
  markEmailSent,
  removeEmail,
};
