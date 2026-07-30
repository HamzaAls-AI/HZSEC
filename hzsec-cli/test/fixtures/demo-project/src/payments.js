// INTENTIONALLY FAKE — test fixture for hzsec-cli scanner demonstration.
// This file exists to trigger a HIGH "JWT token hardcoded in source" finding.

const gateway = require('./gateway');

// hzsec-demo: hardcoded JWT token — never a real session
const SESSION_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiJ9.HZSECfixtureFAKEsig000";

const client = gateway({ token: SESSION_TOKEN });

async function chargeCard(amount, token) {
  return client.charges.create({ amount, currency: 'usd', source: token });
}

module.exports = { chargeCard };
