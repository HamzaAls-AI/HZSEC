// growth-engine.js
// Core growth logic for HZSec Growth:
//   - Fetch posts from Reddit and Hacker News for each keyword
//   - Score each post for relevance to HZSec
//   - Draft 3 reply options via the Anthropic API
//   - Send welcome emails via the Resend API
// All network calls happen in the main process (where this module is loaded).

const USER_AGENT = 'hzsec-growth/1.0 (private growth tool)';

// ---------- Fetchers ----------

async function fetchReddit(keyword, { limit = 25 } = {}) {
  const url =
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}` +
    `&sort=new&limit=${limit}&t=month`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const children = data?.data?.children || [];
    return children.map((c) => {
      const p = c.data || {};
      return {
        id: `reddit_${p.id}`,
        platform: 'reddit',
        title: p.title || '',
        body: p.selftext || '',
        url: p.permalink
          ? `https://www.reddit.com${p.permalink}`
          : p.url || '',
        author: p.author || '',
        subreddit: p.subreddit || '',
        score: p.score ?? 0,
        comments: p.num_comments ?? 0,
        createdAt: p.created_utc
          ? new Date(p.created_utc * 1000).toISOString()
          : new Date().toISOString(),
        keyword,
      };
    });
  } catch (err) {
    console.warn('[growth-engine] reddit fetch failed:', err.message);
    return [];
  }
}

async function fetchHackerNews(keyword, { limit = 25 } = {}) {
  const url =
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(
      keyword
    )}&tags=story&hitsPerPage=${limit}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.hits || [];
    return hits.map((h) => ({
      id: `hn_${h.objectID}`,
      platform: 'hackernews',
      title: h.title || h.story_title || '',
      body: h.story_text || h.comment_text || '',
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      author: h.author || '',
      subreddit: '',
      score: h.points ?? 0,
      comments: h.num_comments ?? 0,
      createdAt: h.created_at || new Date().toISOString(),
      keyword,
    }));
  } catch (err) {
    console.warn('[growth-engine] hn fetch failed:', err.message);
    return [];
  }
}

// ---------- Scoring ----------

// Keywords that strongly match HZSec's value prop get extra weight.
const HIGH_VALUE_TERMS = [
  'exposed',
  'leaked',
  'hardcoded',
  'secret',
  'api key',
  'credential',
  'token',
  '.env',
  'aws',
  'scanner',
  'vulnerability',
  'owasp',
  'misconfig',
  'insecure',
  'security tool',
];

function scoreOpportunity(post) {
  const text = `${post.title} ${post.body}`.toLowerCase();

  // Relevance: how many high-value terms appear
  let relevance = 0;
  for (const term of HIGH_VALUE_TERMS) {
    if (text.includes(term)) relevance += 10;
  }
  // Bonus for direct keyword match
  if (post.keyword && text.includes(post.keyword.toLowerCase())) {
    relevance += 15;
  }

  // Engagement: soft-bounded log scale so a 10k-point post doesn't swamp everything
  const engagement = Math.min(
    30,
    Math.round(Math.log10(1 + (post.score || 0)) * 8 +
      Math.log10(1 + (post.comments || 0)) * 6)
  );

  // Recency: 0-25 points, fresher posts score higher
  const ageHours =
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const recency =
    ageHours < 6 ? 25 : ageHours < 24 ? 20 : ageHours < 72 ? 14 : ageHours < 168 ? 8 : 3;

  // "Asking for help" intent: questions and problem statements convert better
  let intent = 0;
  if (/\?$/.test(post.title) || /\?/.test(post.title)) intent += 10;
  if (/\b(how|help|recommend|best|any|tool|fix|stuck)\b/i.test(post.title)) {
    intent += 8;
  }

  const total = Math.min(100, relevance + engagement + recency + intent);

  let reason = '';
  if (relevance >= 25) reason = 'Strong match for HZSec value prop';
  else if (relevance >= 10) reason = 'Related to security pain points';
  else reason = 'Keyword match';

  return { score: total, reason };
}

