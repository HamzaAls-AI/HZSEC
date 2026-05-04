// growth-handler.js - IPC handlers bridging the renderer to the growth engine + store.
const { ipcMain, shell, clipboard } = require('electron');
const store = require('../storage/growth-store');
const engine = require('./growth-engine');

function registerGrowthHandlers() {
  // --- Settings ---
  ipcMain.handle('settings:get', () => store.getSettings());
  ipcMain.handle('settings:update', (_e, patch) => store.updateSettings(patch));

  // --- Keywords ---
  ipcMain.handle('keywords:get', () => store.getKeywords());
  ipcMain.handle('keywords:set', (_e, list) => store.setKeywords(list));
  ipcMain.handle('keywords:add', (_e, k) => store.addKeyword(k));
  ipcMain.handle('keywords:remove', (_e, k) => store.removeKeyword(k));

  // --- Opportunities ---
  ipcMain.handle('opportunities:fetch', async () => {
    const keywords = store.getKeywords();
    if (!keywords.length) {
      return { opportunities: [], error: 'No keywords set. Add some in the Keywords tab.' };
    }
    const seenIds = store.getSeenIds();
    const dismissedIds = store.getDismissedIds();
    try {
      const opportunities = await engine.fetchOpportunities({
        keywords,
        seenIds,
        dismissedIds,
      });
      store.markSeen(opportunities.map((o) => o.id));
      store.setCachedOpportunities(opportunities);
      return { opportunities };
    } catch (err) {
      return {
        opportunities: store.getCachedOpportunities(),
        error: err.message || String(err),
      };
    }
  });

  ipcMain.handle('opportunities:cached', () => store.getCachedOpportunities());

  ipcMain.handle('opportunities:dismiss', (_e, id) => {
    return store.dismissOpportunity(id);
  });

  ipcMain.handle('opportunities:open', (_e, url) => {
    if (url) shell.openExternal(url);
  });

  // --- Drafts ---
  ipcMain.handle('drafts:generate', async (_e, opportunity) => {
    const settings = store.getSettings();
    const replies = await engine.draftReplies({ opportunity, settings });
    const draft = store.saveDraft({
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      opportunityUrl: opportunity.url,
      replies,
      selectedIndex: 0,
    });
    return draft;
  });

  ipcMain.handle('drafts:list', () => store.getDrafts());
  ipcMain.handle('drafts:delete', (_e, id) => store.deleteDraft(id));

  ipcMain.handle('drafts:copy-and-open', (_e, { text, url }) => {
    if (text) clipboard.writeText(text);
    if (url) shell.openExternal(url);
    return true;
  });

  // --- Sent log ---
  ipcMain.handle('sent:list', () => store.getSent());
  ipcMain.handle('sent:log', (_e, entry) => store.logSent(entry));
  ipcMain.handle('sent:update-outcome', (_e, { id, outcome }) => {
    return store.updateSentOutcome(id, outcome);
  });

  // --- Emails ---
  ipcMain.handle('emails:list', () => store.getEmails());
  ipcMain.handle('emails:add', (_e, entry) => store.addEmail(entry));
  ipcMain.handle('emails:remove', (_e, email) => store.removeEmail(email));

  ipcMain.handle('emails:send-welcome', async (_e, email) => {
    const settings = store.getSettings();
    const record = store
      .getEmails()
      .find((x) => x.email === String(email).toLowerCase());
    if (!record) throw new Error(`Email ${email} not found in list.`);
    try {
      const result = await engine.sendWelcomeEmail({
        to: record.email,
        name: record.name,
        settings,
      });
      store.markEmailSent(record.email, 'sent');
      store.logSent({
        channel: 'email',
        platform: 'resend',
        recipient: record.email,
        reply: `Welcome email to ${record.email}`,
        opportunityTitle: 'Welcome email',
      });
      return { ok: true, result };
    } catch (err) {
      store.markEmailSent(record.email, 'failed');
      throw err;
    }
  });
}

module.exports = { registerGrowthHandlers };
