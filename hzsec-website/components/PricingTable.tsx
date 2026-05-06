'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Check } from 'lucide-react';

type Interval = 'monthly' | 'annual';

const tiers = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Solo developer, BYO Anthropic key.',
    priceMonthly: 0,
    priceAnnual: 0,
    cta: 'Download desktop app',
    href: '/download',
    features: [
      'All scanners + live monitor',
      'AI assistant via your own Anthropic key',
      'Breach Library',
      'Audit log on your machine'
    ],
    highlighted: false
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'For developers who don’t want to manage API keys.',
    priceMonthly: 19,
    priceAnnual: 190,
    cta: 'Start 7-day trial',
    href: null,
    features: [
      'Everything in Free',
      '1,000 assistant messages / month',
      'Managed Anthropic key — no setup',
      'Per-finding playbooks',
      'Email support'
    ],
    highlighted: true
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'For squads of 3+ engineers.',
    priceMonthly: 39,
    priceAnnual: null,
    cta: 'Contact sales',
    href: 'mailto:hello@hzsec.io?subject=HZSec%20Team%20pricing',
    features: [
      'Everything in Pro',
      '5,000 messages per seat / month',
      'Multi-seat billing',
      'Shared Breach Library notes',
      'Priority support'
    ],
    highlighted: false
  }
] as const;

export function PricingTable() {
  const [interval, setInterval] = useState<Interval>('monthly');
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function startCheckout(tier: 'pro' | 'team') {
    if (!isSignedIn) {
      router.push(`/signup?redirect_url=${encodeURIComponent(`/pricing?tier=${tier}&interval=${interval}`)}`);
      return;
    }
    setPending(tier);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval })
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'checkout_failed');
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start checkout';
      alert(message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="inline-flex rounded-md border border-border bg-panel p-1 text-sm">
        <button
          onClick={() => setInterval('monthly')}
          className={`rounded px-3 py-1.5 ${interval === 'monthly' ? 'bg-panel2 text-text' : 'text-muted hover:text-text'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('annual')}
          className={`rounded px-3 py-1.5 ${interval === 'annual' ? 'bg-panel2 text-text' : 'text-muted hover:text-text'}`}
        >
          Annual{' '}
          <span className="ml-1 rounded-full bg-accentSoft px-2 py-0.5 text-[11px] font-medium text-accent">
            Save 2 months
          </span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tiers.map(t => {
          const price = interval === 'annual' ? t.priceAnnual : t.priceMonthly;
          const unit  = price === 0 ? '' : interval === 'annual' ? '/yr' : '/mo';
          const isCustomPrice = t.id === 'team' && interval === 'annual';

          return (
            <div
              key={t.id}
              className={`flex flex-col rounded-xl border p-6 ${
                t.highlighted
                  ? 'border-accent bg-accentSoft/40'
                  : 'border-border bg-panel'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-medium">{t.name}</h3>
                {t.highlighted && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{t.blurb}</p>

              <div className="mt-6">
                {isCustomPrice ? (
                  <div>
                    <div className="text-sm font-medium text-text">Custom pricing</div>
                    <div className="mt-1 text-sm text-muted">Annual billing on request.</div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">${price}</span>
                    <span className="text-sm text-muted">{unit}</span>
                  </div>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {t.id === 'free' ? (
                  <a
                    href={t.href ?? '/download'}
                    className="block w-full rounded-md border border-border bg-panel2 py-2 text-center text-sm hover:bg-panel"
                  >
                    {t.cta}
                  </a>
                ) : t.id === 'team' ? (
                  <a
                    href={t.href ?? '#'}
                    className="block w-full rounded-md border border-accent/50 bg-accentSoft/20 py-2 text-center text-sm text-accent hover:bg-accentSoft/35"
                  >
                    {t.cta}
                  </a>
                ) : (
                  <button
                    disabled={pending === t.id}
                    onClick={() => startCheckout(t.id as 'pro' | 'team')}
                    className={`w-full rounded-md py-2 text-center text-sm transition-colors ${
                      t.highlighted
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'border border-border bg-panel2 hover:bg-panel'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {pending === t.id ? 'Redirecting…' : t.cta}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
