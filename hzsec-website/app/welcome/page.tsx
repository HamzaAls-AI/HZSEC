import Link from 'next/link';
import { Check, Download, KeyRound, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { LicenseKeyView } from '@/components/LicenseKeyView';
import { WelcomePoller } from '@/components/WelcomePoller';
import { backend, BackendError } from '@/lib/backend';

export const metadata = { title: 'Welcome to Pro — HZSec' };
export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const me = await safeMe();
  const lic = me?.license ?? null;

  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen pt-[120px] pb-24 px-[6%]">
        <div className="mx-auto max-w-[680px]">
          {!lic ? (
            <NoLicense />
          ) : (
            <ActiveLicense
              licenseKey={lic.licenseKey}
              status={lic.status}
              trialEndsAt={lic.trialEndsAt}
              tier={lic.tier}
            />
          )}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

function NoLicense() {
  return (
    <div className="text-center space-y-6">
      <WelcomePoller />
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-border bg-panel">
        <Loader2 size={24} className="text-muted animate-spin" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setting up your Pro trial…</h1>
        <p className="mt-2 text-muted text-sm">
          Stripe is activating your subscription. This takes just a moment.
        </p>
      </div>
      <p className="text-xs text-muted">
        Taking too long?{' '}
        <Link href="/dashboard/billing" className="text-accent hover:underline underline-offset-4">
          Check your billing status
        </Link>{' '}
        or{' '}
        <a href="mailto:support@hzsec.io" className="text-accent hover:underline underline-offset-4">
          contact support
        </a>
        .
      </p>
    </div>
  );
}

function ActiveLicense({
  licenseKey,
  status,
  trialEndsAt,
  tier,
}: {
  licenseKey: string;
  status: string;
  trialEndsAt: string | null;
  tier: string;
}) {
  const isTrialing = status === 'trialing';
  const trialEnd   = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : null;

  return (
    <div className="space-y-10">
      {/* Success banner */}
      <div className="rounded-2xl border border-ok/30 bg-ok/8 px-7 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok/20">
            <Check size={18} className="text-ok" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">
              {isTrialing
                ? 'Your 7-day Pro trial is active.'
                : `Your ${titleCase(tier)} subscription is active.`}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isTrialing && trialEnd
                ? `Trial ends ${trialEnd} — no charge until then. Cancel any time.`
                : 'All Pro features are unlocked.'}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-6">
        <Step
          n={1}
          icon={<Download size={16} />}
          title="Download HZSec"
          desc="Choose your platform. The app includes the AI assistant, live monitor, and compliance mapping."
        >
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/api/download/mac"
              className="flex-1 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Download for macOS
            </a>
            <a
              href="/api/download/windows"
              className="flex-1 rounded-full border border-border px-5 py-2.5 text-center text-sm font-medium text-muted hover:border-accent hover:text-accent transition-colors"
            >
              Download for Windows
            </a>
          </div>
          <p className="mt-3 text-xs text-muted/70">
            Unsigned build — macOS: right-click HZSec.app → <strong className="text-text">Open</strong> to bypass Gatekeeper.
            Windows: click <strong className="text-text">More info → Run anyway</strong> if SmartScreen appears.
          </p>
        </Step>

        <Step
          n={2}
          icon={<KeyRound size={16} />}
          title="Enter your license key"
          desc="Open HZSec → Settings → License and paste this key. The app verifies it against your account."
        >
          <div className="mt-4">
            <LicenseKeyView licenseKey={licenseKey} />
          </div>
          <p className="mt-2 text-xs text-muted">
            You can always find this key in your{' '}
            <Link href="/dashboard/license" className="text-accent hover:underline underline-offset-4">
              license dashboard
            </Link>
            .
          </p>
        </Step>

        <Step
          n={3}
          icon={<Zap size={16} />}
          title="Pro features activate automatically"
          desc="The AI assistant (no API key needed), per-finding remediation playbooks, and email support all unlock the moment the key is accepted."
        />
      </ol>

      {/* Dashboard CTA */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          Go to your dashboard <ArrowRight size={14} />
        </Link>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent transition-colors"
        >
          Quickstart guide
        </Link>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Step({
  n, icon, title, desc, children,
}: {
  n: number; icon: React.ReactNode; title: string; desc: string; children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-5 rounded-2xl border border-border bg-panel p-6">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </div>
        <span className="text-xs font-mono text-muted">{n}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">{desc}</p>
        {children}
      </div>
    </li>
  );
}

async function safeMe() {
  try { return await backend.me(); }
  catch (err) {
    if (err instanceof BackendError && err.status === 401) return null;
    console.error('[welcome] /api/me failed:', err);
    return null;
  }
}

function titleCase(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
