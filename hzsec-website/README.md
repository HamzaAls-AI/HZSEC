# hzsec-website

Marketing site + dashboard for HZSec. Next.js 14 App Router, TypeScript,
Tailwind, Clerk for auth.

Pairs with `hzsec-backend/` (the API that handles licenses, Stripe, and
the Anthropic proxy).

## Routes

| Path                    | Auth          | Notes                                    |
| ----------------------- | ------------- | ---------------------------------------- |
| `/`                     | public        | Landing                                  |
| `/pricing`              | public        | 3-tier pricing, monthly/annual toggle    |
| `/legal/privacy`        | public        | Imported from `~/Desktop/HZSec/website/` |
| `/legal/terms`          | public        | Same                                     |
| `/legal/eula`           | public        | Same                                     |
| `/login`, `/signup`     | public        | Clerk's `<SignIn />` + `<SignUp />`      |
| `/dashboard`            | Clerk session | Overview cards, license, usage          |
| `/dashboard/license`    | Clerk session | Reveal/copy license key                  |
| `/dashboard/billing`    | Clerk session | "Open billing portal" → Stripe Portal    |
| `/dashboard/usage`      | Clerk session | Current month bar + history placeholder  |
| `/api/checkout` (POST)  | Clerk session | Server-side relay → backend Checkout     |
| `/api/portal` (POST)    | Clerk session | Server-side relay → backend Portal       |

`middleware.ts` runs Clerk's `clerkMiddleware()` against every route, then
calls `auth.protect()` for `/dashboard(.*)`.

## Local run

```bash
cp .env.example .env.local
# fill: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_test_...), CLERK_SECRET_KEY (sk_test_...)
# point at the backend: NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

npm install
npm run dev                 # http://localhost:3000
```

In the same browser session, sign up at `/signup`. The dashboard renders
the "no license yet → start trial" CTA. Click through to `/pricing`,
hit Subscribe — that POSTs `/api/checkout`, which relays to the backend
which returns a Stripe Checkout URL. Complete checkout with the test
card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC.

When Stripe redirects back to `/dashboard?checkout=success`, the webhook
should already have created a License row in the backend's DB. Refresh
and you'll see the real license key in the cards.

## Clerk keys

Get from <https://dashboard.clerk.com/> → **API keys**:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — `pk_test_...`. Safe in browser bundles.
- `CLERK_SECRET_KEY` — `sk_test_...`. Server-side only, never reaches the
  browser. Used by `middleware.ts` and `lib/backend.ts` (via `auth().getToken()`).

The redirect URLs (`/login`, `/signup`, `/dashboard`) are also set in the
Clerk dashboard under **Paths**. Match the values in `.env.example`.

## Project layout

```
hzsec-website/
├── app/
│   ├── layout.tsx                   ClerkProvider + global styles
│   ├── globals.css                  Tailwind + theme tokens
│   ├── page.tsx                     /
│   ├── pricing/page.tsx             /pricing
│   ├── login/[[...sign-in]]/        Clerk catch-all
│   ├── signup/[[...sign-up]]/       Clerk catch-all
│   ├── dashboard/
│   │   ├── layout.tsx               sidebar shell
│   │   ├── page.tsx                 overview
│   │   ├── license/page.tsx         license key reveal/copy
│   │   ├── billing/page.tsx         "open billing portal" button
│   │   └── usage/page.tsx           usage bar
│   ├── legal/{privacy,terms,eula}/  ported from static site
│   └── api/{checkout,portal}/       server-side relays to backend
├── components/
│   ├── MarketingHeader.tsx          public-page nav
│   ├── MarketingFooter.tsx          public-page footer
│   ├── DashboardSidebar.tsx         Linear-style left rail
│   ├── PricingTable.tsx             3-tier cards + interval toggle
│   ├── LicenseKeyView.tsx           reveal/copy widget
│   ├── OpenPortalButton.tsx         /api/portal trigger
│   └── LegalPage.tsx                shared layout for /legal/*
├── lib/
│   ├── backend.ts                   typed fetcher with Clerk JWT
│   └── legal-content.ts             extracted from old static site
├── middleware.ts                    clerkMiddleware + auth.protect
├── types.d.ts                       lucide-react shim (package quirk)
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## Deploy (Vercel — Stage C polish)

1. Push to GitHub (private).
2. <https://vercel.com> → New project → import repo → Vercel auto-detects Next.
3. Set env vars (everything from `.env.example`, with **prod** Clerk + Stripe keys
   and `NEXT_PUBLIC_BACKEND_URL=https://api.hzsec.io`).
4. Custom domain → `hzsec.io` and `www.hzsec.io` (CNAME / A records per Vercel docs).

## What's deferred to later

- `/dashboard/devices` (best-effort device tracking from the validate endpoint)
- `/dashboard/api-access` (BYO Anthropic key option for power users)
- `/dashboard/notifications`, `/security`, `/danger-zone`
- Multi-month usage chart (needs >1 month of `usage` rows)
