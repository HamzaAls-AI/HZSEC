import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
// Had to fallback to explicitly supported icons from types.d.ts to fix build.

export const metadata = {
  title: 'Download HZSec | Local-First Security',
  description: 'Download the HZSec desktop app for high-precision, local-first code security.'
};

export default function DownloadPage() {
  return (
    <>
      <MarketingHeader />
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-6">
          Ready for secure code
        </h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          HZSec runs entirely on your local machine. No repo uploads, no cloud-processing, just actionable security intelligence.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <DownloadCard
            os="macOS"
            body="Universal build for Apple Silicon. Signed and notarized."
            href="https://github.com/HamzaAls-AI/HZSEC/releases/latest/download/HZSec-1.0.0-arm64.dmg"
            cta="Download for macOS"
          />
          <DownloadCard
            os="Windows"
            body="Standard MSI installer for Windows 10/11. Authentically signed."
            href="https://github.com/HamzaAls-AI/HZSEC/releases/latest/download/HZSec-Setup-1.0.0.exe"
            cta="Download for Windows"
          />
        </div>

        <div className="rounded-xl border border-border bg-black/40 p-8 text-left">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-accent" size={24} />
            <h2 className="text-xl font-semibold">Deployment Quick-Start</h2>
          </div>
          <ol className="space-y-6 text-sm text-muted-foreground">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-black font-semibold text-white">1</span>
              <div>
                <p className="font-medium text-white">Download & Install</p>
                <p>Run the installer. HZSec will initialize in your local Applications folder.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-black font-semibold text-white">2</span>
              <div>
                <p className="font-medium text-white">Launch & Authenticate</p>
                <p>Open HZSec and sign in with your HZSec web account to pull your license keys.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-black font-semibold text-white">3</span>
              <div>
                <p className="font-medium text-white">Run your first scan</p>
                <p>Point at your local path and start analyzing.</p>
              </div>
            </li>
          </ol>
          <div className="mt-8 flex gap-4">
            <Link href="/guide" className="rounded-md border border-neutral-700 bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-800 transition">
              Read the full guide
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}

function DownloadCard({ os, body, href, cta }: { os: string; body: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-6 transition hover:border-accent group">
      <div className="mb-4">
        <ShieldCheck className="group-hover:text-accent transition text-neutral-500" size={32} />
      </div>
      <h2 className="text-lg font-medium text-white">{os}</h2>
      <p className="mt-2 text-sm text-neutral-400 mb-6">{body}</p>
      <a href={href} className="block w-full rounded-md bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent/90 transition">
        {cta}
      </a>
    </div>
  );
}
