// Vercel serverless function: POST /api/waitlist
// Receives { email } from the marketing site and emails a notification
// via Resend using a server-side API key.
//
// Env var required (set in Vercel dashboard, not in code):
//   RESEND_API_KEY  — your NEW Resend API key (the leaked one must be revoked)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FROM_ADDRESS = 'HZSec <hello@hzsec.io>';
const TO_ADDRESS   = 'hamzaalhussaini44@gmail.com';

// In-memory rate limit (per warm function instance). Crude but cheap.
const recent = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimited(ip) {
  const now = Date.now();
  const arr = (recent.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  arr.push(now);
  recent.set(ip, arr);
  return arr.length > RATE_MAX;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default async function handler(req, res) {
  // CORS — only your own domain hits this, but keep it tight
  res.setHeader('Access-Control-Allow-Origin', 'https://hzsec.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY env var missing');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const email = (body?.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: TO_ADDRESS,
        subject: `New waitlist signup: ${email}`,
        html: `
          <h2>New HZSec waitlist signup</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
          <p><strong>UA:</strong> ${escapeHtml(req.headers['user-agent'] || 'unknown')}</p>
        `,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('Resend error', r.status, text);
      return res.status(502).json({ error: 'Email provider failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('waitlist handler crashed', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
