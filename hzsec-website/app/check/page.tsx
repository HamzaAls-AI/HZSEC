import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { BreachCheckForm } from '@/components/BreachCheckForm';

export const metadata: Metadata = {
  title:       'Free breach check — HZSec',
  description: 'Check if your email address appears in a public data breach. Free, no signup required.',
  openGraph: {
    title:       'Is your email in a breach?',
    description: 'Free public breach check by HZSec. Paste your email, find out in seconds.',
    url:         'https://hzsec.io/check',
    siteName:    'HZSec'
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Is your email in a breach?',
    description: 'Free public breach check by HZSec.'
  }
};

export default function CheckPage() {
  return (
    <>
      <MarketingHeader />

      <section className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
        <div className="text-center">
          <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted">
            Free tool — no signup
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
            Is your email in a<br />
            <span className="text-accent">public breach?</span>
          </h1>
          <p className="mt-6 text-base text-muted sm:text-lg">
            Check your email against millions of records from known data
            breaches. Takes about a second.
          </p>
        </div>

        <div className="mt-10">
          <BreachCheckForm />
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
