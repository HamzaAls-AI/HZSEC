// Single Stripe SDK instance.
// Lazy-loaded so the file imports cleanly even if the user is mid-setup
// and stripe isn't installed yet.

const config = require('./config');

let _stripe = null;

function getStripe() {
  if (_stripe) return _stripe;
  if (!config.stripe.secretKey || config.stripe.secretKey === 'sk_test_PLACEHOLDER') {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  // eslint-disable-next-line global-require
  const Stripe = require('stripe');
  _stripe = new Stripe(config.stripe.secretKey, {
    // Pin API version so silent breaking changes don't ship to prod.
    apiVersion: '2024-06-20',
    appInfo: {
      name: 'hzsec-backend',
      version: '0.1.0'
    }
  });
  return _stripe;
}

module.exports = { getStripe };
