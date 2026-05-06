import { backend } from '@/lib/backend';
import { LicenseKeyView } from '@/components/LicenseKeyView';

export const metadata = { title: 'License — HZSec' };
export const dynamic = 'force-dynamic';

export default async function LicensePage() {
  let lic = null;
  try {
    const me = await backend.me();
    lic = me.license;
  } catch { /* fall through to no-license state */ }

  if (!lic) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">License key</h1>
          <p className="mt-3 text-muted">
            Your license key appears after you start a paid plan.
          </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">License key</h1>
      <p className="mt-2 text-muted">
        Paste this into HZSec → Settings → Account to authenticate the desktop
        app. The desktop app caches it for 24h between checks.
      </p>

      <div className="mt-8">
        <LicenseKeyView licenseKey={lic.licenseKey} />
      </div>

      <h2 className="mt-12 text-lg font-medium">Downloads</h2>
      <p className="mt-1 text-sm text-muted">
        macOS, Windows, and Linux builds. Sign in on first launch — the app
        offers to populate this license key automatically via deep link.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <DownloadStub label="macOS (Apple Silicon)" />
        <DownloadStub label="macOS (Intel)" />
        <DownloadStub label="Windows" />
      </div>
    </>
  );
}

function DownloadStub({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-panel px-4 py-3 text-sm">
      <div className="text-text">{label}</div>
      <div className="mt-1 text-xs text-muted">Coming with first release</div>
    </div>
  );
}
