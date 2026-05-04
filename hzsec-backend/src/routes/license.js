// POST /api/license/validate
// Body:    { licenseKey: "HZSEC-XXXX-..." }
// Returns: { valid, tier, status, expiresAt, usage: { used, cap, remaining, month } }
//
// The desktop app calls this on launch, then caches for 24h.

const express = require('express');
const { requireLicense } = require('../middleware/license');
const { summarize, currentMonth } = require('../lib/usage');
const prisma = require('../lib/db');
const config = require('../lib/config');

const router = express.Router();

router.post('/validate', requireLicense, async (req, res) => {
  const lic = req.license;

  let used = 0;
  try {
    const u = await prisma.usage.findUnique({
      where: { userId_month: { userId: lic.userId, month: currentMonth() } },
      select: { assistantMessages: true }
    });
    used = u?.assistantMessages || 0;
  } catch (err) {
    if (config.env === 'production') {
      console.error('[validate] usage lookup failed:', err);
      return res.status(503).json({ error: 'db_unavailable' });
    }
    // Dev fallback: 0 used.
  }

  const usage = summarize({ tier: lic.tier, used });

  res.json({
    valid:     lic.status === 'active' || lic.status === 'trialing',
    tier:      lic.tier,
    status:    lic.status,
    expiresAt: lic.currentPeriodEnd,
    usage
  });
});

module.exports = router;
