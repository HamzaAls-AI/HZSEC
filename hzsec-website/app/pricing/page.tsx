import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PricingTable } from '@/components/PricingTable';
import { DownloadSection } from '@/components/DownloadSection';

export const metadata = {
  title: 'Pricing — HZSec',
  description: 'Free forever for solo developers. Upgrade to Pro or Team when you need managed AI or shared billing.',
};

export default function Pricing() {
  return (
    <>
      <MarketingHeader />

      {/* ── Header ── */}
      <section className="pt-[140px] pb-8 px-[6%] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
          Simple pricing
        </div>
        <h1 className="font-light tracking-tight text-[clamp(36px,4vw,56px)] text-text leading-[1.05]">
          Free to start.<br />
          <span className="bg-gradient-to-r from-accent to-violet-400 bg-clip-text text-transparent">
            Upgrade when you&apos;re ready.
          </span>
        </h1>
        <p className="text-lg text-muted max-w-[520px] mx-auto mt-5 leading-relaxed">
          All scanning runs locally — no account needed for your first scan.
          Upgrade for managed AI and team features.
        </p>
      </section>

      {/* ── Pricing table ── */}
      <section className="px-[6%] pb-24">
        <div className="mx-auto max-w-[1000px]">
          <PricingTable />

          <p className="mt-6 text-center text-xs text-muted font-mono">
            7-day free trial on Pro and Team · Cancel any time · All prices in USD
          </p>
        </div>
      </section>

      {/* ── Download section ── */}
      <section id="download" className="border-t border-border bg-panel py-20 px-[6%]">
        <div className="mx-auto max-w-[1000px]">

          <h2 className="font-light tracking-tight text-[clamp(24px,3vw,36px)] text-text mb-2">
            Get started in 60 seconds
          </h2>
          <p className="text-muted text-sm mb-10">No account required for your first scan.</p>

          {/* CLI */}
          <div className="rounded-2xl border border-accent/30 bg-bg p-7 mb-6">
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                Fastest way in
              </span>
            </div>
            <h3 className="font-medium text-text mb-1">CLI via npm</h3>
            <p className="text-sm text-muted mb-5">
              Node 18+. Works on macOS, Linux, and Windows. No account needed for your first scan.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-[#0d1117] px-6 py-5 font-mono text-sm text-[#c9d1d9] leading-relaxed mb-5">
              <code>{`npm install -g hzsec-cli

# Run your first scan
hzsec scan ./your-project`}</code>
            </pre>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/docs/quickstart" className="text-accent hover:underline">
                Quickstart guide →
              </Link>
              <span className="text-border" aria-hidden="true">·</span>
              <a
                href="https://github.com/HamzaAls-AI/HZSEC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Desktop app */}
          <DownloadSection />

          {/* Quick-start steps */}
          <div className="rounded-2xl border border-border bg-panel/50 p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-accent" size={20} />
              <h3 className="font-medium text-text">Desktop app quick-start</h3>
            </div>
            <ol className="space-y-5 text-sm text-muted">
              {[
                { n: '1', title: 'Download & install', body: 'Open the .dmg, drag HZSec to /Applications, and launch it.' },
                { n: '2', title: 'Sign in (optional)', body: 'Create a free account to unlock the AI assistant and persist scan history. Scanning works without an account.' },
                { n: '3', title: 'Run your first scan', body: 'Click New Scan, choose a local folder, and click Start Scan. Most projects complete in under 30 seconds.' },
              ].map(({ n, title, body }) => (
                <li key={n} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg font-mono text-xs text-text">
                    {n}
                  </span>
                  <div>
                    <p className="font-medium text-text mb-0.5">{title}</p>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <Link href="/docs" className="text-sm text-accent hover:underline">
                Full documentation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-[6%]">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="font-light tracking-tight text-2xl text-text mb-8">Common questions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                q: 'Do I need my own Anthropic key?',
                a: 'Only on Free. Pro and Team include a managed key so there\'s no setup.',
              },
              {
                q: 'What does "up to 5 developers" mean for Team?',
                a: 'One Team subscription covers 5 seats. Need more? Email us and we\'ll sort it out.',
              },
              {
                q: 'Can I cancel any time?',
                a: 'Yes — from your billing portal. Your access keeps working until the end of the billing period.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-panel p-6">
                <h3 className="text-sm font-medium text-text mb-2">{q}</h3>
                <p className="text-sm text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
