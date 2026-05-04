// POST /api/webhooks/stripe
//
// MUST receive the raw request body so the signature can be verified. We
// mount this with `express.raw()` in src/index.js BEFORE express.json().
// Any other order silently breaks signature verification with a misleading
// "no signatures found" error.
//
// Every event:
//   1. is logged to webhook_events for idempotency (replays are no-ops);
//   2. updates the License row + invalidates the license cache;
//   3. writes an AuditEvent so the dashboard "activity" view has data.

const express = require('express');
const config = require('../lib/config');
const { getStripe } = require('../lib/stripe');
const prisma = require('../lib/db');
const cache = require('../lib/license-cache');
const { generate: generateKey } = require('../lib/license-key');

const router = express.Router();

router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // Parse + verify event.
  let event;
  try {
    if (config.stripe.webhookSecret === 'whsec_PLACEHOLDER' || !config.stripe.webhookSecret.startsWith('whsec_') || config.stripe.webhookSecret.endsWith('_REPLACE_ME')) {
      console.warn('[webhooks] STRIPE_WEBHOOK_SECRET not set — skipping verification (DEV ONLY)');
      event = JSON.parse(req.body.toString('utf8'));
    } else {
      if (!sig) return res.status(400).send('missing stripe-signature');
      event = getStripe().webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    }
  } catch (err) {
    console.error('[webhooks] verification failed:', err.message);
    return res.status(400).send('invalid signature');
  }

  // Idempotency: short-circuit if we've seen this event ID before.
  try {
    const existing = await prisma.webhookEvent.findUnique({ where: { id: event.id } });
    if (existing?.processedAt) {
      return res.json({ received: true, dedup: true });
    }
    await prisma.webhookEvent.upsert({
      where:  { id: event.id },
      create: { id: event.id, type: event.type },
      update: {}
    });
  } catch (err) {
    if (config.env === 'production') {
      console.error('[webhooks] idempotency DB error:', err.message);
      // Return 500 — Stripe retries on non-2xx, which is what we want.
      return res.status(500).send('db_error');
    }
    console.warn('[webhooks] idempotency skipped (no DB):', err.message);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        // Don't 4xx unknown events — Stripe retries on non-2xx.
        console.log('[webhooks] unhandled', event.type);
    }

    // Mark processed so a replay short-circuits next time.
    try {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data:  { processedAt: new Date() }
      });
    } catch (err) {
      if (config.env === 'production') throw err;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[webhooks] handler failed:', event.type, err);
    // Return 500 so Stripe retries.
    res.status(500).json({ error: 'handler_failed' });
  }
});

// ─── handlers ────────────────────────────────────────────────────────────────

async function handleSubscriptionUpsert(sub) {
  const clerkId = sub.metadata?.clerkId;
  if (!clerkId) {
    console.warn('[webhooks] subscription has no clerkId metadata:', sub.id);
    return;
  }

  // Find or create User row keyed by clerkId. Email is best-effort — fetched
  // from Stripe customer if not already in DB.
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    let email = '';
    try {
      const customer = await getStripe().customers.retrieve(sub.customer);
      email = customer?.email || '';
    } catch { /* non-fatal */ }
    user = await prisma.user.create({ data: { clerkId, email } });
  }

  const tier = inferTier(sub);
  const status = mapStatus(sub.status);

  // One License row per Stripe subscription. Find by stripe_subscription_id;
  // if missing, create with a fresh license_key.
  let lic = await prisma.license.findUnique({
    where: { stripeSubscriptionId: sub.id }
  });

  if (!lic) {
    lic = await prisma.license.create({
      data: {
        userId: user.id,
        licenseKey: await uniqueKey(),
        status,
        tier,
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
      }
    });
  } else {
    lic = await prisma.license.update({
      where: { id: lic.id },
      data: {
        status,
        tier,
        stripeCustomerId: sub.customer,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
      }
    });
  }

  cache.invalidate(lic.licenseKey);

  await audit(user.id, 'stripe.subscription.upserted', {
    subId: sub.id, status, tier
  });
}

async function handleSubscriptionDeleted(sub) {
  const lic = await prisma.license.findUnique({
    where: { stripeSubscriptionId: sub.id }
  });
  if (!lic) return;

  await prisma.license.update({
    where: { id: lic.id },
    data:  { status: 'canceled' }
  });
  cache.invalidate(lic.licenseKey);

  await audit(lic.userId, 'stripe.subscription.deleted', { subId: sub.id });
}

async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;
  const lic = await prisma.license.findUnique({
    where: { stripeSubscriptionId: invoice.subscription }
  });
  if (!lic) return;

  // If we were past_due, paying brings us back to active.
  if (lic.status === 'past_due') {
    await prisma.license.update({
      where: { id: lic.id },
      data:  { status: 'active' }
    });
    cache.invalidate(lic.licenseKey);
  }

  await audit(lic.userId, 'stripe.invoice.paid', {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid
  });
}

async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  const lic = await prisma.license.findUnique({
    where: { stripeSubscriptionId: invoice.subscription }
  });
  if (!lic) return;

  await prisma.license.update({
    where: { id: lic.id },
    data:  { status: 'past_due' }
  });
  cache.invalidate(lic.licenseKey);

  await audit(lic.userId, 'stripe.invoice.payment_failed', {
    invoiceId: invoice.id
  });
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function mapStatus(stripeStatus) {
  // Stripe statuses: incomplete, incomplete_expired, trialing, active,
  // past_due, canceled, unpaid, paused.
  // We collapse to: active, trialing, canceled, past_due (matching the
  // LicenseStatus enum in schema.prisma).
  switch (stripeStatus) {
    case 'trialing':           return 'trialing';
    case 'active':             return 'active';
    case 'past_due':
    case 'unpaid':             return 'past_due';
    case 'canceled':
    case 'incomplete_expired': return 'canceled';
    default:                   return 'active'; // best-effort for incomplete/paused
  }
}

function inferTier(sub) {
  // The metadata path is the most reliable — we set it when creating the
  // Checkout session. Fallback: inspect the price_id.
  if (sub.metadata?.tier === 'pro' || sub.metadata?.tier === 'team') {
    return sub.metadata.tier;
  }
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id;
  if (!priceId) return 'pro';
  if (priceId === config.stripe.priceTeamMonthly) return 'team';
  return 'pro';
}

async function uniqueKey() {
  // Vanishingly rare collision (5e23 keyspace) but humour the linter.
  for (let i = 0; i < 5; i++) {
    const k = generateKey();
    const exists = await prisma.license.findUnique({ where: { licenseKey: k } });
    if (!exists) return k;
  }
  throw new Error('license_key collision storm');
}

async function audit(userId, type, payload) {
  try {
    await prisma.auditEvent.create({ data: { userId, type, payload } });
  } catch (err) {
    // Audit is best-effort; never let it block a webhook ack.
    console.warn('[audit] write failed:', err.message);
  }
}

module.exports = router;
