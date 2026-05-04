// HZSec backend — entry point.
//
// Mount order matters:
//   1. Stripe webhook BEFORE express.json() — needs raw body for signing.
//   2. Everything else after.

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const config            = require('./lib/config');
const licenseRoutes     = require('./routes/license');
const assistantRoutes   = require('./routes/assistant');
const meRoutes          = require('./routes/me');
const billingRoutes     = require('./routes/billing');
const webhookRoutes     = require('./routes/webhooks');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// CORS — allow only the marketing site origin and the desktop app's
// custom-protocol scheme. The desktop app sends `Origin: hzsec://app` (or no
// origin for IPC-driven fetches), so we allow no-origin too.
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === config.webOrigin) return cb(null, true);
    if (origin.startsWith('hzsec://')) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));

// ─── Stripe webhook (RAW body required) ───
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// ─── JSON parsing for everything else ───
app.use(express.json({ limit: '1mb' }));

// ─── Healthcheck ───
app.get('/healthz', (_req, res) => res.json({ ok: true, env: config.env, ts: Date.now() }));

// ─── API routes ───
app.use('/api/license',   licenseRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/me',        meRoutes);
app.use('/api/billing',   billingRoutes);

// ─── 404 + error handlers ───
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'internal_error' });
});

const server = app.listen(config.port, () => {
  console.log(`hzsec-backend listening on :${config.port} (env=${config.env})`);
});

// Graceful shutdown — Railway sends SIGTERM on deploy.
function shutdown(sig) {
  console.log(`[shutdown] ${sig} received`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app;
