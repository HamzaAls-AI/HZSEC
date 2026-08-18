import { backend } from '@/lib/backend';
import { OpenPortalButton } from '@/components/OpenPortalButton';
import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton';
import Link from 'next/link';

export const metadata = { title: 'Billing — HZSec' };
export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  let me = null;
  try { me = await backend.me(); } catch {}
  const lic = me?.license ?? null;

  if (!lic) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription &amp; billing</h1>
        <p className="mt-2 text-muted">You don&apos;t have an active subscription yet.</p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          View pricing →
        </Link>
      </>
    );
  }

  const isTrialing  = lic.status === 'trialing';
  const daysLeft    = trialDaysLeft(lic.trialEndsAt);
  const canCancel   = lic.status === 'trialing' || lic.status === 'active';

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Subscription &amp; billing</h1>

      {/* Trial urgency banner */}
      {isTrialing && daysLeft !== null && daysLeft <= 3 && (
        <div className="rounded-xl border border-danger/30 bg-danger/8 px-5 py-4">
          <p className="text-sm font-medium text-danger">
            Trial ends in {daysLeft === 0 ? 'less than a day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
          </p>
          <p className="mt-1 text-xs text-muted">
            Your card on file will be charged after the trial. Update or cancel below.
          </p>
        </div>
      )}

      {/* Subscription details */}
      <div className="rounded-xl border border-border bg-panel divide-y divide-border">
        <Row label="Plan"    value={titleCase(lic.tier)} />
        <Row label="Status"  value={<StatusBadge status={lic.status} />} />
        {isTrialing && lic.trialEndsAt && (
          <Row label="Trial ends" value={fmtDate(lic.trialEndsAt)} />
        )}
        {!isTrialing && (
          <Row label="Renews" value={fmtDate(lic.currentPeriodEnd)} />
        )}
      </div>

      {/* Payment management */}
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Payment</h2>
        <p className="text-sm text-muted">
          Update your payment method, download invoices, or change your plan in the Stripe portal.
        </p>
        <div className="pt-1">
          <OpenPortalButton />
        </div>
      </div>

      {/* Cancel */}
      {canCancel && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Cancel</h2>
          <CancelSubscriptionButton periodEnd={lic.currentPeriodEnd ?? lic.trialEndsAt} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:   { label: 'Active',   cls: 'bg-ok/15 text-ok'         },
    trialing: { label: 'Trialing', cls: 'bg-accent/15 text-accent' },
    past_due: { label: 'Past due', cls: 'bg-warn/15 text-warn'     },
    canceled: { label: 'Canceled', cls: 'bg-danger/15 text-danger' },
  };
  const m = map[status] || { label: status, cls: 'bg-panel2 text-muted' };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>{m.label}</span>;
}

function titleCase(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
}
function trialDaysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}
