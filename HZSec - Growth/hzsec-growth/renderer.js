// renderer.js - UI logic for HZSec Growth.
// Keeps rendering & event-wiring small by splitting per-tab.

const api = window.growthAPI;

// ---------- helpers ----------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function scoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-mid';
  return 'score-low';
}

function toast(msg, type = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => {
    el.className = 'toast';
  }, 2500);
}

function setStatus(text) {
  $('#status').textContent = text;
}

// ---------- tab routing ----------

$$('nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    $$('nav button').forEach((b) => b.classList.toggle('active', b === btn));
    $$('.panel').forEach((p) =>
      p.classList.toggle('active', p.id === `panel-${tab}`)
    );
    refreshTab(tab);
  });
});

async function refreshTab(tab) {
  switch (tab) {
    case 'opportunities':
      return renderOpportunities(await api.getCachedOpportunities());
    case 'drafts':
      return renderDrafts(await api.listDrafts());
    case 'emails':
      return renderEmails(await api.listEmails());
    case 'sent':
      return renderSent(await api.listSent());
    case 'keywords':
      return renderKeywords(await api.getKeywords());
    case 'settings':
      return loadSettings();
  }
}

// ---------- OPPORTUNITIES ----------

function renderOpportunities(list) {
  const host = $('#opps-list');
  if (!list || !list.length) {
    host.innerHTML = `<div class="empty">No opportunities yet. Click "Fetch opportunities" to pull posts from Reddit and Hacker News.</div>`;
    return;
  }
  host.innerHTML = list
    .map(
      (o) => `
      <div class="card" data-id="${escapeHtml(o.id)}">
        <div class="title">
          ${escapeHtml(o.title)}
          <span class="score-badge ${scoreClass(o.score)}">Score ${o.score}</span>
        </div>
        <div class="meta">
          <span class="platform-pill">${escapeHtml(o.platform)}${
            o.subreddit ? ' · r/' + escapeHtml(o.subreddit) : ''
          }</span>
          · ${o.score} points · ${o.comments} comments · ${timeAgo(o.createdAt)}
          <div class="reason">${escapeHtml(o.reason || '')}</div>
        </div>
        <div class="body">${escapeHtml(o.body || '').slice(0, 400)}</div>
        <div class="actions">
          <button class="btn primary" data-action="draft">Draft reply</button>
          <button class="btn" data-action="open">Open post</button>
          <button class="btn danger" data-action="dismiss">Dismiss</button>
        </div>
      </div>
    `
    )
    .join('');

  host.querySelectorAll('.card').forEach((card) => {
    const id = card.dataset.id;
    const o = list.find((x) => x.id === id);
    card.querySelector('[data-action="draft"]').addEventListener('click', () => draftFor(o));
    card.querySelector('[data-action="open"]').addEventListener('click', () => api.openExternalUrl(o.url));
    card.querySelector('[data-action="dismiss"]').addEventListener('click', async () => {
      await api.dismissOpportunity(o.id);
      card.remove();
      toast('Dismissed');
    });
  });
}

