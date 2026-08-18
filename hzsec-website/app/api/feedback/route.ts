import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FROM = process.env.EMAIL_FROM || 'HZSec <noreply@hzsec.io>';
const TO   = 'hello@hzsec.io';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  let message: string;
  try {
    const body = await req.json();
    message = (body?.message ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (!message || message.length < 3) {
    return NextResponse.json({ error: 'message_too_short' }, { status: 422 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: 'message_too_long' }, { status: 422 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('[feedback] RESEND_API_KEY not set — skipping email');
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to:   TO,
      subject: 'HZSec — User Feedback',
      text: [
        `From user: ${userId ?? 'anonymous'}`,
        '',
        message,
      ].join('\n'),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[feedback] resend error:', err);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
}
