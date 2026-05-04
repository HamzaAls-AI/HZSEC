// License-key middleware.
// Used by /api/license/validate and /api/assistant/proxy — the only two
// endpoints the desktop app calls.
//
//   - Body shape:  { licenseKey: "HZSEC-XXXX-..." }
//   - Or header:   X-HZSec-License: HZSEC-XXXX-...
//
// We attach `req.license` on success — { id, userId, licenseKey, status,
// tier, currentPeriodEnd }. The handlers decide what to return; this just
// authenticates.

const { isWellFormed, normalize } = require('../lib/license-key');
const cache = require('../lib/license-cache');
const prisma = require('../lib/db');
const config = require('../lib/config');

const VALID_STATUSES = new Set(['active', 'trialing']);

async function requireLicense(req, res, next) {
  const raw = (req.body && req.body.licenseKey) || req.headers['x-hzsec-license'];
  const key = normalize(raw);

  if (!key) return res.status(400).json({ error: 'missing license_key' });
  if (!isWellFormed(key)) return res.status(400).json({ error: 'invalid_format' });

  // Fast path: in-process cache.
  const cached = cache.get(key);
  if (cached) {
    if (!VALID_STATUSES.has(cached.status)) {
      return res.status(403).json({ error: 'license_inactive', status: cached.status });
    }
    req.license = cached;
    return next();
  }

  // Slow path: DB lookup.
  let lic = null;
  try {
    lic = await prisma.license.findUnique({
      where: { licenseKey: key },
      select: {
        id: true, userId: true, licenseKey: true,
        status: true, tier: true, currentPeriodEnd: true
      }
    });
  } catch (err) {
    // In dev, if the DB isn't running, fall back to a synthesized license so
    // the desktop app can keep developing. Production always errors loud.
    if (config.env !== 'production') {
      console.warn('[license] DB unavailable, using dev fallback:', err.message);
      const stub = {
        id: 'dev_' + key,
        userId: 'dev_user',
        licenseKey: key,
        status: 'active',
        tier: 'pro',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000)
      };
      cache.set(key, stub);
      req.license = stub;
      return next();
    }
    console.error('[license] DB error:', err);
    return res.status(503).json({ error: 'db_unavailable' });
  }

  if (!lic) return res.status(404).json({ error: 'license_not_found' });
  if (!VALID_STATUSES.has(lic.status)) {
    return res.status(403).json({ error: 'license_inactive', status: lic.status });
  }

  cache.set(key, lic);
  req.license = lic;
  next();
}

module.exports = { requireLicense };
