# HZSec waitlist Worker

Tiny Cloudflare Worker that accepts `POST { email }` from the marketing site
and forwards a notification email via Resend. Holds the Resend API key as a
Cloudflare secret so it's never exposed in the browser.

## One-time setup

```bash
cd website/waitlist-worker
npm install
npx wrangler login          # authenticates with your Cloudflare account
npx wrangler secret put RESEND_API_KEY   # paste your NEW Resend key when prompted
npx wrangler deploy
```

`wrangler deploy` prints the public URL, e.g.
`https://hzsec-waitlist.<your-subdomain>.workers.dev`. Put that URL into
`website/index.html` (`WAITLIST_ENDPOINT`).

## Local dev

```bash
npx wrangler dev
```

## Updating the allow-list / addresses

Edit `wrangler.toml` and re-run `npx wrangler deploy`. Don't put the API key
in `wrangler.toml` — it lives in `wrangler secret`.
