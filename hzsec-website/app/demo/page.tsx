import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'Demo — HZSec',
  description:
    'Walk through HZSec in four steps: run a local scan, review findings, ask the AI assistant, and track compliance — all without uploading a line of code.',
};

export default function DemoPage() {
  return (
    <>
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="relative pt-[204px] pb-20 px-[6%] overflow-hidden">
        <div
          className="absolute -top-52 -right-24 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              How it works
            </div>
            <h1 className="font-sans text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5">
              HZSec in four steps.<br />
              <span className="text-accent">No video required.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-[520px] mb-8">
              From installation to your first compliance report — this is what the
              full HZSec workflow looks like. All local. All yours.
            </p>
            <div className="flex items-center gap-3 font-mono text-xs text-muted mb-8 flex-wrap">
              <span>Local-first</span>
              <span className="opacity-[0.35]">·</span>
              <span>No cloud upload</span>
              <span className="opacity-[0.35]">·</span>
              <span>Mac &amp; Windows</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-lg font-medium text-base hover:bg-accent/90 transition-all hover:-translate-y-px"
              >
                Download HZSec →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 border border-border text-text px-8 py-3.5 rounded-lg font-medium text-base hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 1: Run a local scan ── */}
      <section id="step-1" className="scroll-mt-[128px] bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px] grid gap-16 min-[900px]:grid-cols-[5fr_7fr] items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Step 01</div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-text mb-5">
              Run a local scan.
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              Point HZSec at any folder on your machine. No repo access, no cloud
              upload, no config file to write. The scanner runs six detection modes
              across your code in seconds.
            </p>
            <ul className="space-y-3">
              {[
                'Select a path — file, module, or entire repo',
                'Choose quick scan or full 6-mode deep scan',
                'Results appear in the Scan Center in under 30s',
                '.gitignore is respected — no noise from build artifacts',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="text-accent flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* App mockup: Scan Center with terminal output */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">~/myproject — hzsec scan .</span>
            </div>
            <div className="p-4 font-mono text-[11px] space-y-1.5 overflow-x-auto">
              <div className="text-[#94a3b8]">$ hzsec scan ./src --deep</div>
              <div className="text-[#38bdf8]">✓  Scanning 847 files across 6 detection modes...</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#e2e8f0] font-bold">FINDINGS</div>
              <div className="text-red-400">&nbsp; [CRITICAL]&nbsp; AWS access key exposed&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; config/prod.env:3</div>
              <div className="text-orange-400">&nbsp; [HIGH]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TLS certificate verification off&nbsp; server/config.js:41</div>
              <div className="text-orange-400">&nbsp; [HIGH]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CORS wildcard origin policy&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; middleware/cors.js:12</div>
              <div className="text-yellow-400">&nbsp; [MEDIUM]&nbsp;&nbsp;&nbsp; DEBUG=true in production&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .env.production:7</div>
              <div className="text-yellow-400">&nbsp; [MEDIUM]&nbsp;&nbsp;&nbsp; Hardcoded password in test fixture&nbsp; tests/auth.test.js:23</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#e2e8f0] font-bold">SUMMARY</div>
              <div className="text-[#94a3b8]">
                &nbsp; Security score:&nbsp; <span className="text-[#34d399]">78 / 100</span>&nbsp; (↑ 4 from last scan)
              </div>
              <div className="text-[#94a3b8]">
                &nbsp; OWASP Top 10:&nbsp;&nbsp; <span className="text-[#34d399]">71%</span>&nbsp;&nbsp; CIS: <span className="text-[#fbbf24]">64%</span>
              </div>
              <div className="text-[#94a3b8]">&nbsp; Scan duration:&nbsp; 3.2s  (847 files)</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#38bdf8]">→&nbsp; 1 auto-fix available · Open Scan Center</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2: Review findings ── */}
      <section id="step-2" className="scroll-mt-[128px] py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px] grid gap-16 min-[900px]:grid-cols-[7fr_5fr] items-center">
          {/* App mockup: Scan Center findings list */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_20px_50px_rgba(15,23,42,0.25)] order-2 min-[900px]:order-1">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Scan Center</span>
            </div>
            <div className="grid h-[360px]" style={{ gridTemplateColumns: '130px 1fr' }}>
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
              <div className="p-3.5 overflow-hidden flex flex-col gap-2">
                {/* Posture bar */}
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-lg px-3 py-2.5">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#94a3b8] mb-1.5">Security Posture</div>
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
                {/* Expanded finding card */}
                <div className="bg-[#1a2540] border border-red-500/30 rounded-md p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[rgba(248,113,113,0.15)] text-red-400">CRITICAL</span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-90 font-medium">AWS access key exposed</span>
                  </div>
                  <div className="font-mono text-[9px] text-[#94a3b8] mb-1.5">config/prod.env:3</div>
                  <div className="text-[9px] text-[#94a3b8] leading-relaxed mb-2">
                    Hardcoded AWS access key found. Keys in source files are readable by anyone with repo access and in git history permanently.
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[rgba(56,189,248,0.12)] text-[#38bdf8]">OWASP A02</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">Auto-fix available</span>
                  </div>
                </div>
                {/* Other findings compressed */}
                {[
                  { sev: 'HIGH', cls: 'bg-[rgba(251,146,60,0.15)] text-orange-400', text: 'TLS certificate verification off' },
                  { sev: 'HIGH', cls: 'bg-[rgba(251,146,60,0.15)] text-orange-400', text: 'CORS wildcard origin policy' },
                  { sev: 'MEDIUM', cls: 'bg-[rgba(251,191,36,0.15)] text-yellow-400', text: 'DEBUG=true in production' },
                ].map(({ sev, cls, text }) => (
                  <div key={text} className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded flex-shrink-0 ${cls}`}>{sev}</span>
                    <span className="text-[10px] text-[#e2e8f0] opacity-75">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="order-1 min-[900px]:order-2">
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Step 02</div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-text mb-5">
              Review your findings.
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              Every finding shows the severity, the exact file and line, what the
              risk is, which compliance control it maps to, and whether an auto-fix
              is available. No raw CVE dumps, no mystery output.
            </p>
            <ul className="space-y-3">
              {[
                'Severity ranked: Critical → High → Medium → Info',
                'File path and line number for every finding',
                'Compliance tag (OWASP, CIS, SOC 2) on each result',
                'One-click auto-fix with diff shown before applying',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="text-accent flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Step 3: Ask the AI assistant ── */}
      <section id="step-3" className="scroll-mt-[128px] bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px] grid gap-16 min-[900px]:grid-cols-[5fr_7fr] items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Step 03</div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-text mb-5">
              Ask the AI assistant.
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              The assistant already knows your findings when you open it. Ask why
              something is dangerous, how to fix it safely, or what actually
              happened in the real breach this pattern matches.
            </p>
            <ul className="space-y-3">
              {[
                'Context pre-loaded — no copy-pasting code',
                'Breach Intelligence: references real-world incidents',
                'Live CVE feed from CISA and NVD',
                'Agentic fixes: propose and apply changes with diff review',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="text-accent flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* App mockup: AI Assistant conversation */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — AI Assistant</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '130px 1fr' }}>
              <div className="bg-[#111d35] border-r border-[rgba(56,189,248,0.12)] p-3 flex flex-col gap-0.5">
                <div className="font-mono text-[11px] font-bold px-2 py-1.5 mb-2">
                  <span className="text-white">HZ</span>
                  <span className="text-[#38bdf8]">Sec</span>
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">▣ Scan Center</div>
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">◈ Assistant</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">≡ Audit Log</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-3.5 flex flex-col gap-2.5">
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 font-mono text-[9px] text-[#94a3b8]">
                  Context: 5 findings loaded · 2 breach matches · CVE DB synced 2h ago
                </div>
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md p-2.5">
                  <div className="font-mono text-[9px] text-[#38bdf8] mb-1.5">HZSec Assistant</div>
                  <div className="text-[10px] text-[#e2e8f0] leading-relaxed opacity-90">
                    The exposed key in <span className="text-[#38bdf8]">config/prod.env:3</span> matches the Uber 2022 pattern — a hardcoded credential in a config file. In that incident it was exploited in &lt;10 minutes. Here&apos;s the safe fix:
                  </div>
                </div>
                <div className="bg-[#0d1b2e] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-2 font-mono text-[10px]">
                  <div className="text-[#94a3b8] mb-1.5 text-[9px]"># config/prod.env</div>
                  <div className="text-red-400">- AWS_ACCESS_KEY=&quot;AKIAIOSFODNN7EXAMPLE&quot;</div>
                  <div className="text-green-400">+ AWS_ACCESS_KEY=$&#123;AWS_KEY&#125;</div>
                </div>
                <div className="bg-[#1e2a42] border border-[rgba(56,189,248,0.08)] rounded-md p-2.5">
                  <div className="font-mono text-[9px] text-[#64748b] mb-1.5">You</div>
                  <div className="text-[10px] text-[#e2e8f0] opacity-85">What if the key was already pushed to git?</div>
                </div>
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md p-2.5">
                  <div className="font-mono text-[9px] text-[#38bdf8] mb-1.5">HZSec Assistant</div>
                  <div className="text-[10px] text-[#e2e8f0] leading-relaxed opacity-90">
                    Assume it&apos;s compromised. Revoke it in AWS IAM immediately, then issue a new one. Removing it from git history doesn&apos;t help — it was readable at push time...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 4: Track compliance ── */}
      <section id="step-4" className="scroll-mt-[128px] py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px] grid gap-16 min-[900px]:grid-cols-[7fr_5fr] items-center">
          {/* App mockup: Compliance + Audit Log */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_20px_50px_rgba(15,23,42,0.25)] order-2 min-[900px]:order-1">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Audit Log · Compliance</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '130px 1fr' }}>
              <div className="bg-[#111d35] border-r border-[rgba(56,189,248,0.12)] p-3 flex flex-col gap-0.5">
                <div className="font-mono text-[11px] font-bold px-2 py-1.5 mb-2">
                  <span className="text-white">HZ</span>
                  <span className="text-[#38bdf8]">Sec</span>
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">▣ Scan Center</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◈ Assistant</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">≡ Audit Log</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-3.5 flex flex-col gap-2.5">
                {/* Framework scores */}
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'OWASP Top 10', pct: 71, color: '#34d399', bar: '71%' },
                    { label: 'CIS Benchmarks', pct: 64, color: '#fbbf24', bar: '64%' },
                    { label: 'SOC 2 Controls', pct: 58, color: '#f97316', bar: '58%' },
                  ].map(({ label, pct, color, bar }) => (
                    <div key={label} className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-lg px-3 py-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="font-mono text-[9px] text-[#94a3b8]">{label}</div>
                        <div className="font-mono text-[9px]" style={{ color }}>{pct}%</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)]">
                        <div className="h-full rounded-full" style={{ width: bar, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Audit log entries */}
                <div className="font-mono text-[9px] uppercase tracking-widest text-[#94a3b8] mt-1 mb-0.5">Recent audit entries</div>
                {[
                  { time: '14:32', action: 'Fixed: AWS key → env var', status: 'green' },
                  { time: '14:28', action: 'Scan completed · 5 findings', status: 'blue' },
                  { time: '14:10', action: 'Live Monitor: 1 new finding', status: 'yellow' },
                  { time: '09:15', action: 'Scan completed · 9 findings', status: 'blue' },
                ].map(({ time, action, status }) => (
                  <div key={time + action} className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2.5">
                    <span className="font-mono text-[8px] text-[#64748b] flex-shrink-0">{time}</span>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      status === 'green' ? 'bg-[#34d399]' :
                      status === 'yellow' ? 'bg-[#fbbf24]' : 'bg-[#38bdf8]'
                    }`} />
                    <span className="text-[9px] text-[#e2e8f0] opacity-80">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="order-1 min-[900px]:order-2">
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Step 04</div>
            <h2 className="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-text mb-5">
              Track compliance<br />and audit history.
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              Every scan auto-tags findings to OWASP, CIS, and SOC 2. Fix
              something and your compliance scores update immediately. The audit
              log timestamps every action — scans, fixes, new Live Monitor alerts.
            </p>
            <ul className="space-y-3">
              {[
                'OWASP Top 10 / CIS / SOC 2 scores update on every scan',
                'Recurring issues flagged when they reappear after a fix',
                'Timestamped audit log — ready to export at any time',
                'No separate compliance tool or manual spreadsheet needed',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text">
                  <span className="text-accent flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="relative bg-panel py-28 px-[6%] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[680px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            Ready to try it
          </div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight text-text mt-6">
            This is what security<br />
            <span className="text-accent">looks like on your machine.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-5 mx-auto">
            Download HZSec and run your first scan in under five minutes.
            Free tier, no credit card, no cloud upload.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <Link
              href="/download"
              className="inline-flex items-center bg-accent text-white px-8 py-3.5 rounded-lg font-medium text-base hover:bg-accent/90 hover:-translate-y-px transition-all"
            >
              Download HZSec →
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center border border-border text-text px-8 py-3.5 rounded-lg font-medium text-base hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              Read the FAQ
            </Link>
          </div>
          <p className="font-mono text-xs text-muted mt-6">
            Free tier free forever · Mac + Windows · 100% local processing
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
