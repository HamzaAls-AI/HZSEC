import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[waitlist] RESEND_API_KEY is not set');
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  const [notify, confirm] = await Promise.allSettled([
    // Internal notification
    resend.emails.send({
      from: 'HZSec Waitlist <waitlist@hzsec.io>',
      to: 'hello@hzsec.io',
      subject: `[Waitlist] New Windows signup: ${email}`,
      text: `New Windows waitlist signup:\n\n${email}\n\nTotal signups are in your Resend dashboard.`,
    }),
    // User confirmation
    resend.emails.send({
      from: 'HZSec <waitlist@hzsec.io>',
      to: email,
      subject: "You're on the HZSec Windows waitlist",
      text: [
        "Hey — you're on the list.",
        '',
        "We'll email you the moment HZSec for Windows is ready to download. No spam, just the one launch email.",
        '',
        'In the meantime, the macOS build is live:',
        'https://hzsec.io/pricing#download',
        '',
        '— Hamza, HZSec',
      ].join('\n'),
    }),
  ]);

  if (notify.status === 'rejected') {
    console.error('[waitlist] Failed to send internal notification:', notify.reason);
  }
  if (confirm.status === 'rejected') {
    console.error('[waitlist] Failed to send confirmation:', confirm.reason);
    // Still return success — the signup intent is captured even if the email bounces
  }

  return NextResponse.json({ ok: true });
}
