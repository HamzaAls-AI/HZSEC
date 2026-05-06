import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Download HZSec',
  description: 'Get the HZSec desktop app and follow the recommended setup flow.'
};

export default function DownloadPage() {
  return (
    <>
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-muted">Download</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Get the desktop app and start scanning locally.</h1>
          <p className="mt-4 text-muted">
            Desktop builds are published through GitHub Releases. Use the latest
            release for your operating system, then follow the setup guide.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card title="Desktop builds" body="macOS, Windows, and Linux builds are published from tagged releases." />
          <Card title="Secure workflow" body="Keep scanning local, then open the dashboard only when you need billing or license controls." />
          <Card title="Simple install" body="Download, install, sign in, and run your first scan in a few minutes." />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-panel/40 p-6">
          <h2 className="text-lg font-medium">Start here</h2>
          <p className="mt-2 text-sm text-muted">
            Open the latest release page, then use the guide to understand the app flow.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://github.com/HamzaAls-AI/HZSEC/releases/latest"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90"
            >
              Open latest release <ArrowRight size={14} />
            </a>
            <Link href="/guide" className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:text-text">
              View the setup guide
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}

function Card({
  title, body
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <ShieldCheck className="text-accent" size={20} />
      <h2 className="mt-4 text-lg font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
