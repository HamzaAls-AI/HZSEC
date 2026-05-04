import { backend } from '@/lib/backend';
import { OpenPortalButton } from '@/components/OpenPortalButton';
import Link from 'next/link';

export const metadata = { title: 'Billing — HZSec' };

export default async function BillingPage() {
  let lic = null;
  try { lic = (await backend.me()).license; } catch {}

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Subscription &amp; billing</h1>

      {lic ? (
        <>
          <p className="mt-2 text-muted">
            Your subscription is managed in Stripe&apos;s Customer Portal —
            update payment method, cancel, or download invoices there.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="Plan"            value={titleCase(lic.tier)} />
            <Field label="Status"          value={titleCase(lic.status)} />
            <Field label="Current period"  value={fmtDate(lic.currentPeriodEnd)} />
            <Field label="Trial ends"      value={fmtDate(lic.trialEndsAt)} />
          </dl>

          <div className="mt-8">
            <OpenPortalButton />
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-muted">
            You don&apos;t have an active subscription. Pick a plan to start.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
          >
            See pricing
          </Link>
        </>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-panel px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function titleCase(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString() : '—'; }
