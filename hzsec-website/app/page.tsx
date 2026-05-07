import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'HZSec — High-Performance Local Security Scanning',
  description: 'Deep-scan code locally with automated, developer-first security analysis. No cloud uploads, no repo access needed.',
};

export default function Landing() {
  return (
    <>
      <MarketingHeader />

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tighter sm:text-7xl">
            Security analysis, <br />
            <span className="text-accent underline decoration-4 underline-offset-8">local-first.</span>
          </h1>
          <p className="mt-8 text-xl text-muted leading-relaxed">
            HZSec runs deep security analysis directly on your machine. 
            Identify vulnerabilities, misconfigurations, and secret leaks in seconds 
            without ever uploading your code to a third-party server.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/download" className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-white hover:bg-accent/90">
              Download CLI & App
            </Link>
            <Link href="/guide" className="rounded-md border border-border px-6 py-3 text-white hover:bg-panel">
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Live Proof Component (Mock Dashboard) */}
      <section className="border-y border-border bg-panel py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold mb-8">Scan Results in Action</h2>
          <div className="rounded-xl border border-border bg-bg p-8 font-mono text-sm shadow-xl">
            <div className="flex gap-2 text-red-500 mb-2"><span>[CRITICAL]</span> <span>Unsafe DOM injection in `dashboard.js` (line 42)</span></div>
            <div className="flex gap-2 text-yellow-500 mb-2"><span>[HIGH]</span> <span>Hardcoded AWS secret in `config.ts` (line 12)</span></div>
            <div className="flex gap-2 text-blue-400"><span>[INFO]</span> <span>Scan complete: 42 files analyzed in 0.4s</span></div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 sm:grid-cols-3">
          <Feature title="Automated Static Analysis" body="Native detectors for secrets, XSS, and misconfigurations." />
          <Feature title="Sub-second Scans" body="Optimized for huge codebases. Instant feedback loop." />
          <Feature title="Privacy Guaranteed" body="Code never leaves your local machine. Period." />
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function Feature({ title, body }: { title: string; body: string; }) {
  return (
    <div className="group rounded-xl border border-border bg-panel p-8 transition-all hover:border-accent">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed">{body}</p>
    </div>
  );
}
