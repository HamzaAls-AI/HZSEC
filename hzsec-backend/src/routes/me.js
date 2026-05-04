// GET /api/me
// Returns the signed-in user, their license, and current month's usage.
// Used by the dashboard.

const express = require('express');
const { requireClerk } = require('../middleware/clerk');
const { summarize, currentMonth } = require('../lib/usage');
const config = require('../lib/config');
const prisma = require('../lib/db');

const router = express.Router();

router.get('/', requireClerk, async (req, res) => {
  const clerkId = req.auth.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        licenses: { orderBy: { createdAt: 'desc' }, take: 1 },
        usage:    { where: { month: currentMonth() }, take: 1 }
      }
    });

    if (!user) {
      // Signed-in Clerk user but no DB row yet (no subscription completed).
      // Still a valid response — the dashboard renders a "subscribe" CTA.
      return res.json({
        user: { clerkId, email: '', createdAt: null },
        license: null,
        usage: summarize({ tier: 'free', used: 0 })
      });
    }

    const lic = user.licenses[0] || null;
    const usageRow = user.usage[0];
    const used = usageRow?.assistantMessages || 0;
    const tier = lic?.tier || 'free';

    res.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        createdAt: user.createdAt
      },
      license: lic && {
        licenseKey: lic.licenseKey,
        status: lic.status,
        tier: lic.tier,
        stripeCustomerId: lic.stripeCustomerId,
        stripeSubscriptionId: lic.stripeSubscriptionId,
        trialEndsAt: lic.trialEndsAt,
        currentPeriodEnd: lic.currentPeriodEnd
      },
      usage: summarize({ tier, used })
    });
  } catch (err) {
    if (config.env !== 'production') {
      // Dev fallback when DB isn't running — same shape as before so the
      // website / desktop can keep developing.
      console.warn('[me] DB unavailable, dev fallback:', err.message);
      return res.json({
        user: {
          id: 'dev_' + clerkId,
          clerkId,
          email: 'dev@example.com',
          createdAt: new Date().toISOString()
        },
        license: {
          licenseKey: 'HZSEC-XXXX-XXXX-XXXX-XXXX',
          status: 'active',
          tier: 'pro',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        },
        usage: summarize({ tier: 'pro', used: 0 }),
        dev: true
      });
    }
    console.error('[me] error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
