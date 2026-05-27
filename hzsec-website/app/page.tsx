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
      <section className="relative min-h-screen flex items-center pt-[204px] pb-20 px-[6%] overflow-hidden">
        {/* Glow orbs — decorative, always behind content */}
        <div className="absolute -top-52 -right-24 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-24 -left-36 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-[1180px] w-full grid gap-20 min-[900px]:grid-cols-[5fr_6fr] items-center">
          {/* Left: copy */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Local-First Security
            </div>

            {/* Headline */}
            <h1
              id="main"
              className="font-sans text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5"
            >
              Security that runs<br />
              <span className="text-accent">where your code lives.</span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-muted leading-relaxed max-w-[480px] mb-8">
              HZSec is a local security platform for developers. Scan your project, fix
              what&apos;s broken, and let an AI assistant trained on real breach history
              watch your back — without a single line of code leaving your machine.
            </p>

            {/* Trust signals row */}
            <div className="flex items-center gap-3 font-mono text-xs text-muted mb-8 flex-wrap">
              <span>100% local processing</span>
              <span className="opacity-[0.35]">·</span>
              <span>Mac + Windows</span>
              <span className="opacity-[0.35]">·</span>
              <span>Free tier, no card</span>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-lg font-medium text-base hover:bg-accent/90 transition-all hover:-translate-y-px"
              >
                Get early access →
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 border border-border text-text px-8 py-3.5 rounded-lg font-medium text-base hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Note */}
            <p className="font-mono text-xs text-muted">
              Early access members get Pro free for 3 months.
            </p>
          </div>

          {/* Right: App mockup — always dark, this is the product UI */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
            {/* Window chrome */}
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Security Platform</span>
            </div>

            {/* Sidebar + main */}
            <div className="grid h-[340px]" style={{ gridTemplateColumns: '130px 1fr' }}>
              {/* Sidebar */}
              <div className="bg-[#111d35] border-r border-[rgba(56,189,248,0.12)] p-3 flex flex-col gap-0.5">
                <div className="font-mono text-[11px] font-bold px-2 py-1.5 mb-2">
                  <span className="text-white">HZ</span>
                  <span className="text-[#38bdf8]">Sec</span>
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">
                  ▣ Scan Center
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◈ Assistant</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">≡ Audit Log</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>

              {/* Main panel */}
              <div className="p-3.5 overflow-hidden">
                {/* Security posture */}
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-lg px-3 py-2.5 mb-2.5">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#94a3b8] mb-1.5">
                    Security Posture
                  </div>
                  <div
                    className="relative h-1.5 rounded-full mb-1.5"
                    style={{ background: 'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e)' }}
                  >
                    <div className="absolute top-1/2 left-[78%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0f172a] border-2 border-white" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.25)]">
                      Score: 78
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]">
                      LOW THREAT
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.25)]">
                      OWASP 71%
                    </span>
                  </div>
                </div>

                {/* Findings */}
                <div className="flex flex-col gap-1.5">
                  <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[rgba(248,113,113,0.15)] text-red-400 flex-shrink-0">
                      CRITICAL
                    </span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-85">AWS access key exposed in config</span>
                  </div>
                  <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[rgba(251,146,60,0.15)] text-orange-400 flex-shrink-0">
                      HIGH
                    </span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-85">SSL/TLS disabled in server config</span>
                  </div>
                  <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[rgba(251,146,60,0.15)] text-orange-400 flex-shrink-0">
                      HIGH
                    </span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-85">Wildcard CORS policy detected</span>
                  </div>
                  <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-yellow-400 flex-shrink-0">
                      MEDIUM
                    </span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-85">Debug mode enabled in production</span>
                  </div>
                </div>
              </div>
            </div>
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
