import Link from 'next/link';
import { backend, BackendError } from '@/lib/backend';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

export const metadata = { title: 'Dashboard — HZSec' };
export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const me = await safeMe();

  if (!me?.license) {
    return (
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to HZSec.</h1>
          <p className="mt-2 text-muted text-sm">
            You&apos;re signed in. Follow the steps below to run your first scan.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <Step n={1} done title="Create your account" desc="You're signed in and ready." />
          <Step
            n={2}
            title="Install the CLI"
            desc="Node 18+ required. Works on macOS, Linux, and Windows."
            code="npm install -g hzsec-cli"
          />
          <Step
            n={3}
            title="Run your first scan"
            desc="Point it at any project directory."
            code="hzsec scan ."
          />
          <Step
            n={4}
            title="Upgrade for AI features"
            desc="Get 1,000 managed AI messages/month with Pro — no Anthropic key needed."
            cta={{ label: 'View plans', href: '/pricing' }}
          />
        </div>

        {/* Upgrade nudge */}
        <div className="rounded-xl border border-border bg-panel p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="text-accent shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-medium text-text">Activate a 7-day free trial</div>
              <p className="mt-1 text-sm text-muted">
                Pro is $19/mo with 1,000 assistant messages. Cancel any time during the trial.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 transition-colors"
              >
                View pricing <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lic = me.license;
  const daysLeft = trialDaysLeft(lic.trialEndsAt);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <StatusBadge status={lic.status} />
      </div>

      {/* Trial countdown banners */}
      {lic.status === 'trialing' && daysLeft !== null && daysLeft <= 3 && (
        <div className="rounded-xl border border-danger/30 bg-danger/8 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-danger">
              Trial ends in {daysLeft === 0 ? 'less than a day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
            </p>
            <p className="text-xs text-muted mt-0.5">Your card on file will be charged when the trial ends.</p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0 rounded-full border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors">
            Manage →
          </Link>
        </div>
      )}
      {lic.status === 'trialing' && daysLeft !== null && daysLeft > 3 && daysLeft <= 7 && (
        <div className="rounded-xl border border-warn/30 bg-warn/8 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-warn">
            {daysLeft} days left in your trial — trial ends {fmtDate(lic.trialEndsAt)}.
          </p>
          <Link href="/dashboard/billing" className="shrink-0 text-xs text-warn hover:underline underline-offset-4 transition-colors">
            Manage →
          </Link>
        </div>
      )}
      {lic.status === 'past_due' && (
        <div className="rounded-xl border border-warn/30 bg-warn/8 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-warn font-medium">Payment past due — update your payment method to keep Pro.</p>
          <Link href="/dashboard/billing" className="shrink-0 rounded-full border border-warn/40 px-3 py-1.5 text-xs font-medium text-warn hover:bg-warn/10 transition-colors">
            Fix now →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Plan" value={titleCase(lic.tier)}>
          <Link href="/dashboard/billing" className="text-xs text-muted hover:text-text transition-colors">
            Manage billing →
          </Link>
        </Card>

        <Card title="License key" value={<span className="font-mono text-base">{lic.licenseKey}</span>}>
          <Link href="/dashboard/license" className="text-xs text-muted hover:text-text transition-colors">
            View + copy →
          </Link>
        </Card>

        <Card
          title="This month"
          value={`${me.usage.used} / ${me.usage.cap === 0 ? '∞' : me.usage.cap}`}
        >
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel2">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: pctWidth(me.usage.used, me.usage.cap) }}
            />
          </div>
          <Link href="/dashboard/usage" className="mt-3 inline-block text-xs text-muted hover:text-text transition-colors">
            See history →
          </Link>
        </Card>

        <Card title="Renews" value={fmtDate(lic.currentPeriodEnd)}>
          <span className="text-xs text-muted">
            {lic.trialEndsAt && new Date(lic.trialEndsAt) > new Date()
              ? `Trial ends ${fmtDate(lic.trialEndsAt)}`
              : 'Subscription'}
          </span>
        </Card>
      </div>

      {/* CLI quick start */}
      <div className="rounded-xl border border-border bg-panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <Terminal size={15} className="text-muted" />
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">CLI quick start</h2>
        </div>
        <ol className="space-y-4">
          {[
            { label: 'Install',       code: 'npm install -g hzsec-cli' },
            { label: 'Authenticate',  code: 'hzsec auth login'          },
            { label: 'Run a scan',    code: 'hzsec scan .'              },
          ].map(({ label, code }) => (
            <li key={label} className="flex items-center gap-4">
              <span className="shrink-0 text-xs text-muted w-20">{label}</span>
              <pre className="flex-1 overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-4 py-2 font-mono text-xs text-[#c9d1d9]">
                <code>{code}</code>
              </pre>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted">
          Need the full guide?{' '}
          <Link href="/docs/quickstart" className="text-accent hover:underline underline-offset-4">
            Read the quickstart →
          </Link>
        </p>
      </div>

      {me.dev && (
        <div className="rounded-md border border-warn/40 bg-warn/10 px-4 py-2 text-xs text-warn">
          dev mode: backend has no DB — data is synthesised. Run
          <code className="mx-1 rounded bg-bg px-1">scripts/setup-local-postgres.sh</code>
          in hzsec-backend to wire real persistence.
        </div>
      )}
    </div>
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
function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '—';
}
function trialDaysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}
function pctWidth(used: number, cap: number) {
  return cap === 0 ? '0%' : `${Math.min(100, (used / cap) * 100)}%`;
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

function Card({ title, value, children }: {
  title: string; value: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-2 text-xl font-medium text-text">{value}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Step({ n, done = false, title, desc, code, cta }: {
  n: number;
  done?: boolean;
  title: string;
  desc?: string;
  code?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className={`flex gap-4 rounded-xl border p-5 transition-colors ${
      done ? 'border-ok/20 bg-ok/5' : 'border-border bg-panel'
    }`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        done ? 'bg-ok/20 text-ok' : 'bg-panel2 text-muted'
      }`}>
        {done ? '✓' : n}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? 'text-ok' : 'text-text'}`}>{title}</div>
        {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
        {code && (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-4 py-2.5 font-mono text-xs text-[#c9d1d9]">
            <code>{code}</code>
          </pre>
        )}
        {cta && (
          <Link
            href={cta.href}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline underline-offset-4"
          >
            {cta.label} <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}
