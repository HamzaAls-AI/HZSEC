# Phase 2 — Account setup walkthrough

You need accounts at Clerk, Stripe, Railway, and (Stage C) Vercel. Do them
in this order. Total time: ~30–45 minutes.

I (Claude) cannot create these accounts for you — they all require email
verification + 2FA — but every step is short and the order below is the
fastest path.

You can keep building / running the backend skeleton with placeholder
keys until you finish each section. The README's "Develop without keys"
note explains how.

---

## 1. Clerk (~5 min)

1. Go to <https://clerk.com/> → **Sign up**.
2. After verifying email, click **+ Create application**.
3. Application name: `HZSec`. Sign-in options: leave **Email** on, also
   tick **Google**. Click **Create**.
4. Skip the framework integration screen — we wire Clerk ourselves.
5. Top-left, switch to **Development** instance (it's the default).
6. Left nav → **API keys**.
   - Copy **Publishable key** (`pk_test_...`) → save for the website
     repo's `.env` later (Stage C).
   - Copy **Secret key** (`sk_test_...`) → paste into
     `hzsec-backend/.env` → `CLERK_SECRET_KEY`.
7. Optional now, required before launch: **Customize → Branding** for
   logo + accent color.

Test: `npm run dev` in the backend, then
`curl http://localhost:8080/api/me -H "Authorization: Bearer dev:user_test"`
still returns the stub. Real Clerk tokens will work once the website is
hooked up in Stage C.

---

## 2. Stripe — Test mode (~15 min)

1. Go to <https://stripe.com/> → **Start now**.
2. Verify email. **Skip** the "Activate your account" prompt — test mode
   works without business info.
3. Top-right toggle: confirm **Test mode** is ON (orange badge).
4. Top-right → **Developers → API keys**.
   - Reveal **Secret key** (`sk_test_...`) → paste into
     `hzsec-backend/.env` → `STRIPE_SECRET_KEY`.
5. Left nav → **Product catalog** → **+ Add product**.
   - Name: `HZSec Pro`. Description: "AI security assistant — 1000
     messages / month".
   - Pricing: **Recurring**, **$19.00 USD / month**. Save product.
   - On the product page, **+ Add another price** → **$190.00 USD / year**.
   - Copy each Price ID (`price_...`) into `.env`:
     - monthly → `STRIPE_PRICE_PRO_MONTHLY`
     - annual  → `STRIPE_PRICE_PRO_ANNUAL`
6. Add a second product `HZSec Team` → recurring → $39 / month → copy the
   Price ID → `STRIPE_PRICE_TEAM_MONTHLY`.
7. **Enable Customer Portal**:
   - Settings → Billing → **Customer portal** → toggle on.
   - Allow customers to: update payment method, cancel subscription, view
     invoices. Save.

### Webhook signing secret — local development

Open a second terminal and keep it running:

```bash
brew install stripe/stripe-cli/stripe          # one-time
stripe login                                    # opens browser, pair the CLI
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

The CLI prints `Ready! Your webhook signing secret is whsec_...` — paste
into `.env` → `STRIPE_WEBHOOK_SECRET`. Restart `npm run dev`.

Test: in a third terminal,
`stripe trigger customer.subscription.created` — backend logs should show
`[webhooks] subscription.created sub_...`.

### Webhook signing secret — production (do this *after* Railway deploy)

1. Stripe → **Developers → Webhooks → + Add endpoint**.
2. Endpoint URL: `https://api.hzsec.io/api/webhooks/stripe` (after DNS).
3. Events to send: pick exactly these five —
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Add endpoint → click into it → **Signing secret** → reveal → copy →
   paste into Railway's env vars as `STRIPE_WEBHOOK_SECRET` (overrides
   the local CLI value).

---

## 3. Railway — Backend host (~10 min)

1. Go to <https://railway.app/> → **Login with GitHub**.
2. Push `hzsec-backend/` to a private GitHub repo first
   (`gh repo create hzsec-backend --private --source=. --push` works if you
   have `gh` installed).
3. Railway dashboard → **+ New project** → **Deploy from GitHub repo** →
   pick `hzsec-backend`.
4. Once the first build kicks off, click **+ New** in the project canvas
   → **Database → Add PostgreSQL**. Railway auto-injects `DATABASE_URL`
   into the service.
5. In the service settings → **Variables**, add every key from
   `.env.example` *except* `DATABASE_URL`. Use the production webhook
   secret (step 2 above).
6. **Settings → Networking → Generate domain** to get a temporary
   `*.up.railway.app` URL for testing. Once DNS is set, **Custom domain
   → api.hzsec.io**.
7. The first deploy will run `npx prisma migrate deploy` automatically per
   `railway.json`. If it errors with "no migrations folder", run
   `npx prisma migrate dev --name init` locally first and commit
   `prisma/migrations/` — Railway will then apply on next deploy.

Verify: `curl https://<your-railway-url>/healthz` should return
`{"ok":true,"env":"production",...}`.

---

## 4. Vercel — Marketing site host (Stage C — not needed yet)

We'll cover this when we get to Stage C. Quick preview:

1. <https://vercel.com/> → log in with GitHub.
2. Push `hzsec-website/` to a separate private repo.
3. Vercel: **+ New Project** → import → it auto-detects Next.js.
4. Add Clerk publishable key + Stripe publishable key + backend URL as env
   vars before the first deploy.
5. Custom domain → `hzsec.io` (and `www.hzsec.io`).

---

## What to send me when you're done

- Confirm: backend running locally, `curl http://localhost:8080/healthz` →
  ok.
- Confirm: `.env` has real `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, three
  `STRIPE_PRICE_*` IDs, and `STRIPE_WEBHOOK_SECRET` from `stripe listen`.
- (Optional) The Railway URL if you've deployed.

Then I'll start Stage B (real Stripe / Anthropic / DB writes) and we'll
finish the backend before moving to the website.
