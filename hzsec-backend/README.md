# hzsec-backend

License + auth + billing + Anthropic-proxy service for HZSec.

**Status: Stage B complete.** All endpoints make real calls — Stripe Checkout
+ Customer Portal sessions, Anthropic Messages proxy with token metering,
webhook handlers that mutate the License/Usage tables, license validation
backed by Prisma + a 60s in-memory cache. Stage C (the Next.js website) and
Stage D (desktop app patches) are next.

In dev with no DB / no Anthropic key, route handlers degrade to synthesised
stub responses so the desktop app + website can keep developing offline.
In production, those same paths hard-fail loud.

## Endpoints

| Method | Path                              | Auth          | Purpose                                         |
| ------ | --------------------------------- | ------------- | ----------------------------------------------- |
| POST   | `/api/license/validate`           | License key   | Validate a key on app launch (cache 24h)        |
| POST   | `/api/assistant/proxy`            | License key   | Proxy Anthropic Messages calls; meter tokens    |
| GET    | `/api/me`                         | Clerk session | Dashboard "who am I" payload                    |
| POST   | `/api/billing/checkout-session`   | Clerk session | Create Stripe Checkout, return redirect URL     |
| POST   | `/api/billing/portal-session`     | Clerk session | Create Stripe Customer Portal, return URL       |
| POST   | `/api/webhooks/stripe`            | Stripe sig    | Sub created/updated/deleted, invoice events     |
| GET    | `/healthz`                        | none          | Railway healthcheck                             |

Stage-A behavior: every endpoint returns realistic JSON, but most do not
yet talk to Stripe/Anthropic/DB. Search for `Stage B` in the source to
find the TODOs.

## Local run

```bash
cp .env.example .env
# fill at minimum: CLERK_SECRET_KEY, STRIPE_SECRET_KEY (sk_test_...)

npm install

# One-time setup (each script is idempotent and self-validating):
bash scripts/setup-local-postgres.sh    # Docker → Postgres → prisma migrate
bash scripts/setup-stripe-products.sh   # creates 3 products + writes price IDs
bash scripts/setup-stripe-portal.sh     # configures Customer Portal

npm run dev                              # node --watch

# In another tab, run the smoke test:
bash scripts/smoke-test.sh               # 10 checks, colour-coded
```

### Develop without keys

The skeleton is forgiving. With placeholder values in `.env` you can:

- Hit `/api/license/validate` with any well-formed `HZSEC-XXXX-...` key — it
  returns `valid: true, tier: "pro"` without DB.
- Hit `/api/me` with `Authorization: Bearer dev:any_user_id` — the Clerk
  middleware accepts it as a stand-in for a real session token.
- Hit `/api/assistant/proxy` — returns a fake Anthropic-shaped response.
- Hit `/api/webhooks/stripe` — accepts events without signature verification
  and logs them.

This gets you all the way to a working desktop-app integration before any
real account exists.

## Clerk setup (5 min)

1. Sign up at <https://clerk.com/>.
2. Create a new application. Pick "Email + Google" providers — that's enough
   for v1. Skip the framework integration screen.
3. Dashboard → **API Keys** → copy the **Secret Key** (starts `sk_test_...`).
   Paste into `.env` → `CLERK_SECRET_KEY`.
4. The publishable key (`pk_test_...`) goes in the **website** repo's env,
   not here.

## Stripe setup (~15 min, test mode)

1. Sign up at <https://stripe.com/>. Skip activation — test mode works
   without it.
2. Toggle **"Test mode"** on (top right).
3. Developers → **API keys** → copy **Secret key** → `.env` →
   `STRIPE_SECRET_KEY`.
4. **Products → Add product**:
   - "HZSec Pro" → recurring → $19.00 / month → save → copy Price ID →
     `.env` → `STRIPE_PRICE_PRO_MONTHLY`.
   - On the same product, **Add another price** → $190.00 / year → copy →
     `STRIPE_PRICE_PRO_ANNUAL`.
   - Add product "HZSec Team" → $39.00 / month → copy →
     `STRIPE_PRICE_TEAM_MONTHLY`.
5. **Webhook signing secret (local)**:
   - `brew install stripe/stripe-cli/stripe`
   - `stripe login`
   - `stripe listen --forward-to localhost:8080/api/webhooks/stripe`
   - The CLI prints `whsec_...`. Paste into `.env` → `STRIPE_WEBHOOK_SECRET`.
6. **Webhook signing secret (production)**:
   - Dashboard → Developers → **Webhooks** → Add endpoint →
     `https://api.hzsec.io/api/webhooks/stripe`.
   - Subscribe to: `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
   - Copy the signing secret into Railway's env vars.

## Railway deploy

1. Sign up at <https://railway.app/>.
2. New project → "Deploy from GitHub" → pick this repo.
3. Add the **Postgres** plugin (one click). Railway sets `DATABASE_URL`
   automatically.
4. Add env vars from `.env.example` (everything except `DATABASE_URL`).
5. Set a custom domain → `api.hzsec.io` (after you confirm DNS).
6. The first deploy will run `npx prisma migrate deploy` per `railway.json`.

## Project layout

```
hzsec-backend/
├── prisma/
│   └── schema.prisma            users / licenses / usage / audit_events
├── src/
│   ├── index.js                 Express entry, mount order, CORS, shutdown
│   ├── lib/
│   │   ├── config.js            env reader; required() w/ dev fallbacks
│   │   ├── db.js                singleton PrismaClient
│   │   ├── license-key.js       generate/validate HZSEC-XXXX-... keys
│   │   └── usage.js             month roll-up helpers + tier caps
│   ├── middleware/
│   │   ├── clerk.js             requireClerk (Bearer token verify)
│   │   └── license.js           requireLicense (body or X-HZSec-License)
│   └── routes/
│       ├── license.js           POST /api/license/validate
│       ├── assistant.js         POST /api/assistant/proxy
│       ├── me.js                GET  /api/me
│       ├── billing.js           POST /api/billing/{checkout,portal}-session
│       └── webhooks.js          POST /api/webhooks/stripe (raw body)
├── .env.example                 every env var documented
├── Dockerfile                   multi-stage; Railway-friendly
├── railway.json                 build + healthcheck + start command
└── package.json
```

## Scripts

```
scripts/setup-local-postgres.sh   one-shot Docker Postgres + prisma migrate
scripts/setup-stripe-products.sh  creates Pro + Team products / 3 price IDs
scripts/setup-stripe-portal.sh    enables update-payment / cancel / invoices
scripts/smoke-test.sh             10-check end-to-end harness (colour-coded)
```

All scripts refuse to run with a `sk_live_` key — test mode only until your
LLC is incorporated.

## What Stage C / D will add

- **Stage C** — Next.js 14 marketing + dashboard at `hzsec-website/`.
  Clerk components for `/login`, `/signup`. `/pricing` with Stripe Checkout
  buttons that POST `/api/billing/checkout-session`. `/dashboard/*` pages
  reading from `/api/me`.
- **Stage D** — desktop app patches. `assistant-handler.js` uses the proxy
  when a license key is set, falls back to BYO Anthropic key otherwise.
  Settings panel gets an "Account" section with sign-in flow via custom
  URL protocol (`hzsec://license/HZSEC-...`).
