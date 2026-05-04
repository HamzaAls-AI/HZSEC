// Stripe Checkout + Stripe Customer Portal.
// Both require a Clerk session.
//
// Flow on first paid signup:
//   user clicks Subscribe on /pricing
//   → website POSTs /api/billing/checkout-session with {tier, interval}
//   → we ask Stripe for a Checkout Session URL with subscription mode + 7d trial
//   → website redirects user to that URL
//   → user completes Checkout
//   → Stripe redirects them to success_url
//   → in parallel, Stripe fires customer.subscription.created → our webhook
//     creates the License row + license_key
//
// Flow for "Manage billing":
//   dashboard POSTs /api/billing/portal-session
//   → we look up the user's License row, get stripe_customer_id
//   → ask Stripe for a Portal Session URL
//   → redirect

const express = require('express');
const { requireClerk } = require('../middleware/clerk');
const { getStripe } = require('../lib/stripe');
const config = require('../lib/config');
const prisma = require('../lib/db');

const router = express.Router();

// ─── Checkout ────────────────────────────────────────────────────────────────

router.post('/checkout-session', requireClerk, async (req, res) => {
  const { tier, interval } = req.body || {};
  if (!['pro', 'team'].includes(tier)) {
    return res.status(400).json({ error: 'invalid tier' });
  }
  if (!['monthly', 'annual'].includes(interval)) {
    return res.status(400).json({ error: 'invalid interval' });
  }

  const priceId = pickPriceId(tier, interval);
  if (!priceId || priceId.startsWith('price_REPLACE') || priceId.startsWith('price_PLACEHOLDER')) {
    return res.status(503).json({
      error: 'stripe_prices_not_configured',
      hint: 'run scripts/setup-stripe-products.sh'
    });
  }

  const clerkId = req.auth.userId;

  // If we already have a Stripe customer for this Clerk user, reuse it.
  // Otherwise let Stripe create one — the webhook will save it.
  let customerId = null;
  try {
    const existing = await prisma.license.findFirst({
      where: { user: { clerkId } },
      select: { stripeCustomerId: true }
    });
    customerId = existing?.stripeCustomerId || null;
  } catch (err) {
    // DB unavailable in dev is fine — Stripe will create a fresh customer.
    if (config.env === 'production') throw err;
    console.warn('[billing] DB lookup skipped:', err.message);
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerId
        ? { customer: customerId }
        : { customer_creation: 'always' }),
      subscription_data: {
        trial_period_days: 7,
        metadata: { clerkId, tier }
      },
      // Stash clerkId on the session itself too, so the webhook can find the
      // user even if subscription_data.metadata is missing in some edge case.
      metadata: { clerkId, tier },
      // The website renders a "checkout success" toast and refreshes /api/me.
      success_url: `${config.webOrigin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${config.webOrigin}/pricing?checkout=cancelled`,
      // 7-day trial means we need a card on file but no immediate charge.
      payment_method_collection: 'always',
      allow_promotion_codes: true
    });
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[checkout] stripe error:', err.message);
    res.status(502).json({ error: 'stripe_error', message: err.message });
  }
});

// ─── Customer Portal ─────────────────────────────────────────────────────────

router.post('/portal-session', requireClerk, async (req, res) => {
  const clerkId = req.auth.userId;

  let customerId = null;
  try {
    const lic = await prisma.license.findFirst({
      where: { user: { clerkId } },
      select: { stripeCustomerId: true }
    });
    customerId = lic?.stripeCustomerId || null;
  } catch (err) {
    if (config.env === 'production') throw err;
    console.warn('[portal] DB lookup skipped:', err.message);
  }

  if (!customerId) {
    return res.status(404).json({
      error: 'no_subscription',
      hint: 'subscribe via Checkout first'
    });
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.webOrigin}/dashboard`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[portal] stripe error:', err.message);
    res.status(502).json({ error: 'stripe_error', message: err.message });
  }
});

// ─── helpers ─────────────────────────────────────────────────────────────────

function pickPriceId(tier, interval) {
  if (tier === 'pro' && interval === 'monthly') return config.stripe.priceProMonthly;
  if (tier === 'pro' && interval === 'annual')  return config.stripe.priceProAnnual;
  if (tier === 'team' && interval === 'monthly') return config.stripe.priceTeamMonthly;
  return null;
}

module.exports = router;
