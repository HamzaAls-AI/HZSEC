// Transactional email via Resend.
// All sends are best-effort — failures are logged but never crash the caller.
// Set RESEND_API_KEY in Railway env vars to activate. If unset, sends are
// skipped with a warning so local dev works without an email account.

const { Resend } = require('resend');
const config = require('./config');

let _client = null;
function client() {
  if (!_client) _client = new Resend(config.resend.apiKey);
  return _client;
}

async function send({ to, subject, html }) {
  if (!config.resend.apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping "%s" to %s', subject, to);
    return;
  }
  try {
    await client().emails.send({ from: config.resend.from, to, subject, html });
  } catch (err) {
    console.error('[email] send failed (%s):', subject, err.message);
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

async function trialStarted({ to, licenseKey, trialEndsAt, tier }) {
  const label   = tier === 'team' ? 'Team' : 'Pro';
  const endDate = fmt(trialEndsAt);
  const deepLink = `${config.webOrigin}/welcome`;
  return send({
    to,
    subject: `Your HZSec ${label} trial is active`,
    html: layout({
      title: `Your 7-day ${label} trial has started.`,
      body: `
        <p>Welcome to HZSec ${label}. Paste your license key into <strong>HZSec → Settings → License</strong> to unlock all Pro features.</p>
        <div style="background:#f4f4f5;border-radius:8px;padding:16px 20px;margin:24px 0;font-family:monospace;font-size:16px;letter-spacing:1px;text-align:center;color:#18181b;">
          ${licenseKey}
        </div>
        <p style="font-size:14px;color:#71717a;">No charge until <strong style="color:#18181b;">${endDate}</strong>. Cancel any time before then from your billing dashboard.</p>
      `,
      cta:          { label: 'Get started', url: deepLink },
      ctaSecondary: { label: 'View dashboard', url: `${config.webOrigin}/dashboard` }
    })
  });
}

async function trialEnding({ to, trialEndsAt, tier }) {
  const label   = tier === 'team' ? 'Team' : 'Pro';
  const price   = tier === 'team' ? '$49/mo' : '$19/mo';
  const endDate = fmt(trialEndsAt);
  return send({
    to,
    subject: 'Your HZSec trial ends in 3 days',
    html: layout({
      title: 'Your trial ends in 3 days.',
      body: `
        <p>Your HZSec ${label} trial ends on <strong>${endDate}</strong>. After that your subscription continues at <strong>${price}</strong> and you keep all Pro features.</p>
        <p style="font-size:14px;color:#71717a;">Want to cancel before the trial ends? You can do so from your billing dashboard — no questions asked.</p>
      `,
      cta: { label: 'Manage subscription', url: `${config.webOrigin}/dashboard/billing` }
    })
  });
}

async function paymentFailed({ to }) {
  return send({
    to,
    subject: 'Action needed: HZSec payment failed',
    html: layout({
      title: "We couldn't process your payment.",
      body: `
        <p>Your HZSec subscription payment failed. Please update your payment method to keep Pro features active.</p>
        <p style="font-size:14px;color:#71717a;">We'll retry automatically. Your access continues during the grace period.</p>
      `,
      cta: { label: 'Update payment method', url: `${config.webOrigin}/dashboard/billing` }
    })
  });
}

async function subscriptionCancelled({ to, currentPeriodEnd }) {
  const accessUntil = currentPeriodEnd ? fmt(currentPeriodEnd) : null;
  return send({
    to,
    subject: 'Your HZSec subscription has been cancelled',
    html: layout({
      title: 'Subscription cancelled.',
      body: `
        <p>Your HZSec subscription has been cancelled.${accessUntil ? ` You'll have full access until <strong>${accessUntil}</strong>.` : ''}</p>
        <p style="font-size:14px;color:#71717a;">Changed your mind? You can resubscribe at any time.</p>
      `,
      cta: { label: 'Resubscribe', url: `${config.webOrigin}/pricing` }
    })
  });
}

// ─── Layout ──────────────────────────────────────────────────────────────────

function layout({ title, body, cta, ctaSecondary }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td><table width="100%" cellpadding="0" cellspacing="0"
  style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
  <tr><td style="background:#09090b;padding:22px 32px;">
    <span style="font-size:17px;font-weight:600;color:#fff;letter-spacing:-0.3px;">HZSec</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h1 style="margin:0 0 16px;font-size:21px;font-weight:600;line-height:1.3;color:#18181b;">${title}</h1>
    <div style="font-size:15px;line-height:1.65;color:#3f3f46;">${body}</div>
    ${cta ? `<div style="margin-top:28px;">
      <a href="${cta.url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:500;">${cta.label}</a>
      ${ctaSecondary ? `<a href="${ctaSecondary.url}" style="display:inline-block;margin-left:14px;color:#7c3aed;text-decoration:none;font-size:14px;font-weight:500;">${ctaSecondary.label} →</a>` : ''}
    </div>` : ''}
  </td></tr>
  <tr><td style="padding:18px 32px;border-top:1px solid #f4f4f5;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;">
      HZSec &middot; <a href="${config.webOrigin}" style="color:#7c3aed;text-decoration:none;">hzsec.io</a>
      &middot; <a href="mailto:hello@hzsec.io" style="color:#7c3aed;text-decoration:none;">hello@hzsec.io</a>
    </p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

module.exports = { trialStarted, trialEnding, paymentFailed, subscriptionCancelled };
