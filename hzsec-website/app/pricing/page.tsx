import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PricingTable } from '@/components/PricingTable';

export const metadata = { title: 'Pricing — HZSec' };

export default function Pricing() {
  return (
    <>
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, fair pricing.</h1>
          <p className="mt-3 text-muted">
            Free forever for solo use with your own Anthropic key. Pro and Team unlock
            the managed assistant, monthly message caps, and team seats.
          </p>
        </div>

        <PricingTable />

        <p className="mt-12 text-sm text-muted">
          7-day free trial on Pro and Team. Cancel any time from your billing
          portal — your access keeps working until the period ends.
        </p>
      </section>
      <MarketingFooter />
    </>
  );
}
