import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'Governance & Compliance — HZSec',
  description:
    'Map every finding to OWASP Top 10, CIS benchmarks, and SOC 2 controls automatically. Track fix history, surface recurring issues, and generate audit-ready reports.',
};

export default function GovernPage() {
  return (
    <>
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="relative flex items-center pt-[204px] pb-24 px-[6%] overflow-hidden">
        <div
          className="absolute -top-52 -right-24 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-24 -left-36 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-[1180px] w-full grid gap-20 min-[900px]:grid-cols-[5fr_6fr] items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Govern
            </div>
            <h1 className="font-sans text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5">
              Prove you&apos;re compliant.<br />
              <span className="text-accent">Before the auditor asks.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-[480px] mb-8">
              Every finding is automatically tagged to OWASP Top 10, CIS benchmarks,
              and SOC 2 controls. Every fix is logged. Every gap is visible — so
              when compliance comes up, you have answers, not panic.
            </p>
            <div className="flex items-center gap-3 font-mono text-xs text-muted mb-8 flex-wrap">
              <span>OWASP Top 10</span>
              <span className="opacity-[0.35]">·</span>
              <span>CIS Benchmarks</span>
              <span className="opacity-[0.35]">·</span>
              <span>SOC 2</span>
              <span className="opacity-[0.35]">·</span>
              <span>Audit log on every plan</span>
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

          {/* Right: Compliance dashboard mockup */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Compliance Overview</span>
            </div>
            <div className="grid h-[340px]" style={{ gridTemplateColumns: '130px 1fr' }}>
              <div className="bg-[#111d35] border-r border-[rgba(56,189,248,0.12)] p-3 flex flex-col gap-0.5">
                <div className="font-mono text-[11px] font-bold px-2 py-1.5 mb-2">
                  <span className="text-white">HZ</span>
                  <span className="text-[#38bdf8]">Sec</span>
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">▣ Scan Center</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◈ Assistant</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">
                  ≡ Audit Log
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-3.5 overflow-hidden">
                {/* Framework scores */}
                <div className="flex flex-col gap-2 mb-3">
                  {[
                    { label: 'OWASP Top 10', pct: 71, color: '#34d399', bar: '71%' },
                    { label: 'CIS Benchmarks', pct: 64, color: '#fbbf24', bar: '64%' },
                    { label: 'SOC 2 Controls', pct: 58, color: '#f97316', bar: '58%' },
                  ].map(({ label, pct, color, bar }) => (
                    <div
                      key={label}
                      className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-lg px-3 py-2"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="font-mono text-[9px] text-[#94a3b8]">{label}</div>
                        <div className="font-mono text-[9px]" style={{ color }}>{pct}%</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: bar, background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Findings with framework tags */}
                <div className="flex flex-col gap-1">
                  {[
                    { text: 'Wildcard CORS policy', tag: 'OWASP A05', recurring: true },
                    { text: 'Debug mode in production', tag: 'SOC 2 CC6', recurring: false },
                    { text: 'Exposed AWS access key', tag: 'OWASP A02', recurring: true },
                  ].map(({ text, tag, recurring }) => (
                    <div
                      key={text}
                      className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2 py-1.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-[9px] text-[#e2e8f0] opacity-85 truncate">{text}</span>
                      <div className="flex gap-1 items-center flex-shrink-0">
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[rgba(56,189,248,0.12)] text-[#38bdf8]">
                          {tag}
                        </span>
                        {recurring && (
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-[#fbbf24]">
                            ↩ REC
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="border-y border-border bg-panel py-4 px-[6%]">
        <div className="mx-auto max-w-[1180px] flex items-center justify-center gap-4 flex-wrap font-mono text-xs text-muted">
          <span>Local-first</span>
          <span className="opacity-[0.35]">·</span>
          <span>No cloud upload</span>
          <span className="opacity-[0.35]">·</span>
          <span>Built for developers</span>
          <span className="opacity-[0.35]">·</span>
          <span>Mac &amp; Windows</span>
        </div>
      </div>

      {/* ── Problem ── */}
      <section className="py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[700px] mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 font-mono text-[11px] uppercase tracking-widest text-red-500 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
              Why This Matters
            </div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              Compliance shouldn&apos;t be<br />
              <span className="text-accent">a fire drill.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Most developers start thinking about compliance when an audit is
              already scheduled. By then, the gap between where you are and where
              you need to be is measured in weeks of catch-up work.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                title: 'Manual framework mapping',
                body: 'Mapping findings to OWASP or SOC 2 by hand takes hours and invites errors. Without automation, it just doesn\'t get done until someone asks for it.',
              },
              {
                title: 'No audit trail',
                body: 'Auditors want evidence of consistent security practice over time. A single scan the week before an audit doesn\'t prove that — a timestamped history does.',
              },
              {
                title: 'Recurring issues stay hidden',
                body: 'If the same misconfiguration keeps reappearing across scans, that\'s a process problem — not just a fix problem. Without history tracking, you can\'t see it.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-panel p-7">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <span className="text-red-500 text-base" aria-hidden="true">⚠</span>
                </div>
                <h3 className="text-base font-bold text-text mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              How It Works
            </div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              Compliance context from<br />
              <span className="text-accent">the moment you scan.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-4 gap-5">
            {[
              {
                n: '01',
                title: 'Scan your codebase',
                body: 'Every finding is automatically tagged to OWASP Top 10, CIS benchmark controls, and SOC 2 trust service criteria — no manual mapping required.',
              },
              {
                n: '02',
                title: 'Review compliance gaps',
                body: 'HZSec shows you a percentage score per framework so you know exactly how far you are from each standard, not just whether findings exist.',
              },
              {
                n: '03',
                title: 'Fix and track progress',
                body: 'Apply fixes and watch your compliance scores update in real time. The audit log records every change with a timestamp.',
              },
              {
                n: '04',
                title: 'Generate audit-ready reports',
                body: 'Export a structured report with scan timestamps, finding summaries, severities, and applied fixes — ready to share without additional interpretation.',
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="rounded-2xl border border-border bg-bg p-7 flex flex-col">
                <div className="font-mono text-[11px] text-accent mb-4">{n}</div>
                <h3 className="text-base font-bold text-text mb-3">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section id="compliance-mapping" className="scroll-mt-[128px] py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mb-14">
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              Everything in the<br />
              <span className="text-accent">Govern module.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Automatic framework tagging, gap calculations, fix memory, and a local
              audit log — designed to help developers stay ahead of compliance,
              not scramble for it.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 gap-5">
            {([
              {
                id: 'framework-mapping',
                title: 'OWASP Top 10 mapping',
                body: 'Every finding is tagged to the relevant OWASP Top 10 category. See which parts of the standard you cover, which you don\'t, and what the fastest path to improvement is.',
              },
              {
                title: 'CIS Benchmark controls',
                body: 'HZSec cross-references findings against CIS benchmark controls for common environments. Know which controls are failing and what a passing configuration looks like.',
              },
              {
                title: 'SOC 2 coverage tracking',
                body: 'HZSec maps findings to SOC 2 trust service criteria — Security, Availability, Confidentiality. See your current coverage and what\'s holding back a cleaner picture.',
              },
              {
                title: 'Fix memory & recurrence tracking',
                body: 'HZSec tracks whether a finding was fixed and whether it came back. Persistent issues are flagged automatically so you stop patching the same problem twice.',
              },
              {
                title: 'Compliance gap calculations',
                body: 'View your OWASP, CIS, and SOC 2 scores as percentages. Know exactly how far you are from a target threshold — not just whether open findings exist.',
              },
              {
                title: 'Audit log',
                body: 'Every scan, finding severity, fix applied, and rescan result is logged locally with a timestamp. The log is structured, exportable, and yours — no cloud dependency.',
              },
            ] as Array<{ id?: string; title: string; body: string }>).map(({ id, title, body }) => (
              <div
                key={title}
                id={id}
                className={`rounded-2xl border border-border bg-panel p-7 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200${id ? ' scroll-mt-[128px]' : ''}`}
              >
                <div className="text-accent mb-3 text-lg" aria-hidden="true">✦</div>
                <h3 className="text-base font-bold text-text mb-3">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example output ── */}
      <section className="bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mb-12">
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              What compliance tracking<br />
              <span className="text-accent">actually looks like.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Framework scores, finding tags, and recurrence flags — all updated
              every time you scan. No manual entry, no separate spreadsheet.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a]">
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
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">
                  ≡ Audit Log
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-4 grid min-[600px]:grid-cols-2 gap-4">
                {/* Left: framework scores */}
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#94a3b8] mb-1">
                    Framework Coverage
                  </div>
                  {[
                    { label: 'OWASP Top 10', pct: 71, color: '#34d399', bar: '71%' },
                    { label: 'CIS Benchmarks', pct: 64, color: '#fbbf24', bar: '64%' },
                    { label: 'SOC 2 Controls', pct: 58, color: '#f97316', bar: '58%' },
                  ].map(({ label, pct, color, bar }) => (
                    <div
                      key={label}
                      className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-lg px-3 py-2.5"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="font-mono text-[9px] text-[#94a3b8]">{label}</div>
                        <div className="font-mono text-[9px]" style={{ color }}>{pct}%</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: bar, background: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Right: recent findings with tags */}
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#94a3b8] mb-1">
                    Open Findings
                  </div>
                  {[
                    { text: 'Wildcard CORS policy', tag: 'OWASP A05', recurring: true },
                    { text: 'Debug mode in production', tag: 'SOC 2 CC6', recurring: false },
                    { text: 'TLS verification disabled', tag: 'CIS 4.3', recurring: false },
                    { text: 'Exposed AWS access key', tag: 'OWASP A02', recurring: true },
                    { text: 'Rate limiting absent', tag: 'OWASP A04', recurring: false },
                  ].map(({ text, tag, recurring }) => (
                    <div
                      key={text}
                      className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2 py-1.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-[9px] text-[#e2e8f0] opacity-85 truncate">{text}</span>
                      <div className="flex gap-1 items-center flex-shrink-0">
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[rgba(56,189,248,0.12)] text-[#38bdf8]">
                          {tag}
                        </span>
                        {recurring && (
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-[#fbbf24]">
                            ↩
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why HZSec ── */}
      <section className="py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Why HZSec
            </div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              What developers used<br />
              <span className="text-accent">before this existed.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              HZSec isn&apos;t a certification platform — it&apos;s a developer tool that
              gives you continuous visibility into compliance posture, so audits
              don&apos;t start from zero.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                label: 'vs Spreadsheet tracking',
                theirs:
                  'Copy findings into a doc, manually assign framework categories, update statuses by hand. Works for five findings. Falls apart at fifty, and never shows trends or recurrence patterns.',
                ours: [
                  'Auto-tagged to OWASP/CIS/SOC 2',
                  'Trend and recurrence tracking',
                  'Updated on every scan',
                  'No manual data entry',
                ],
              },
              {
                label: 'vs Manual audit prep',
                theirs:
                  "A weeks-long scramble before an audit: gather evidence, map controls, explain findings. Most of it happens retrospectively, and the snapshot is already out of date by the time it's submitted.",
                ours: [
                  'Continuous, not periodic',
                  'Evidence logged automatically',
                  'Audit log ready any time',
                  'Findings mapped from day one',
                ],
              },
              {
                label: 'vs Compliance checklists',
                theirs:
                  "Generic checklists give you questions to answer, not visibility into your code. You end up doing the same detective work manually every time — did we disable TLS? Is debug off?",
                ours: [
                  'Detects issues directly in code',
                  'Answers the checklist questions',
                  'Score-based, not checkbox-based',
                  'Recurring issues flagged automatically',
                ],
              },
            ].map(({ label, theirs, ours }) => (
              <div key={label} className="rounded-2xl border border-border bg-panel p-7">
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-4">
                  {label}
                </div>
                <p className="text-sm text-muted leading-relaxed mb-5 pb-5 border-b border-border">
                  {theirs}
                </p>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                  HZSec adds
                </div>
                <ul className="space-y-2">
                  {ours.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-accent flex-shrink-0 text-xs mt-0.5">✓</span>
                      <span className="text-sm text-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-panel py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mb-14">
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              Common questions<br />
              <span className="text-accent">about compliance.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">
            {[
              {
                q: 'Which frameworks does HZSec map to?',
                a: 'Currently OWASP Top 10, CIS benchmarks for common environments, and SOC 2 trust service criteria. Coverage expands as new scan rules are added.',
              },
              {
                q: 'Is this a replacement for a formal security audit?',
                a: "No. HZSec is a developer security tool — it helps you find issues, track fixes, and prepare evidence. It doesn't replace a professional audit or issue certifications.",
              },
              {
                q: 'What does the compliance gap percentage mean?',
                a: "For each framework, HZSec calculates a score based on which controls have passing findings versus open issues. A 71% OWASP score means 71% of the framework's mapped controls pass based on what's been scanned.",
              },
              {
                q: 'How does fix memory and recurrence work?',
                a: 'When you fix a finding and the same issue reappears in a later scan, HZSec marks it as recurring. This flags patterns that need a deeper root-cause fix rather than a surface patch.',
              },
              {
                q: 'Can I export the audit log?',
                a: 'Yes. The audit log can be exported as a structured report. It includes scan timestamps, finding summaries, severities, and applied fixes — formatted to be shareable with an auditor.',
              },
              {
                q: 'Do I need the Team plan for compliance features?',
                a: 'No. Compliance mapping, audit log, gap calculations, and recurrence tracking are available on all plans, including Free. Team adds shared notes and multi-seat audit trails.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-bg p-7">
                <h3 className="text-base font-bold text-text mb-3">{q}</h3>
                <p className="text-sm text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="relative py-28 px-[6%] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[680px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            Audit log on every plan
          </div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight text-text mt-6">
            Know your compliance posture<br />
            <span className="text-accent">before the question is asked.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-5 mx-auto">
            Download HZSec and get automatic framework tagging, recurrence
            tracking, and a local audit log from your very first scan.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <Link
              href="/download"
              className="inline-flex items-center bg-accent text-white px-8 py-3.5 rounded-lg font-medium text-base hover:bg-accent/90 hover:-translate-y-px transition-all"
            >
              Download HZSec →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center border border-border text-text px-8 py-3.5 rounded-lg font-medium text-base hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
            >
              View pricing
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
