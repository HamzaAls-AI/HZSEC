import Link from 'next/link';
import { Search, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { DemoModal } from '@/components/DemoModal';

export const metadata = {
  title: 'HZSec — Local Security Platform for Developers',
  description: 'Scan your codebase for secrets, misconfigs, and vulnerabilities. Fix with an AI assistant trained on real breach history. Nothing leaves your machine.',
  openGraph: {
    title: 'HZSec — Local Security Platform for Developers',
    description: 'Scan your codebase for secrets, misconfigs, and vulnerabilities. Fix with an AI assistant trained on real breach history. Nothing leaves your machine.',
    url: 'https://hzsec.io',
    siteName: 'HZSec',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HZSec — Local Security Platform for Developers',
    description: 'Scan your codebase for secrets, misconfigs, and vulnerabilities. Fix with an AI assistant trained on real breach history. Nothing leaves your machine.',
    creator: '@hzsec',
  },
};

const PILLARS = [
  {
    n: '01',
    label: 'Scan',
    Icon: Search,
    headline: "Find what's already broken.",
    body: "Six scan modes covering forty-plus detection patterns — secrets, configs, vulnerable code, hardening gaps, web exposure, system risks. Runs in seconds, entirely on your machine.",
    features: ['Security Scanner (6 modes)', 'Auto-fixes for common issues', 'Score history & trend chart', 'Audit log of every scan'],
    cta: 'Explore scanning',
    href: '/product/scan',
  },
  {
    n: '02',
    label: 'Defend',
    Icon: ShieldCheck,
    headline: "Fix what AI can see clearly.",
    body: "An AI assistant that's already read your code, matched it against ten real-world breaches, and checked it against live CVE data — before you ask the first question.",
    features: ['AI Assistant with codebase context', 'Live Monitor for files & folders', 'Real breach case matching', 'Live CVE database (CISA + NVD)'],
    cta: 'Explore defending',
    href: '/product/defend',
  },
  {
    n: '03',
    label: 'Govern',
    Icon: ClipboardCheck,
    headline: "Prove you're compliant.",
    body: "Map every finding to OWASP, CIS, and SOC 2. Track your fix history. Surface long-open or recurring issues before they become an audit problem.",
    features: ['OWASP / CIS / SOC 2 mapping', 'Fix memory & recurrence tracking', 'Compliance gap calculations', 'Agentic fixes with diff review'],
    cta: 'Explore governance',
    href: '/product/govern',
  },
];

const BREACH_CASES = [
  {
    title: 'Uber — AWS Keys in GitHub',
    year: '2022',
    stat: '$148M settlement',
    sub: '57 million records exposed',
    time: '< 10 min to exploit',
    detect: 'exposed API keys',
  },
  {
    title: 'Equifax — Disabled TLS Monitoring',
    year: '2017',
    stat: '$575M FTC settlement',
    sub: '147 million records',
    time: '78 days undetected',
    detect: 'SSL/TLS disabled',
  },
  {
    title: 'Verkada — Hardcoded Admin Password',
    year: '2021',
    stat: '150K cameras hijacked',
    sub: 'Mass surveillance exposure',
    time: 'Immediate access',
    detect: 'hardcoded credentials',
  },
  {
    title: 'Log4Shell — Dynamic Execution',
    year: '2021',
    stat: '100M+ systems vulnerable',
    sub: 'CVE-2021-44228',
    time: '< 2 hrs after disclosure',
    detect: 'unsafe eval/exec patterns',
  },
];

export default function Landing() {
  return (
    <>
      <MarketingHeader />

      {/* ── Hero — vertical gradient: near-black → dark purple → brand purple ── */}
      <section
        className="relative min-h-screen flex items-center pt-[204px] pb-20 px-[6%] overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #1a1a1f 0%, #21104a 50%, #4a1fa0 100%)' }}
      >
        {/* Subtle glow orbs that complement the gradient */}
        <div className="absolute -top-52 -right-24 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[140px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-24 -left-36 w-[400px] h-[400px] rounded-full bg-sky-500/8 blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-[1180px] w-full grid gap-20 min-[900px]:grid-cols-[5fr_6fr] items-center">
          {/* Left: copy */}
          <div>
            {/* Eyebrow — white-tinted on gradient background */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 font-mono text-[11px] uppercase tracking-widest text-white/80 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" aria-hidden="true" />
              Local-First Security
            </div>

            {/* Headline — light weight, tight tracking, white gradient accent */}
            <h1
              id="main"
              className="font-sans text-[clamp(48px,5.5vw,72px)] font-light leading-[1.05] tracking-[-0.03em] text-white mb-5"
            >
              Security that runs<br />
              <span className="bg-gradient-to-r from-white via-violet-200 to-sky-200 bg-clip-text text-transparent">
                where your code lives.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-white/65 leading-relaxed max-w-[480px] mb-8">
              HZSec is a local security platform for developers. Scan your project, fix
              what&apos;s broken, and let an AI assistant trained on real breach history
              watch your back — without a single line of code leaving your machine.
            </p>

            {/* CTAs — pill-shaped */}
            <div className="flex items-center gap-4 flex-wrap mb-8">
              <Link
                href="/pricing"
                className="btn-glow inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-accent/90 transition-all hover:-translate-y-px"
              >
                Download free →
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 border border-white/25 text-white px-8 py-3.5 rounded-full font-medium text-base hover:border-white/50 hover:bg-white/5 transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Mini-stats — white on gradient */}
            <div className="flex items-center gap-6 flex-wrap mb-4">
              {[
                { n: '40+', label: 'detection patterns' },
                { n: '6',   label: 'scan modes' },
                { n: '0',   label: 'bytes to cloud' },
              ].map(({ n, label }, i) => (
                <div key={label} className="flex items-center gap-6">
                  {i > 0 && <span className="w-px h-8 bg-white/20" aria-hidden="true" />}
                  <div>
                    <div className="font-mono text-xl font-bold text-white leading-none">{n}</div>
                    <div className="font-mono text-[10px] text-white/50 mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="font-mono text-xs text-white/40">
              Free forever · macOS · Windows · 100% local processing
            </p>
          </div>

          {/* Right: App mockup wrapped in demo modal trigger */}
          <DemoModal videoUrl="/demo.mp4">
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_30px_60px_rgba(15,23,42,0.35)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Security Platform</span>
            </div>

            <div className="grid h-[340px]" style={{ gridTemplateColumns: '130px 1fr' }}>
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

              <div className="p-3.5 overflow-hidden">
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
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.25)]">Score: 78</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]">LOW THREAT</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.25)]">OWASP 71%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {[
                    { sev: 'CRITICAL', color: 'text-red-400',    bg: 'bg-[rgba(248,113,113,0.15)]', text: 'AWS access key exposed in config' },
                    { sev: 'HIGH',     color: 'text-orange-400', bg: 'bg-[rgba(251,146,60,0.15)]',  text: 'SSL/TLS disabled in server config' },
                    { sev: 'HIGH',     color: 'text-orange-400', bg: 'bg-[rgba(251,146,60,0.15)]',  text: 'Wildcard CORS policy detected' },
                    { sev: 'MEDIUM',   color: 'text-yellow-400', bg: 'bg-[rgba(251,191,36,0.15)]',  text: 'Debug mode enabled in production' },
                  ].map(({ sev, color, bg, text }) => (
                    <div key={text} className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                      <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${bg} ${color} flex-shrink-0`}>{sev}</span>
                      <span className="text-[10px] text-[#e2e8f0] opacity-85">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </DemoModal>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-border bg-panel py-12 px-[6%]">
        <div className="mx-auto max-w-[1180px] grid grid-cols-2 min-[700px]:grid-cols-4 gap-8 min-[700px]:divide-x divide-border">
          {[
            { n: '40+', label: 'Detection patterns',  sub: 'secrets · configs · code · web · hardening' },
            { n: '6',   label: 'Scan modes',           sub: 'from quick to full-depth analysis' },
            { n: '10',  label: 'Breach cases in AI',     sub: 'Uber · Equifax · Log4Shell + more' },
            { n: '0',   label: 'Bytes to the cloud',   sub: 'everything runs on your machine' },
          ].map(({ n, label, sub }) => (
            <div key={label} className="min-[700px]:px-8 first:pl-0 last:pr-0 flex flex-col gap-1">
              <div className="font-mono text-[clamp(28px,4vw,40px)] font-extrabold text-text leading-none">{n}</div>
              <div className="font-semibold text-text text-sm mt-1">{label}</div>
              <div className="font-mono text-[10px] text-muted leading-relaxed">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">

          <div className="max-w-[640px] mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Built for Developers
            </div>
            <h2 className="text-[clamp(28px,3.5vw,48px)] font-light leading-[1.1] tracking-tight text-text">
              One app.<br />
              <span className="bg-gradient-to-r from-accent to-violet-400 bg-clip-text text-transparent">
                Scan, defend, govern.
              </span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              HZSec covers every stage of local security work — from finding what&apos;s
              wrong, to fixing it with AI that knows your code, to proving compliance
              when the audit comes.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-6">
            {PILLARS.map(({ n, label, Icon, headline, body, features, cta, href }) => (
              <div
                key={label}
                className="group rounded-2xl border border-border bg-panel p-8 flex flex-col hover:border-accent/40 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute top-3 right-4 font-mono font-extrabold text-text/[0.04] leading-none select-none pointer-events-none"
                  style={{ fontSize: '80px' }}
                  aria-hidden="true"
                >
                  {n}
                </div>
                <div className="mb-5 w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4 pb-2 border-b border-border">
                  {label}
                </div>
                <h3 className="text-xl font-light tracking-tight text-text mb-3">{headline}</h3>
                <p className="text-sm text-muted leading-relaxed mb-6 flex-1">{body}</p>
                <ul className="space-y-2 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-accent flex-shrink-0 text-xs mt-0.5">✓</span>
                      <span className="text-sm text-text">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                  {cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Breach Cases ── */}
      <section className="bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">

          <div className="max-w-[700px] mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 border border-danger/20 font-mono text-[11px] uppercase tracking-widest text-danger mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-danger" aria-hidden="true" />
              Why This Matters
            </div>
            <h2 className="text-[clamp(28px,3.5vw,48px)] font-light leading-[1.1] tracking-tight text-text">
              These breaches started<br />
              with issues HZSec detects.
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Every breach case is embedded in HZSec&apos;s intelligence layer. When the
              scanner finds a matching pattern, the assistant tells you exactly what
              happened and how fast it was exploited.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">
            {BREACH_CASES.map(({ title, year, stat, sub, time, detect }) => (
              <div key={title} className="relative rounded-2xl border border-border bg-bg p-7 hover:border-danger/30 transition-all duration-200 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-danger/50 rounded-l-2xl" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-light tracking-tight text-text leading-snug">
                      {title} <span className="text-muted font-normal">({year})</span>
                    </h3>
                    <p className="text-xs text-muted mt-1 font-mono">{sub}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-danger flex-shrink-0 text-right">{stat}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-danger/10 border border-danger/20 text-danger text-[11px] font-mono font-medium">
                    ⏱ {time}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-medium">
                    HZSec detects: {detect}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="relative bg-bg py-28 px-[6%] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[680px] mx-auto text-center">
          <h2 className="text-[clamp(32px,4vw,56px)] font-light leading-[1.05] tracking-tight text-text">
            Catch what attackers look for<br />
            <span className="bg-gradient-to-r from-accent to-violet-400 bg-clip-text text-transparent">
              before you ship.
            </span>
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-5 mx-auto">
            Free to download, free to scan, free forever on the solo plan.
            No credit card, no code leaving your machine, no catch.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <Link
              href="/pricing"
              className="btn-glow inline-flex items-center bg-accent text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-accent/90 hover:-translate-y-px transition-all"
            >
              Download free →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center border border-border text-text px-8 py-3.5 rounded-full font-medium text-base hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              View pricing
            </Link>
          </div>
          <p className="font-mono text-xs text-muted mt-6">
            Free forever · macOS · Windows coming soon · 100% local processing
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
