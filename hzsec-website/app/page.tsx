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

      {/* Pillar Section — Scan / Defend / Govern */}
      <section className="py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">

          {/* Centered header */}
          <div className="max-w-[640px] mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Built for Developers
            </div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              One app.<br />
              <span className="text-accent">Scan, defend, govern.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              HZSec covers every stage of local security work — from finding what&apos;s
              wrong, to fixing it with AI that knows your code, to proving compliance
              when the audit comes.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-6">

            {/* Pillar 1 — Scan */}
            <div className="rounded-2xl border border-border bg-panel p-8 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4 pb-2 border-b border-border">
                Scan
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Find what&apos;s already broken.</h3>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                Six scan modes covering forty-plus detection patterns — secrets, configs,
                vulnerable code, hardening gaps, web exposure, system risks. Runs in seconds,
                entirely on your machine.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Security Scanner (6 modes)',
                  'Auto-fixes for common issues',
                  'Score history & trend chart',
                  'Audit log of every scan',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent flex-shrink-0 text-xs mt-0.5">✓</span>
                    <span className="text-sm text-text">{f}</span>
                  </li>
                ))}
              </ul>
              {/* TODO: build /product/scan page */}
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all">
                Explore scanning →
              </a>
            </div>

            {/* Pillar 2 — Defend */}
            <div className="rounded-2xl border border-border bg-panel p-8 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4 pb-2 border-b border-border">
                Defend
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Fix what AI can see clearly.</h3>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                An AI assistant that&apos;s already read your code, matched it against ten
                real-world breaches, and checked it against live CVE data — before you ask
                the first question.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'AI Assistant with codebase context',
                  'Live Monitor for files & folders',
                  'Real breach case matching',
                  'Live CVE database (CISA + NVD)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent flex-shrink-0 text-xs mt-0.5">✓</span>
                    <span className="text-sm text-text">{f}</span>
                  </li>
                ))}
              </ul>
              {/* TODO: build /product/defend page */}
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all">
                Explore defending →
              </a>
            </div>

            {/* Pillar 3 — Govern */}
            <div className="rounded-2xl border border-border bg-panel p-8 flex flex-col hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4 pb-2 border-b border-border">
                Govern
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Prove you&apos;re compliant.</h3>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                Map every finding to OWASP, CIS, and SOC 2. Track your fix history. Surface
                long-open or recurring issues before they become an audit problem.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'OWASP / CIS / SOC 2 mapping',
                  'Fix memory & recurrence tracking',
                  'Compliance gap calculations',
                  'Agentic fixes with diff review',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-accent flex-shrink-0 text-xs mt-0.5">✓</span>
                    <span className="text-sm text-text">{f}</span>
                  </li>
                ))}
              </ul>
              {/* TODO: build /product/govern page */}
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all">
                Explore governance →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Breach Cases — "Why this matters" */}
      <section className="bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">

          {/* Left-aligned header */}
          <div className="max-w-[700px] mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 font-mono text-[11px] uppercase tracking-widest text-red-500 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
              Why This Matters
            </div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              These breaches started<br />
              with issues HZSec detects.
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Every breach case is embedded in HZSec&apos;s intelligence layer. When the
              scanner finds a matching pattern, the assistant tells you exactly what
              happened and how fast it was exploited.
            </p>
          </div>

          {/* 2×2 breach grid */}
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">

            {/* Case 1 — Uber */}
            <div className="rounded-2xl border border-border bg-bg p-7 hover:border-red-500/30 transition-all duration-200">
              <h3 className="text-lg font-bold text-text mb-2">Uber — AWS Keys in GitHub (2022)</h3>
              <p className="text-sm text-muted mb-5 font-mono">57 million records exposed · $148M settlement</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono font-medium">
                  ⏱ &lt; 10 min to exploit
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-medium">
                  HZSec detects: exposed API keys
                </span>
              </div>
            </div>

            {/* Case 2 — Equifax */}
            <div className="rounded-2xl border border-border bg-bg p-7 hover:border-red-500/30 transition-all duration-200">
              <h3 className="text-lg font-bold text-text mb-2">Equifax — Disabled TLS Monitoring (2017)</h3>
              <p className="text-sm text-muted mb-5 font-mono">147 million records · $575M FTC settlement</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono font-medium">
                  ⏱ 78 days undetected
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-medium">
                  HZSec detects: SSL/TLS disabled
                </span>
              </div>
            </div>

            {/* Case 3 — Verkada */}
            <div className="rounded-2xl border border-border bg-bg p-7 hover:border-red-500/30 transition-all duration-200">
              <h3 className="text-lg font-bold text-text mb-2">Verkada — Hardcoded Admin Password (2021)</h3>
              <p className="text-sm text-muted mb-5 font-mono">150,000 cameras compromised</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono font-medium">
                  ⏱ Immediate access
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-medium">
                  HZSec detects: hardcoded credentials
                </span>
              </div>
            </div>

            {/* Case 4 — Log4Shell */}
            <div className="rounded-2xl border border-border bg-bg p-7 hover:border-red-500/30 transition-all duration-200">
              <h3 className="text-lg font-bold text-text mb-2">Log4Shell — Dynamic Execution (2021)</h3>
              <p className="text-sm text-muted mb-5 font-mono">Hundreds of millions of systems vulnerable</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono font-medium">
                  ⏱ &lt; 2 hrs after disclosure
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-medium">
                  HZSec detects: unsafe eval/exec patterns
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
