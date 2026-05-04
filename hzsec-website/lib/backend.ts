// Typed fetcher for hzsec-backend.
// Server components / route handlers use Clerk's auth().getToken() to mint
// a JWT and pass it along. Public callers (e.g. /pricing → checkout) go
// through a server route handler so the token never touches the browser.

import { auth } from '@clerk/nextjs/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:8080';

// ─── Wire types — match backend route shapes ──────────────────────────────

export type Tier = 'free' | 'pro' | 'team';
export type LicenseStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface UsageSummary {
  used: number;
  cap: number;
  remaining: number;
  month: string;
}

export interface LicensePayload {
  licenseKey: string;
  status: LicenseStatus;
  tier: Tier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

export interface MePayload {
  user: {
    id?: string;
    clerkId: string;
    email: string;
    createdAt: string | null;
  };
  license: LicensePayload | null;
  usage: UsageSummary;
  dev?: boolean;
}

export interface CheckoutPayload {
  url: string;
  id?: string;
}

export interface PortalPayload {
  url: string;
}

// ─── Authed fetcher ───────────────────────────────────────────────────────

class BackendError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function fetchWithToken<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) throw new BackendError(401, { error: 'no_session' });

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {})
    },
    cache: 'no-store'
  });
  const text = await res.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : null; }
  catch { body = { error: 'invalid_json', raw: text }; }
  if (!res.ok) throw new BackendError(res.status, body);
  return body as T;
}

// ─── Endpoint helpers ─────────────────────────────────────────────────────

export const backend = {
  me:                () => fetchWithToken<MePayload>('/api/me'),
  startCheckout:     (tier: 'pro' | 'team', interval: 'monthly' | 'annual') =>
    fetchWithToken<CheckoutPayload>('/api/billing/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ tier, interval })
    }),
  startPortal:       () => fetchWithToken<PortalPayload>('/api/billing/portal-session', { method: 'POST' })
};

export { BackendError, BACKEND_URL };
