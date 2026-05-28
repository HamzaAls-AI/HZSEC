/**
 * HZSec waitlist email Worker
 *
 * Receives POST { email } from the public site, validates it,
 * and forwards a notification to the team via Resend.
 *
 * Secrets (set with `wrangler secret put`):
 *   RESEND_API_KEY  — Resend API key (server-side only)
 *
 * Vars (set in wrangler.toml [vars]):
 *   ALLOWED_ORIGIN  — e.g. "https://hzsec.io"
 *   FROM_ADDRESS    — e.g. "HZSec <hello@hzsec.io>"
 *   TO_ADDRESS      — e.g. "hamzaalhussaini44@gmail.com"
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";
    const reqOrigin = request.headers.get("Origin") || "";
    // Echo back the request origin only if it matches our allow-list, so the
    // browser actually accepts the response. Otherwise fall back to allowed.
    const origin = reqOrigin === allowed ? reqOrigin : allowed;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed" }, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(400, { error: "Invalid JSON" }, origin);
    }

    const email = (payload?.email || "").trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return json(400, { error: "Invalid email" }, origin);
    }

    // Basic abuse guards
    const ua = request.headers.get("User-Agent") || "unknown";
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_ADDRESS,
        to: env.TO_ADDRESS,
        subject: `New waitlist signup: ${email}`,
        html: `
          <h2>New HZSec waitlist signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>IP:</strong> ${ip}</p>
          <p><strong>UA:</strong> ${ua}</p>
        `,
      }),
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.error("Resend error", resendRes.status, text);
      return json(502, { error: "Email provider failed" }, origin);
    }

    return json(200, { ok: true }, origin);
  },
};
