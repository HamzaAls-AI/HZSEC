import Link from 'next/link';
import { backend, BackendError } from '@/lib/backend';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata = { title: 'Dashboard — HZSec' };

export default async function DashboardHome() {
  const me = await safeMe();

  // Not subscribed yet — render the "subscribe" CTA. (Backend returns
  // license: null for signed-in users with no subscription.)
  if (!me?.license) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to HZSec.</h1>
        <p className="mt-2 text-muted">
          You're signed in but not on a paid plan yet. Pick one to unlock the
          managed assistant.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-panel p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="text-accent" size={22} />
            <div>
              <div className="font-medium">Start a 7-day free trial.</div>
              <p className="mt-1 text-sm text-muted">
                Pro is $19/mo with 1,000 assistant messages. Team is $39/seat
                with 5,000 each. Cancel any time during the trial.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
              >
                See pricing <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const lic = me.license;
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <StatusBadge status={lic.status} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Plan" value={titleCase(lic.tier)}>
          <Link href="/dashboard/billing" className="text-xs text-muted hover:text-text">
            Manage billing →
          </Link>
        </Card>

        <Card title="License key" value={<span className="font-mono text-base">{lic.licenseKey}</span>}>
          <Link href="/dashboard/license" className="text-xs text-muted hover:text-text">
            View + copy →
          </Link>
        </Card>

        <Card
          title="This month"
          value={`${me.usage.used} / ${me.usage.cap === 0 ? '∞' : me.usage.cap}`}
        >
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel2">
            <div
              className="h-full bg-accent"
              style={{ width: pctWidth(me.usage.used, me.usage.cap) }}
            />
          </div>
          <Link href="/dashboard/usage" className="mt-3 inline-block text-xs text-muted hover:text-text">
            See history →
          </Link>
        </Card>

        <Card title="Renews" value={fmtDate(lic.currentPeriodEnd)}>
          <span className="text-xs text-muted">{lic.trialEndsAt && new Date(lic.trialEndsAt) > new Date() ? `Trial ends ${fmtDate(lic.trialEndsAt)}` : 'Subscription'}</span>
        </Card>
      </div>

      {me.dev && (
        <div className="mt-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-2 text-xs text-warn">
          dev mode: backend has no DB, this data is synthesised. Run
          <code className="mx-1 rounded bg-bg px-1">scripts/setup-local-postgres.sh</code>
          in hzsec-backend to wire real persistence.
        </div>
      )}
    </>
  );
}

async function safeMe() {
  try { return await backend.me(); }
  catch (err) {
    if (err instanceof BackendError && err.status === 401) return null;
    console.error('[dashboard] /api/me failed:', err);
    return null;
  }
}

function titleCase(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString() : '—'; }
function pctWidth(used: number, cap: number) { return cap === 0 ? '0%' : `${Math.min(100, (used / cap) * 100)}%`; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:   { label: 'Active',   cls: 'bg-ok/15 text-ok'         },
    trialing: { label: 'Trialing', cls: 'bg-accent/15 text-accent' },
    past_due: { label: 'Past due', cls: 'bg-warn/15 text-warn'     },
    canceled: { label: 'Canceled', cls: 'bg-danger/15 text-danger' }
  };
  const m = map[status] || { label: status, cls: 'bg-panel2 text-muted' };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs ${m.cls}`}>{m.label}</span>;
}

function Card({
  title, value, children
}: {
  title: string; value: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-2 text-xl font-medium">{value}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
