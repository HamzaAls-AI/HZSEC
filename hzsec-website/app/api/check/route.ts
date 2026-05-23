// Public breach-check proxy. Hides the HIBP API key from the browser and
// normalizes the response shape.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type HibpBreach = {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsSensitive: boolean;
};

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const email = (body as { email?: string }).email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    console.error('[check] HIBP_API_KEY not configured');
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }

  const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'hibp-api-key': apiKey,
        'user-agent':   'HZSec-BreachCheck'
      }
    });
  } catch {
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (res.status === 404) {
    return NextResponse.json({ breaches: [] });
  }
  if (res.status === 429) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  if (!res.ok) {
    console.error('[check] HIBP error', res.status);
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  const raw = (await res.json()) as HibpBreach[];
  const breaches = raw.map(b => ({
    name:        b.Name,
    title:       b.Title,
    domain:      b.Domain,
    breachDate:  b.BreachDate,
    pwnCount:    b.PwnCount,
    description: b.Description,
    dataClasses: b.DataClasses,
    sensitive:   b.IsSensitive
  }));

  return NextResponse.json({ breaches });
}
