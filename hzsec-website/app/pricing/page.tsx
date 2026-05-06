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
            Free forever for solo use with your own Anthropic key. Pro unlocks the managed assistant and monthly message caps. Team adds shared billing and seats for squads.
          </p>
          <p className="mt-2 text-sm text-muted">All prices shown in USD.</p>
        </div>

        <PricingTable />

        <div className="mt-12 grid gap-4 rounded-2xl border border-border bg-panel/40 p-5 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-medium text-text">Do I need my own Anthropic key?</h2>
            <p className="mt-1 text-sm text-muted">Only on Free. Pro and Team include a managed assistant so setup is simpler.</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text">Can I upgrade later?</h2>
            <p className="mt-1 text-sm text-muted">Yes. You can move from Free to Pro or Team whenever you need higher limits.</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text">How does Team pricing work?</h2>
            <p className="mt-1 text-sm text-muted">Team is custom-quoted for squads of 3+. Click Contact sales to start the conversation.</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted">
          7-day free trial on Pro and Team. Cancel any time from your billing portal — your access keeps working until the period ends.
        </p>
      </section>
      <MarketingFooter />
    </>
  );
}
