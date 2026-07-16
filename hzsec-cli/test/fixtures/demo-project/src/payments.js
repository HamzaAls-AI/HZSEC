// Payment processing — connects to Stripe
const stripe = require('stripe');

const STRIPE_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiJ9.HZSECfixtureFAKEsig000";

const client = stripe(STRIPE_SECRET_KEY);

async function chargeCard(amount, token) {
  return client.charges.create({ amount, currency: 'usd', source: token });
}

module.exports = { chargeCard };
