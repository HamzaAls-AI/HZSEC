import { NextResponse } from 'next/server';
import { backend } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await backend.me();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
