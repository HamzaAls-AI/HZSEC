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
    blurb: 'Solo developer. Bring your own Anthropic key.',
    priceMonthly: 0,
    priceAnnual: 0,
    cta: 'Download free',
    href: '#download',
    features: [
      'All scanners + live monitor',
      'AI assistant via your own Anthropic key',
      'Breach Library',
      'Audit log on your machine',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: "Full AI access, no API key setup.",
    priceMonthly: 19,
    priceAnnual: 190,
    cta: 'Start 7-day trial',
    href: null,
    features: [
      'Everything in Free',
      '1,000 assistant messages / month',
      'Managed Anthropic key — no setup',
      'Per-finding remediation playbooks',
      'Email support',
    ],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'Up to 5 developers. One flat price.',
    priceMonthly: 49,
    priceAnnual: 490,
    cta: 'Start 7-day trial',
    href: null,
    features: [
      'Everything in Pro',
      'Up to 5 developers',
      '5,000 shared assistant messages / month',
      'Shared Breach Library notes',
      'Priority support',
    ],
    highlighted: false,
  },
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
        body: JSON.stringify({ tier, interval }),
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
    <div className="mt-8">
      {/* Interval toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-full border border-border bg-panel p-1 text-sm gap-1">
          <button
            onClick={() => setInterval('monthly')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              interval === 'monthly' ? 'bg-accent text-white' : 'text-muted hover:text-text'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              interval === 'annual' ? 'bg-accent text-white' : 'text-muted hover:text-text'
            }`}
          >
            Annual
            <span className="ml-2 rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-medium text-ok">
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {tiers.map(t => {
          const price = interval === 'annual' ? t.priceAnnual : t.priceMonthly;
          const unit  = price === 0 ? '' : interval === 'annual' ? '/yr' : '/mo';

          return (
            <div
              key={t.id}
              className={`flex flex-col rounded-2xl border p-7 transition-all ${
                t.highlighted
                  ? 'border-accent bg-accentSoft/30 shadow-[0_0_0_1px_rgb(var(--color-accent)/0.3)]'
                  : 'border-border bg-panel hover:border-accent/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-medium text-text text-lg">{t.name}</h3>
                {t.highlighted && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">{t.blurb}</p>

              {/* Price */}
              <div className="mt-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[clamp(32px,3vw,40px)] font-light tracking-tight text-text">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {unit && <span className="text-sm text-muted">{unit}</span>}
                </div>
                {interval === 'annual' && price > 0 && (
                  <p className="text-xs text-muted mt-0.5">
                    ${Math.round(price / 12)}/mo billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 text-sm mb-8">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                    <span className="text-text/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {t.id === 'free' ? (
                <a
                  href={t.href}
                  className="block w-full rounded-full border border-border bg-panel2 py-2.5 text-center text-sm font-medium hover:border-accent hover:text-accent transition-colors"
                >
                  {t.cta}
                </a>
              ) : (
                <button
                  disabled={pending === t.id}
                  onClick={() => startCheckout(t.id as 'pro' | 'team')}
                  className={`w-full rounded-full py-2.5 text-center text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    t.highlighted
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'border border-border bg-panel2 hover:border-accent hover:text-accent'
                  }`}
                >
                  {pending === t.id ? 'Redirecting…' : t.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
