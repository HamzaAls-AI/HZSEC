// POST /api/assistant/proxy
//
// The heart of the managed-key flow. The desktop app sends the same payload
// it would have sent to api.anthropic.com directly, plus its license key.
// We:
//   1. Validate the license (handled by middleware).
//   2. Check this month's usage against the tier cap.
//   3. Forward to Anthropic with our server-side key.
//   4. Meter tokens from the response.
//   5. Return the unmodified Anthropic response.
//
// Streaming is intentionally NOT supported in v1. The desktop app's current
// code path uses non-streaming responses; if/when we add SSE proxying, the
// metering math stays the same — sum input/output usage from the final event.

const express = require('express');
const { requireLicense } = require('../middleware/license');
const { summarize, capForTier, currentMonth } = require('../lib/usage');
const config = require('../lib/config');
const prisma = require('../lib/db');

const router = express.Router();

const ALLOWED_FIELDS = new Set([
  'model', 'messages', 'system', 'tools', 'tool_choice',
  'max_tokens', 'temperature', 'top_p', 'top_k', 'stop_sequences',
  'metadata'
]);

router.post('/proxy', requireLicense, async (req, res) => {
  const lic = req.license;
  const body = req.body || {};

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: 'missing messages' });
  }

  // ─── Cap check ───
  const cap = capForTier(lic.tier);
  let used = 0;
  try {
    const u = await prisma.usage.findUnique({
      where: { userId_month: { userId: lic.userId, month: currentMonth() } },
      select: { assistantMessages: true }
    });
    used = u?.assistantMessages || 0;
  } catch (err) {
    if (config.env === 'production') {
      console.error('[proxy] usage read failed:', err);
      return res.status(503).json({ error: 'db_unavailable' });
    }
  }
  if (cap > 0 && used >= cap) {
    return res.status(402).json({
      error: 'usage_cap_exceeded',
      reset_date: nextMonthIso(),
      usage: summarize({ tier: lic.tier, used })
    });
  }

  // ─── Build forward payload ───
  const forward = {};
  for (const k of Object.keys(body)) {
    if (ALLOWED_FIELDS.has(k)) forward[k] = body[k];
  }
  // Default to cheaper model for non-pro/economy tasks
  if (!forward.model) forward.model = 'claude-3-haiku-20240307'; 
  
  // Enforce max_tokens limit
  forward.max_tokens = Math.min(forward.max_tokens || 3000, 3000);


  // ─── Configured Anthropic key? ───
  if (!isRealKey(config.anthropic.apiKey)) {
    return res.status(503).json({
      error: 'proxy_not_configured',
      hint:  'set ANTHROPIC_API_KEY in backend env'
    });
  }

  // ─── Forward ───
  let anthropicRes;
  try {
    anthropicRes = await fetch(`${config.anthropic.apiBase}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         config.anthropic.apiKey,
        'anthropic-version': config.anthropic.apiVersion
      },
      body: JSON.stringify(forward)
    });
  } catch (err) {
    console.error('[proxy] upstream fetch failed:', err.message);
    return res.status(502).json({ error: 'upstream_unreachable' });
  }

  const text = await anthropicRes.text();
  let payload;
  try { payload = JSON.parse(text); }
  catch { payload = { error: { type: 'invalid_upstream_response', raw: text } }; }

  // Forward Anthropic's status code so the client sees rate-limit/auth errors
  // exactly as if it called Anthropic directly.
  if (!anthropicRes.ok) {
    return res.status(anthropicRes.status).json(payload);
  }

  // ─── Meter ───
  const inTok  = payload?.usage?.input_tokens  || 0;
  const outTok = payload?.usage?.output_tokens || 0;
  meter(lic.userId, inTok, outTok).catch(err =>
    console.warn('[proxy] meter write failed:', err.message)
  );

  res.status(anthropicRes.status).json(payload);
});

async function meter(userId, inTok, outTok) {
  const month = currentMonth();
  await prisma.usage.upsert({
    where:  { userId_month: { userId, month } },
    create: {
      userId, month,
      assistantMessages: 1,
      tokensIn:  inTok,
      tokensOut: outTok
    },
    update: {
      assistantMessages: { increment: 1 },
      tokensIn:          { increment: inTok },
      tokensOut:         { increment: outTok },
      lastUsedAt:        new Date()
    }
  });
}

function nextMonthIso() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString();
}

function isRealKey(k) {
  if (typeof k !== 'string' || !k.startsWith('sk-ant-')) return false;
  if (k.includes('PLACEHOLDER') || k.includes('REPLACE_ME')) return false;
  if (k.length < 30) return false;
  return true;
}

module.exports = router;
