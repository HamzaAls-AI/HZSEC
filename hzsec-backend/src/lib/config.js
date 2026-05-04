// Centralised env reader. Fail loud at boot if a required var is missing in
// production; in dev we tolerate placeholders so the skeleton boots even
// before Clerk/Stripe accounts exist.

require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

function required(name, fallback) {
  const v = process.env[name];
  if (v && v.length > 0) return v;
  if (!isProd && fallback !== undefined) return fallback;
  if (isProd) throw new Error(`Missing required env var ${name}`);
  return fallback;
}

const config = {
  env:  process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),

  // Public origin for the marketing site / dashboard. Used to build Stripe
  // success / cancel URLs and CORS allow-list.
  webOrigin: required('WEB_ORIGIN', 'http://localhost:3000'),

  // Postgres (Railway provides DATABASE_URL automatically when you attach the
  // Postgres plugin).
  databaseUrl: required('DATABASE_URL', 'postgresql://localhost:5432/hzsec_dev'),

  // Clerk — backend uses the Secret Key. The publishable key only goes to the
  // website. See README → Clerk setup.
  clerk: {
    secretKey: required('CLERK_SECRET_KEY', 'sk_test_PLACEHOLDER')
  },

  // Stripe — TEST MODE only until LLC is incorporated. Confirm sk_test_ prefix.
  stripe: {
    secretKey:     required('STRIPE_SECRET_KEY',     'sk_test_PLACEHOLDER'),
    webhookSecret: required('STRIPE_WEBHOOK_SECRET', 'whsec_PLACEHOLDER'),
    // Price IDs are created in Stripe dashboard. Read README → Stripe setup.
    priceProMonthly:  process.env.STRIPE_PRICE_PRO_MONTHLY  || 'price_PLACEHOLDER_pro_monthly',
    priceProAnnual:   process.env.STRIPE_PRICE_PRO_ANNUAL   || 'price_PLACEHOLDER_pro_annual',
    priceTeamMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || 'price_PLACEHOLDER_team_monthly'
  },

  // Anthropic — single server-side key. Users never see it.
  anthropic: {
    apiKey: required('ANTHROPIC_API_KEY', 'sk-ant-PLACEHOLDER'),
    apiBase: process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com',
    apiVersion: process.env.ANTHROPIC_API_VERSION || '2023-06-01'
  },

  // Per-tier monthly assistant-message caps. Pulled here so the cap logic is
  // not scattered across files.
  caps: {
    free: 0,           // free tier uses BYO key, doesn't hit the proxy
    pro:  1000,
    team: 5000         // per seat; multi-seat bookkeeping is Stage B
  }
};

module.exports = config;
