// Server-side relay for the Customer Portal redirect — same pattern as
// /api/checkout. Browser → Next route handler → backend (with Clerk JWT)
// → Stripe Portal URL → window.location.href = data.url.

import { NextResponse } from 'next/server';
import { backend, BackendError } from '@/lib/backend';

export async function POST() {
  try {
    const session = await backend.startPortal();
    return NextResponse.json(session);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
