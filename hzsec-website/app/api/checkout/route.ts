// Thin server-side relay so the browser doesn't need to handle Clerk tokens.
// The PricingTable client posts here → we POST to the backend with the
// user's session token → return the resulting Stripe URL.

import { NextResponse } from 'next/server';
import { backend, BackendError } from '@/lib/backend';

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const tier     = (body as { tier?: string }).tier;
  const interval = (body as { interval?: string }).interval;
  if (tier !== 'pro' && tier !== 'team')         return NextResponse.json({ error: 'invalid_tier'     }, { status: 400 });
  if (interval !== 'monthly' && interval !== 'annual') return NextResponse.json({ error: 'invalid_interval' }, { status: 400 });

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
