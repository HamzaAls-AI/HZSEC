import { backend } from '@/lib/backend';
import { LicenseKeyView } from '@/components/LicenseKeyView';
import Link from 'next/link';

export const metadata = { title: 'License — HZSec' };
export const dynamic = 'force-dynamic';

export default async function LicensePage() {
  let lic = null;
  try {
    const me = await backend.me();
    lic = me.license;
  } catch {}

  if (!lic) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">License key</h1>
        <p className="mt-3 text-muted text-sm">
          Your license key appears after you start a paid plan.
        </p>
        <Link href="/pricing" className="mt-5 inline-block text-sm text-accent hover:underline underline-offset-4">
          View pricing →
        </Link>
      </>
    );
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">License key</h1>
        <p className="mt-2 text-sm text-muted">
          Paste this into <strong className="text-text">HZSec → Settings → License</strong> to activate Pro features.
          The app verifies it in the background every 24 hours.
        </p>
      </div>

      {/* Key + deep link */}
      <div className="space-y-3">
        <LicenseKeyView licenseKey={lic.licenseKey} />
        <a
          href={`hzsec://license/${lic.licenseKey}`}
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
        >
          <span aria-hidden="true">⚡</span>
          Open in HZSec — auto-fills your key
        </a>
        <p className="text-xs text-muted/60">
          Requires HZSec to be installed. If nothing happens,{' '}
          <Link href="/download" className="text-muted hover:text-accent transition-colors underline underline-offset-4">
            download the app first
          </Link>
          .
        </p>
      </div>

      {/* Downloads */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Download HZSec</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DownloadCard
            label="macOS (Apple Silicon)"
            sub="HZSec-arm64.dmg"
            href="/api/download/mac"
          />
          <DownloadCard
            label="Windows"
            sub="HZSec-Setup.exe"
            href="/api/download/windows"
          />
        </div>
        <p className="text-xs text-muted/70">
          Unsigned build — macOS: right-click HZSec.app → <strong className="text-text">Open</strong> to bypass Gatekeeper.
          Windows: <strong className="text-text">More info → Run anyway</strong> if SmartScreen appears.
        </p>
      </div>

      {/* Quick steps */}
      <div className="rounded-xl border border-border bg-panel p-6 space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Getting started</h2>
        <ol className="space-y-3 text-sm text-muted">
          {[
            'Download and install HZSec from above.',
            'Click "Open in HZSec" above, or go to Settings → License and paste your key.',
            'Pro features activate immediately — no restart needed.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-panel2 text-[10px] font-mono text-muted">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function DownloadCard({ label, sub, href }: { label: string; sub: string; href: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3.5 hover:border-accent/40 transition-colors"
    >
      <div>
        <div className="text-sm font-medium text-text group-hover:text-accent transition-colors">{label}</div>
        <div className="mt-0.5 font-mono text-xs text-muted">{sub}</div>
      </div>
      <span className="text-muted group-hover:text-accent transition-colors text-lg">↓</span>
    </a>
  );
}
