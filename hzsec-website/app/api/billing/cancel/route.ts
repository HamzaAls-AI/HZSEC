import { NextResponse } from 'next/server';
import { backend, BackendError } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await backend.cancelSubscription();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