async function draftFor(opportunity) {
  try {
    setStatus('Drafting replies…');
    toast('Asking Claude for 3 reply options…');
    const draft = await api.generateDraft(opportunity);
    toast('Draft ready — check the Drafts tab', 'success');
    setStatus('Ready');
    // Switch to drafts tab
    $$('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'drafts'));
    $$('.panel').forEach((p) => p.classList.toggle('active', p.id === 'panel-drafts'));
    renderDrafts(await api.listDrafts());
  } catch (err) {
    toast(err.message || 'Draft failed', 'error');
    setStatus('Error');
  }
}

$('#refresh-opps').addEventListener('click', async () => {
  setStatus('Fetching opportunities…');
  $('#opps-status').textContent = 'Fetching…';
  try {
    const { opportunities, error } = await api.fetchOpportunities();
    if (error) {
      $('#opps-status').textContent = error;
      toast(error, 'error');
    } else {
      $('#opps-status').textContent = `Found ${opportunities.length} posts`;
      toast(`Found ${opportunities.length} posts`, 'success');
    }
    renderOpportunities(opportunities);
    setStatus('Ready');
  } catch (err) {
    $('#opps-status').textContent = err.message;
    toast(err.message, 'error');
    setStatus('Error');
  }
});

// ---------- DRAFTS ----------

function renderDrafts(drafts) {
  const host = $('#drafts-list');
  if (!drafts.length) {
    host.innerHTML = `<div class="empty">No drafts yet.</div>`;
    return;
  }
  host.innerHTML = drafts
    .slice()
    .reverse()
    .map(
      (d) => `
      <div class="card" data-draft-id="${escapeHtml(d.id)}">
        <div class="title">${escapeHtml(d.opportunityTitle || 'Untitled')}</div>
        <div class="meta">
          <a href="#" data-action="open">${escapeHtml(d.opportunityUrl || '')}</a>
          · ${timeAgo(d.createdAt)}
        </div>
        <div>
          ${(d.replies || [])
            .map(
              (r, i) => `
            <div class="reply-option">
              <div class="style-tag">${escapeHtml(r.style || `option ${i + 1}`)}</div>
              <div class="text-content">${escapeHtml(r.text || '')}</div>
              <div class="actions">
                <button class="btn primary" data-action="copy-open" data-index="${i}">Copy &amp; open post</button>
                <button class="btn" data-action="mark-sent" data-index="${i}">Mark as sent</button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="actions" style="margin-top:10px">
          <button class="btn danger" data-action="delete">Delete draft</button>
        </div>
      </div>
    `
    )
    .join('');

  host.querySelectorAll('.card').forEach((card) => {
    const id = card.dataset.draftId;
    const d = drafts.find((x) => x.id === id);
    card.querySelector('[data-action="open"]').addEventListener('click', (e) => {
      e.preventDefault();
      api.openExternalUrl(d.opportunityUrl);
    });
    card.querySelectorAll('[data-action="copy-open"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.dataset.index);
        const reply = d.replies[i];
        await api.copyAndOpen({ text: reply.text, url: d.opportunityUrl });
        toast('Reply copied. Paste it into the post.', 'success');
      });
    });
    card.querySelectorAll('[data-action="mark-sent"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.dataset.index);
        const reply = d.replies[i];
        await api.logSent({
          opportunityId: d.opportunityId,
          opportunityTitle: d.opportunityTitle,
          platform: d.opportunityUrl?.includes('reddit') ? 'reddit'
            : d.opportunityUrl?.includes('ycombinator') ? 'hackernews'
            : 'manual',
          url: d.opportunityUrl,
          reply: reply.text,
          channel: 'reply',
        });
        toast('Logged in Sent Log', 'success');
      });
    });
    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      await api.deleteDraft(d.id);
      card.remove();
    });
  });
}

// ---------- EMAIL LIST ----------

function renderEmails(emails) {
  const host = $('#emails-list');
  if (!emails.length) {
    host.innerHTML = `<div class="empty">No emails yet. Add one above.</div>`;
    return;
  }
  host.innerHTML = `
    <table>
      <thead>
        <tr><th>Email</th><th>Name</th><th>Status</th><th>Added</th><th></th></tr>
      </thead>
      <tbody>
        ${emails
          .map(
            (e) => `
          <tr data-email="${escapeHtml(e.email)}">
            <td>${escapeHtml(e.email)}</td>
            <td>${escapeHtml(e.name || '')}</td>
            <td>
              <span class="platform-pill">${escapeHtml(e.status)}</span>
              ${e.sentAt ? `<span class="reason"> · ${timeAgo(e.sentAt)}</span>` : ''}
            </td>
            <td>${timeAgo(e.addedAt)}</td>
            <td style="text-align:right">
              <button class="btn primary" data-action="send">Send welcome</button>
              <button class="btn danger" data-action="remove">Remove</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
  host.querySelectorAll('tr[data-email]').forEach((row) => {
    const email = row.dataset.email;
    row.querySelector('[data-action="send"]').addEventListener('click', async () => {
      try {
        await api.sendWelcomeEmail(email);
        toast(`Welcome email sent to ${email}`, 'success');
        renderEmails(await api.listEmails());
      } catch (err) {
        toast(err.message || 'Send failed', 'error');
      }
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', async () => {
      await api.removeEmail(email);
      renderEmails(await api.listEmails());
    });
  });
}

$('#add-email').addEventListener('click', async () => {
  const email = $('#email-input').value.trim();
  const name = $('#email-name-input').value.trim();
  if (!email) return;
  try {
    await api.addEmail({ email, name });
    $('#email-input').value = '';
    $('#email-name-input').value = '';
    renderEmails(await api.listEmails());
  } catch (err) {
    toast(err.message, 'error');
  }
});

// ---------- SENT LOG ----------

function renderSent(sent) {
  const host = $('#sent-list');
  if (!sent.length) {
    host.innerHTML = `<div class="empty">Nothing sent yet.</div>`;
    return;
  }
  host.innerHTML = `
    <table>
      <thead>
        <tr><th>When</th><th>Channel</th><th>Target</th><th>Content</th></tr>
      </thead>
      <tbody>
        ${sent
          .map(
            (s) => `
          <tr>
            <td>${timeAgo(s.sentAt)}</td>
            <td><span class="platform-pill">${escapeHtml(s.channel)} / ${escapeHtml(s.platform)}</span></td>
            <td>${escapeHtml(s.recipient || s.opportunityTitle || s.url || '')}</td>
            <td><div class="body" style="max-height:60px">${escapeHtml((s.reply || '').slice(0, 200))}</div></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

// ---------- KEYWORDS ----------

function renderKeywords(keywords) {
  const host = $('#keywords-list');
  if (!keywords.length) {
    host.innerHTML = `<div class="empty">No keywords yet. Add one above.</div>`;
    return;
  }
  host.innerHTML = keywords
    .map(
      (k) => `
      <span class="tag">${escapeHtml(k)}<button data-keyword="${escapeHtml(k)}">&times;</button></span>
    `
    )
    .join('');
  host.querySelectorAll('button[data-keyword]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await api.removeKeyword(btn.dataset.keyword);
      renderKeywords(await api.getKeywords());
    });
  });
}

$('#add-keyword').addEventListener('click', async () => {
  const val = $('#keyword-input').value.trim();
  if (!val) return;
  await api.addKeyword(val);
  $('#keyword-input').value = '';
  renderKeywords(await api.getKeywords());
});

$('#keyword-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#add-keyword').click();
});

// ---------- SETTINGS ----------

async function loadSettings() {
  const s = await api.getSettings();
  $('#anthropic-key').value = s.anthropicApiKey || '';
  $('#anthropic-model').value = s.anthropicModel || 'claude-sonnet-4-5';
  $('#resend-key').value = s.resendApiKey || '';
  $('#resend-from').value = s.resendFromEmail || '';
  $('#resend-from-name').value = s.resendFromName || 'HZSec';
  $('#website-url').value = s.websiteUrl || '';
  $('#product-pitch').value = s.productPitch || '';
}

$('#save-settings').addEventListener('click', async () => {
  await api.updateSettings({
    anthropicApiKey: $('#anthropic-key').value.trim(),
    anthropicModel: $('#anthropic-model').value.trim() || 'claude-sonnet-4-5',
    resendApiKey: $('#resend-key').value.trim(),
    resendFromEmail: $('#resend-from').value.trim(),
    resendFromName: $('#resend-from-name').value.trim(),
    websiteUrl: $('#website-url').value.trim(),
    productPitch: $('#product-pitch').value.trim(),
  });
  toast('Settings saved', 'success');
});

// ---------- initial load ----------

(async () => {
  renderOpportunities(await api.getCachedOpportunities());
  renderKeywords(await api.getKeywords());
  await loadSettings();
})();
