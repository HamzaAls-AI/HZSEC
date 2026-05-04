// License-key helpers. Format: HZSEC-XXXX-XXXX-XXXX-XXXX
//   - 16 chars of entropy (4 groups of 4)
//   - Crockford-style alphabet (no 0/O/1/I/L) so users can read it from a
//     screenshot without confusion.
//   - 5^16 / 32^16 ≈ no-collision-in-practice for our scale.

const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // 30 chars

function generate() {
  const buf = crypto.randomBytes(16);
  let out = 'HZSEC';
  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) out += '-';
    out += ALPHABET[buf[i] % ALPHABET.length];
  }
  return out;
}

function isWellFormed(key) {
  if (typeof key !== 'string') return false;
  return /^HZSEC(-[A-Z2-9]{4}){4}$/.test(key);
}

// Lookup is case-insensitive — store upper, accept anything.
function normalize(key) {
  return typeof key === 'string' ? key.trim().toUpperCase() : '';
}

module.exports = { generate, isWellFormed, normalize };