function rankOpportunities(posts, { seenIds = new Set(), dismissedIds = new Set() } = {}) {
  const deduped = new Map();
  for (const p of posts) {
    if (!p.id) continue;
    if (dismissedIds.has(p.id)) continue;
    if (!deduped.has(p.id)) deduped.set(p.id, p);
  }
  const scored = [...deduped.values()].map((p) => {
    const { score, reason } = scoreOpportunity(p);
    return { ...p, score, reason, isNew: !seenIds.has(p.id) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ---------- Orchestrator ----------

async function fetchOpportunities({ keywords, seenIds, dismissedIds }) {
  const tasks = [];
  for (const kw of keywords) {
    tasks.push(fetchReddit(kw));
    tasks.push(fetchHackerNews(kw));
  }
  const results = await Promise.all(tasks);
  const flat = results.flat();
  return rankOpportunities(flat, { seenIds, dismissedIds });
}

// ---------- Claude draft ----------

async function draftReplies({ opportunity, settings }) {
  if (!settings.anthropicApiKey) {
    throw new Error('Anthropic API key not set. Configure it in Settings.');
  }

  const system = `You are a growth assistant for HZSec, a security scanner.
Product pitch: ${settings.productPitch}
Website: ${settings.websiteUrl}

You draft authentic replies to posts on Reddit and Hacker News. You never sound like marketing. You never open with "Great question". You write like a developer who ran into the same problem. Mention the website only when it genuinely fits and always in a low-pressure way.

Output JSON only, matching this shape exactly:
{
  "replies": [
    { "style": "helpful",     "text": "..." },
    { "style": "soft_pitch",  "text": "..." },
    { "style": "direct_pitch","text": "..." }
  ]
}

helpful: purely useful, no link or product mention.
soft_pitch: useful first, then a natural "I built/use HZSec for this, link if curious".
direct_pitch: short, recommends HZSec by name with the link.

Each reply is 2-5 sentences, plain text, no markdown headers, no hashtags.`;

  const user = `Platform: ${opportunity.platform}
${opportunity.subreddit ? `Subreddit: r/${opportunity.subreddit}\n` : ''}Title: ${opportunity.title}
Body: ${opportunity.body || '(no body)'}

Draft 3 reply options as specified.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': settings.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.anthropicModel || 'claude-sonnet-4-5',
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || '';
  const parsed = extractJson(text);
  if (!parsed || !Array.isArray(parsed.replies)) {
    throw new Error('Could not parse reply JSON from Claude response.');
  }
  return parsed.replies;
}

function extractJson(text) {
  if (!text) return null;
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {}
  // Find first { ... last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ---------- Resend email ----------

async function sendWelcomeEmail({ to, name, settings }) {
  if (!settings.resendApiKey) {
    throw new Error('Resend API key not set. Configure it in Settings.');
  }
  if (!settings.resendFromEmail) {
    throw new Error('Resend "from" email not set. Configure it in Settings.');
  }

  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = `Welcome to HZSec, ${firstName}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:540px;margin:0 auto;color:#111;line-height:1.55">
      <h2 style="margin:0 0 16px">Welcome to HZSec</h2>
      <p>Hey ${escapeHtml(firstName)},</p>
      <p>${escapeHtml(settings.productPitch)}</p>
      <p>You're on the waitlist and I'll ping you the moment access opens up. If you have a specific security headache you want us to solve first, just reply to this email and tell me about it.</p>
      <p style="margin-top:24px">— ${escapeHtml(settings.resendFromName || 'HZSec')}<br/>
      <a href="${escapeAttr(settings.websiteUrl)}">${escapeHtml(settings.websiteUrl)}</a></p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: settings.resendFromName
        ? `${settings.resendFromName} <${settings.resendFromEmail}>`
        : settings.resendFromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error ${res.status}: ${errText}`);
  }
  return res.json();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

module.exports = {
  fetchReddit,
  fetchHackerNews,
  scoreOpportunity,
  rankOpportunities,
  fetchOpportunities,
  draftReplies,
  sendWelcomeEmail,
};
