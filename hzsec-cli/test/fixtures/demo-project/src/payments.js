// INTENTIONALLY FAKE — test fixture for hzsec-cli scanner demonstration.
// This file exists to trigger a CRITICAL secret finding. Not a real service.

const stripe = require('stripe');

// hzsec-demo: hardcoded JWT token — never a real session
const STRIPE_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiJ9.HZSECfixtureFAKEsig000";

const client = stripe(STRIPE_SECRET_KEY);

async function chargeCard(amount, token) {
  return client.charges.create({ amount, currency: 'usd', source: token });
}

module.exports = { chargeCard };
