import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'Security Scanner — HZSec',
  description:
    'Six local scan modes covering 40+ detection patterns. Find secrets, config flaws, vulnerable code, and dependency CVEs in seconds — without uploading a line of code.',
};

export default function ScanPage() {
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
              Scan
            </div>
            <h1 className="font-sans text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5">
              Find what&apos;s already broken.<br />
              <span className="text-accent">Before it gets exploited.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-[480px] mb-8">
              Six detection modes across your entire codebase — secrets, configs,
              dependencies, vulnerable code patterns. Runs locally in seconds, with
              results you can act on immediately.
            </p>
            <div className="flex items-center gap-3 font-mono text-xs text-muted mb-8 flex-wrap">
              <span>6 scan modes</span>
              <span className="opacity-[0.35]">·</span>
              <span>40+ detection patterns</span>
              <span className="opacity-[0.35]">·</span>
              <span>Results in &lt; 30s</span>
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

          {/* Right: Scan Center mockup */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — Scan Center</span>
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
                <div className="flex flex-col gap-1.5">
                  {[
                    { sev: 'CRITICAL', cls: 'bg-[rgba(248,113,113,0.15)] text-red-400', text: 'AWS_ACCESS_KEY in config/prod.env:3' },
                    { sev: 'HIGH', cls: 'bg-[rgba(251,146,60,0.15)] text-orange-400', text: 'TLS certificate verification disabled' },
                    { sev: 'HIGH', cls: 'bg-[rgba(251,146,60,0.15)] text-orange-400', text: 'CORS wildcard origin: * policy' },
                    { sev: 'MEDIUM', cls: 'bg-[rgba(251,191,36,0.15)] text-yellow-400', text: 'DEBUG=true in production config' },
                  ].map(({ sev, cls, text }) => (
                    <div key={text} className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 flex items-center gap-2">
                      <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded flex-shrink-0 ${cls}`}>{sev}</span>
                      <span className="text-[10px] text-[#e2e8f0] opacity-85">{text}</span>
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
              Security issues don&apos;t<br />
              <span className="text-accent">announce themselves.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Most codebases carry live vulnerabilities for weeks before anyone
              notices. By then, the window for an attacker is already open.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                icon: '⚠',
                title: 'Secrets committed by accident',
                body: 'API keys, tokens, and credentials end up in repos. Automated scanners on the other side find them within hours of a push.',
              },
              {
                icon: '⚠',
                title: 'Config drift nobody catches',
                body: 'TLS disabled, debug mode on, wildcard CORS — small settings that accumulate quietly until something exploits them.',
              },
              {
                icon: '⚠',
                title: 'Known CVEs still running',
                body: 'New vulnerabilities are published daily. Without scanning, you\'re shipping with known exploits and no visibility into which ones.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-panel p-7">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <span className="text-red-500 text-base" aria-hidden="true">{icon}</span>
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
              Four steps from folder<br />
              <span className="text-accent">to full findings report.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-4 gap-5">
            {[
              {
                n: '01',
                title: 'Point at a folder',
                body: 'Select any local path — a file, module, or entire repo. No cloud upload, no repo permissions. HZSec stays entirely on your machine.',
              },
              {
                n: '02',
                title: 'Pick scan depth',
                body: 'Run a quick targeted scan or activate all six detection modes for a deep multi-layer analysis across your full codebase.',
              },
              {
                n: '03',
                title: 'Review each finding',
                body: 'Every result shows severity, the affected file and line, context about the risk pattern, and a remediation suggestion.',
              },
              {
                n: '04',
                title: 'Apply auto-fixes',
                body: 'One-click fixes for common patterns. A diff is shown before anything changes. Or send the finding to the AI assistant for guided help.',
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
      <section className="py-24 px-[6%]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[640px] mb-14">
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
              Everything in the<br />
              <span className="text-accent">Scan module.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Six detection modes, auto-fixes, score tracking, audit history, and
              compliance tagging — all running locally, all in one app.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 gap-5">
            {([
              {
                id: 'scanner',
                title: 'Security Scanner — 6 modes',
                body: 'Secrets, configuration hardening, vulnerable code patterns, dependency CVEs, web exposure, and system risks. Each mode runs independently or all together.',
              },
              {
                id: 'auto-fixes',
                title: 'Auto-fixes with diff review',
                body: 'Common findings — exposed keys, debug flags, insecure configs — can be fixed in one click. You see a diff before anything changes.',
              },
              {
                id: 'score-history',
                title: 'Score history & trend chart',
                body: 'Every scan updates your security score. Track improvement over time, spot recurring issues, and see what dropped your score week-over-week.',
              },
              {
                id: 'audit-log',
                title: 'Audit log',
                body: 'Every scan, finding, and fix is recorded locally with a timestamp. Know exactly when an issue was introduced, detected, and resolved.',
              },
              {
                title: 'OWASP / CIS finding tags',
                body: 'Every finding is automatically mapped to OWASP Top 10 and CIS benchmark controls, giving each result compliance context without manual work.',
              },
              {
                title: '100% local processing',
                body: 'No network calls during scanning. No repo access needed. Your source code stays on your machine — always.',
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
              What a scan<br />
              <span className="text-accent">actually looks like.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Real findings, real severity context, actionable next steps — not just
              a list of CVE numbers.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">~/myproject — hzsec scan .</span>
            </div>
            <div className="p-5 font-mono text-[12px] space-y-1.5 overflow-x-auto">
              <div className="text-[#94a3b8]">$ hzsec scan ./src --deep</div>
              <div className="text-[#38bdf8]">✓  Scanning 847 files across 6 detection modes...</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#e2e8f0] font-bold">FINDINGS</div>
              <div className="text-red-400">&nbsp; [CRITICAL]&nbsp; AWS access key exposed&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; config/prod.env:3</div>
              <div className="text-orange-400">&nbsp; [HIGH]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TLS certificate verification off&nbsp;&nbsp; server/config.js:41</div>
              <div className="text-orange-400">&nbsp; [HIGH]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CORS wildcard origin policy&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; middleware/cors.js:12</div>
              <div className="text-yellow-400">&nbsp; [MEDIUM]&nbsp;&nbsp;&nbsp; DEBUG=true in production&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .env.production:7</div>
              <div className="text-yellow-400">&nbsp; [MEDIUM]&nbsp;&nbsp;&nbsp; Hardcoded password in test fixture&nbsp; tests/auth.test.js:23</div>
              <div className="text-[#60a5fa]">&nbsp; [INFO]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Rate limiting not configured&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; routes/api.js:8</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#e2e8f0] font-bold">SUMMARY</div>
              <div className="text-[#94a3b8]">
                &nbsp; Security score:&nbsp;&nbsp; <span className="text-[#34d399]">78 / 100</span>  (↑ 4 from last scan)
              </div>
              <div className="text-[#94a3b8]">
                &nbsp; OWASP Top 10:&nbsp;&nbsp;&nbsp; <span className="text-[#34d399]">71%</span>&nbsp;&nbsp;&nbsp; CIS Benchmarks: <span className="text-[#fbbf24]">64%</span>
              </div>
              <div className="text-[#94a3b8]">&nbsp; Scan duration:&nbsp;&nbsp; 3.2s  (847 files)</div>
              <div className="text-[#94a3b8]">&nbsp;</div>
              <div className="text-[#38bdf8]">→&nbsp; 1 auto-fix available · Open Scan Center for guided remediation</div>
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
              How it compares to<br />
              <span className="text-accent">existing tools.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              There are good scanning tools out there. HZSec isn&apos;t trying to
              replace them all — it fills the developer-workflow layer they all skip.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                label: 'vs Semgrep',
                theirs:
                  'Excellent rule-based static analysis, OSS, highly configurable. But requires rule authoring, produces raw findings with no score tracking, and has no AI remediation or breach context.',
                ours: [
                  'Zero config — runs in seconds',
                  'Score history & trend tracking',
                  'AI-guided remediation built in',
                  'Breach context per finding',
                ],
              },
              {
                label: 'vs SonarQube',
                theirs:
                  "Comprehensive code quality and security for teams. But it's a server to stand up, a CI pipeline to wire in, and built for org-level reporting — not a developer's local, pre-commit workflow.",
                ours: [
                  'Desktop app, no server needed',
                  '100% local, no data egress',
                  'Results in < 30s, not minutes',
                  'Works before your first commit',
                ],
              },
              {
                label: 'vs Manual audits',
                theirs:
                  "Deep expertise, high-quality findings. But they're periodic at best, expensive, and give you a point-in-time snapshot of a codebase that changed the next day.",
                ours: [
                  'Runs whenever you want',
                  'Tracks changes between scans',
                  'Available to every developer',
                  'Complements, not replaces, audits',
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
              <span className="text-accent">about scanning.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">
            {[
              {
                q: 'How fast does a scan run?',
                a: 'Most projects under 50,000 lines complete in under 30 seconds. Large monorepos may take a couple of minutes depending on how many modes are active.',
              },
              {
                q: 'What does the scanner look for?',
                a: 'Six categories: exposed secrets and credentials, insecure configuration settings, known-vulnerable code patterns, dependency CVEs via CISA/NVD, web exposure risks, and system-level hardening gaps.',
              },
              {
                q: 'Does scanning upload my code anywhere?',
                a: 'Never. HZSec runs entirely on your machine. No network calls are made during a scan. Your code stays local, full stop.',
              },
              {
                q: 'What are auto-fixes?',
                a: 'For common, deterministic findings — exposed API key format, debug flag set to true, insecure HTTP config — HZSec can apply the fix directly. You see a diff before anything changes.',
              },
              {
                q: 'Can I scan just one file or folder?',
                a: 'Yes. You can target any local path — a single file, a module, or your entire repo. The scanner respects your .gitignore by default.',
              },
              {
                q: 'Do I need a Pro account to scan?',
                a: 'No. All six scan modes are available on the free tier. Pro adds the managed AI assistant and higher message limits for guided remediation.',
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
            Free to start
          </div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight text-text mt-6">
            See your real security posture<br />
            <span className="text-accent">in under a minute.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-5 mx-auto">
            Download HZSec, point it at a project, and get a complete findings
            report — locally, privately, free.
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
