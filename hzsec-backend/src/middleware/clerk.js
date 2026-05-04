// Clerk session-token middleware (using @clerk/express).
//
// Used by /api/me, /api/billing/* — anything driven by the dashboard.
//
// Design notes:
//   - We don't use clerkMiddleware() at app level because we want different
//     auth (license keys vs. Clerk sessions) per route.
//   - verifyToken() is the right primitive: it accepts a JWT and returns the
//     decoded payload (or throws). The `sub` claim is the Clerk user ID.
//   - Dev shim: in non-production, a token of `dev:<userId>` short-circuits
//     verification. Lets the desktop app + website develop against dashboard
//     endpoints before Clerk's frontend is wired up. Disabled in production.

const config = require('../lib/config');

let verifyTokenFn = null;
function getVerifier() {
  if (verifyTokenFn) return verifyTokenFn;
  // eslint-disable-next-line global-require
  const { verifyToken } = require('@clerk/express');
  verifyTokenFn = (token) => verifyToken(token, { secretKey: config.clerk.secretKey });
  return verifyTokenFn;
}

function unauthorized(res, msg = 'unauthorized') {
  return res.status(401).json({ error: msg });
}

async function requireClerk(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return unauthorized(res, 'missing bearer token');

    if (config.env !== 'production' && token.startsWith('dev:')) {
      req.auth = { userId: token.slice(4) };
      return next();
    }

    const verify = getVerifier();
    const payload = await verify(token);
    if (!payload?.sub) return unauthorized(res, 'invalid session');
    req.auth = { userId: payload.sub, sessionId: payload.sid };
    next();
  } catch (err) {
    console.error('[clerk] verify failed:', err.message);
    return unauthorized(res, 'invalid session');
  }
}

module.exports = { requireClerk };
