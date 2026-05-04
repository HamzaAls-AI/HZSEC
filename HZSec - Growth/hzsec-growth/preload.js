// preload.js - Bridge between main and renderer processes.
// Exposes a safe growthAPI object on window for the renderer.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('growthAPI', {
  // settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (patch) => ipcRenderer.invoke('settings:update', patch),

  // keywords
  getKeywords: () => ipcRenderer.invoke('keywords:get'),
  setKeywords: (list) => ipcRenderer.invoke('keywords:set', list),
  addKeyword: (k) => ipcRenderer.invoke('keywords:add', k),
  removeKeyword: (k) => ipcRenderer.invoke('keywords:remove', k),

  // opportunities
  fetchOpportunities: () => ipcRenderer.invoke('opportunities:fetch'),
  getCachedOpportunities: () => ipcRenderer.invoke('opportunities:cached'),
  dismissOpportunity: (id) => ipcRenderer.invoke('opportunities:dismiss', id),
  openExternalUrl: (url) => ipcRenderer.invoke('opportunities:open', url),

  // drafts
  generateDraft: (opportunity) => ipcRenderer.invoke('drafts:generate', opportunity),
  listDrafts: () => ipcRenderer.invoke('drafts:list'),
  deleteDraft: (id) => ipcRenderer.invoke('drafts:delete', id),
  copyAndOpen: (payload) => ipcRenderer.invoke('drafts:copy-and-open', payload),

  // sent log
  listSent: () => ipcRenderer.invoke('sent:list'),
  logSent: (entry) => ipcRenderer.invoke('sent:log', entry),
  updateSentOutcome: (payload) => ipcRenderer.invoke('sent:update-outcome', payload),

  // emails
  listEmails: () => ipcRenderer.invoke('emails:list'),
  addEmail: (entry) => ipcRenderer.invoke('emails:add', entry),
  removeEmail: (email) => ipcRenderer.invoke('emails:remove', email),
  sendWelcomeEmail: (email) => ipcRenderer.invoke('emails:send-welcome', email),
});
