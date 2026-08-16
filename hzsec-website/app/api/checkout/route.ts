// Thin server-side relay so the browser doesn't need to handle Clerk tokens.
// The PricingTable client posts here → we POST to the backend with the
// user's session token → return the resulting Stripe URL.
//
// tier and interval come from URL query params (resilient to middleware body
// loss) with a JSON body fallback for backwards-compat.

import { NextResponse } from 'next/server';
import { backend, BackendError } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Primary source: URL query params — these survive Clerk middleware body
  // rewriting (the middleware adds auth headers via NextResponse.next which
  // can drop the ReadableStream body for authenticated requests in some
  // Vercel/Edge configurations).
  const url  = new URL(req.url);
  let tier     = url.searchParams.get('tier');
  let interval = url.searchParams.get('interval');

  // Fallback: try JSON body (works for unauthenticated or direct callers)
  if (!tier || !interval) {
    try {
      const body   = await req.json() as { tier?: string; interval?: string };
      tier     = body.tier     ?? tier;
      interval = body.interval ?? interval;
    } catch {
      // body absent or malformed — validation below will catch missing params
    }
  }

  if (tier !== 'pro' && tier !== 'team') {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }
  if (interval !== 'monthly' && interval !== 'annual') {
    return NextResponse.json({ error: 'invalid_interval' }, { status: 400 });
  }

  try {
    const session = await backend.startCheckout(tier, interval);
    return NextResponse.json(session);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
