import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { DownloadSection } from '@/components/DownloadSection';
import Link from 'next/link';

export const metadata = {
  title: 'Download HZSec',
  description: 'Download the HZSec desktop app for macOS and Windows.',
};

export default function DownloadPage() {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen pt-[120px] pb-24 px-[6%]">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[clamp(30px,4vw,44px)] font-light tracking-tight text-text leading-[1.05] mb-4">
            Download HZSec
          </h1>
          <p className="text-muted mb-12 max-w-[520px]">
            Full GUI with AI assistant, live monitor, compliance mapping, and scan history.
            Available for macOS and Windows.
          </p>

          <DownloadSection />

          <div className="mt-12 rounded-2xl border border-border bg-panel p-7">
            <h2 className="text-sm font-semibold text-text mb-1">Already have a Pro trial?</h2>
            <p className="text-sm text-muted mb-4">
              After installing, go to <strong className="text-text">Settings → License</strong> and
              paste your license key. Pro features activate automatically.
            </p>
            <Link
              href="/dashboard/license"
              className="text-sm text-accent hover:underline underline-offset-4"
            >
              Find my license key →
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted">
            Prefer the CLI?{' '}
            <Link href="/docs/install" className="text-accent hover:underline underline-offset-4">
              See all installation options →
            </Link>
          </p>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
