// Lazy Prisma client.
//
// We avoid `new PrismaClient()` at import time because:
//   - `prisma generate` may not have run yet during fresh setup;
//   - the dev fallback paths in route handlers want to *catch* the import
//     error, not crash the whole server at boot.
//
// On first method access we attempt to construct the real client. If
// generate hasn't been run, the proxy throws on first call — which the
// handlers catch and degrade gracefully.

let real = null;

function getReal() {
  if (real) return real;
  // eslint-disable-next-line global-require
  const { PrismaClient } = require('@prisma/client');
  if (process.env.NODE_ENV === 'production') {
    real = new PrismaClient();
  } else {
    if (!global.__hzsecPrisma) {
      global.__hzsecPrisma = new PrismaClient({ log: ['warn', 'error'] });
    }
    real = global.__hzsecPrisma;
  }
  return real;
}

const handler = {
  get(_target, prop) {
    return getReal()[prop];
  }
};

module.exports = new Proxy({}, handler);
