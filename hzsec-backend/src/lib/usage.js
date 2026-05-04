// Per-month usage roll-up helpers.
// Stage A: stub-friendly — returns deterministic shapes even before DB exists,
// so the desktop app can develop against the real wire format.
// Stage B will replace these with Prisma upserts.

const config = require('./config');

function currentMonth() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function capForTier(tier) {
  return config.caps[tier] ?? 0;
}

function summarize({ tier, used = 0 }) {
  const cap = capForTier(tier);
  return {
    used,
    cap,
    remaining: Math.max(0, cap - used),
    month: currentMonth()
  };
}

module.exports = { currentMonth, capForTier, summarize };
