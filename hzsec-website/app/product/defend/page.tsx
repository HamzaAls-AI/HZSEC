import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'AI Defender — HZSec',
  description:
    'Fix threats before they become incidents. An AI assistant pre-loaded with your scan results, real breach history, and live CVE data — running entirely on your machine.',
};

export default function DefendPage() {
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
              Defend
            </div>
            <h1 className="font-sans text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5">
              Fix threats before<br />they become incidents.<br />
              <span className="text-accent">Powered by breach intelligence<br />and live CVE data.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-[480px] mb-8">
              HZSec&apos;s AI assistant isn&apos;t a generic chatbot. It reads your scan
              results, matches your code against documented real-world breaches, and
              checks your dependencies against a live CVE feed — before you ask the
              first question.
            </p>
            <div className="flex items-center gap-3 font-mono text-xs text-muted mb-8 flex-wrap">
              <span>Context-aware</span>
              <span className="opacity-[0.35]">·</span>
              <span>Breach-matched</span>
              <span className="opacity-[0.35]">·</span>
              <span>Live CVE feed</span>
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

          {/* Right: AI Assistant mockup */}
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
            <div className="bg-[#111d35] border-b border-[rgba(56,189,248,0.12)] px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="font-mono text-[11px] text-[#94a3b8] ml-1">HZSec — AI Assistant</span>
            </div>
            <div className="grid h-[340px]" style={{ gridTemplateColumns: '130px 1fr' }}>
              <div className="bg-[#111d35] border-r border-[rgba(56,189,248,0.12)] p-3 flex flex-col gap-0.5">
                <div className="font-mono text-[11px] font-bold px-2 py-1.5 mb-2">
                  <span className="text-white">HZ</span>
                  <span className="text-[#38bdf8]">Sec</span>
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">▣ Scan Center</div>
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">
                  ◈ Assistant
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">≡ Audit Log</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-3.5 overflow-hidden flex flex-col gap-2.5">
                {/* Context bar */}
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-1.5 font-mono text-[9px] text-[#94a3b8]">
                  Context: 4 findings · 2 breach matches · CVE DB synced 6h ago
                </div>
                {/* HZSec message */}
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md p-2.5">
                  <div className="font-mono text-[9px] text-[#38bdf8] mb-1.5">HZSec Assistant</div>
                  <div className="text-[10px] text-[#e2e8f0] leading-relaxed opacity-90">
                    Found AWS key in{' '}
                    <span className="text-[#38bdf8]">config/prod.env:3</span>. This matches
                    the Uber 2022 pattern — exploited in &lt;10 min after exposure.
                    Here&apos;s the fix:
                  </div>
                </div>
                {/* Code diff */}
                <div className="bg-[#0d1b2e] border border-[rgba(56,189,248,0.12)] rounded-md px-2.5 py-2 font-mono text-[10px]">
                  <div className="text-[#94a3b8] mb-1.5 text-[9px]"># config/prod.env</div>
                  <div className="text-red-400">- AWS_ACCESS_KEY=&quot;AKIAIOSFODNN7EXAMPLE&quot;</div>
                  <div className="text-green-400">+ AWS_ACCESS_KEY=$&#123;AWS_KEY&#125;</div>
                </div>
                {/* User message */}
                <div className="bg-[#1e2a42] border border-[rgba(56,189,248,0.08)] rounded-md p-2.5">
                  <div className="font-mono text-[9px] text-[#64748b] mb-1.5">You</div>
                  <div className="text-[10px] text-[#e2e8f0] opacity-85">
                    How do I rotate this key if it was already pushed?
                  </div>
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
              Generic security advice<br />
              <span className="text-accent">lands wrong.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              Asking a general AI tool &ldquo;is my code secure?&rdquo; doesn&apos;t work. It
              hasn&apos;t read your code, doesn&apos;t know your stack, and can&apos;t check
              CVEs against your actual dependencies.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                title: 'Advice without context',
                body: 'Most AI tools give you textbook answers pulled from documentation. HZSec starts from your actual findings, your specific stack, and what\'s broken right now.',
              },
              {
                title: 'No breach history',
                body: 'Knowing that Log4Shell was exploited in under 2 hours after public disclosure changes how you prioritize. Generic AI doesn\'t carry that kind of operational context.',
              },
              {
                title: 'Stale threat data',
                body: 'CVEs are published every day. Without a live feed, security advice is based on last quarter\'s threat landscape — which is not the one you\'re defending against.',
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
              Context loaded before<br />
              <span className="text-accent">your first message.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-4 gap-5">
            {[
              {
                n: '01',
                title: 'Run a scan first',
                body: 'The assistant reads your findings before you type anything. No copy-pasting code, no manual context setup — it already knows what\'s broken.',
              },
              {
                n: '02',
                title: 'Ask or get proactive alerts',
                body: 'Ask about a specific finding, or let the assistant surface high-priority issues it noticed. Every answer is grounded in your actual scan results.',
              },
              {
                n: '03',
                title: 'Guided remediation',
                body: 'The assistant walks you through the fix step by step, explains why the pattern is dangerous, and references the real breach that matches your code.',
              },
              {
                n: '04',
                title: 'Live Monitor watches the rest',
                body: 'Set a folder to watch. HZSec alerts you when a file change introduces a new finding — no manual rescan required.',
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
              <span className="text-accent">Defend module.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              A context-aware assistant, a live breach intelligence layer, real-time
              file monitoring, and agentic fixes — all running locally.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 gap-5">
            {([
              {
                id: 'ai-assistant',
                title: 'AI Assistant with codebase context',
                body: 'The assistant reads your scan results before your first message. No copy-pasting code, no manual context setup. It already knows what\'s broken and where.',
              },
              {
                id: 'breach-intelligence',
                title: 'Breach Intelligence layer',
                body: '10+ documented real-world breaches are embedded as context. When your scan matches a breach pattern, you hear exactly how fast it was exploited and how.',
              },
              {
                id: 'cve-database',
                title: 'Live CVE database',
                body: 'Connected to CISA and NVD feeds. The assistant can check your dependency versions against current CVEs and tell you which ones are actively exploited in the wild.',
              },
              {
                id: 'live-monitor',
                title: 'Live Monitor',
                body: 'Watch any folder for real-time change detection. When a file is modified in a way that introduces a new security finding, HZSec surfaces it immediately.',
              },
              {
                title: 'Managed API key (Pro)',
                body: 'On Pro, you don\'t need your own Anthropic key. HZSec manages it for you with 1,000 assistant messages per month included — no setup, no key rotation.',
              },
              {
                title: 'Agentic fixes with diff review',
                body: 'On supported findings, the assistant can propose and apply a code change directly. You see a full diff before anything is written — you stay in control.',
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
              What a conversation<br />
              <span className="text-accent">actually looks like.</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              The assistant already knows your findings when you open it. Every
              answer references your code, your stack, and documented incidents.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border border-[rgba(56,189,248,0.25)] bg-[#0f172a]">
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
                <div className="px-2 py-1.5 rounded text-[11px] bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8]">
                  ◈ Assistant
                </div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">◎ Live Monitor</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">≡ Audit Log</div>
                <div className="px-2 py-1.5 rounded text-[11px] text-[#94a3b8]">⚙ Settings</div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md px-3 py-2 font-mono text-[9px] text-[#94a3b8]">
                  Context loaded: 4 findings · 2 breach case matches · CVE DB synced 6h ago
                </div>
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md p-3">
                  <div className="font-mono text-[9px] text-[#38bdf8] mb-1.5">HZSec Assistant</div>
                  <div className="text-[11px] text-[#e2e8f0] leading-relaxed opacity-90">
                    I found an AWS access key in{' '}
                    <span className="text-[#38bdf8]">config/prod.env:3</span>. This matches the
                    Uber 2022 breach pattern — a hardcoded key in a config file, exploited in under
                    10 minutes after public exposure. The fix is to load it from your secrets
                    manager instead:
                  </div>
                </div>
                <div className="bg-[#0d1b2e] border border-[rgba(56,189,248,0.12)] rounded-md px-3 py-2.5 font-mono text-[11px]">
                  <div className="text-[#94a3b8] mb-2 text-[9px]"># config/prod.env — proposed change</div>
                  <div className="text-red-400">- AWS_ACCESS_KEY=&quot;AKIAIOSFODNN7EXAMPLE&quot;</div>
                  <div className="text-green-400">+ AWS_ACCESS_KEY=$&#123;AWS_KEY&#125;  # load from secrets manager</div>
                </div>
                <div className="bg-[#1e2a42] border border-[rgba(56,189,248,0.08)] rounded-md p-3">
                  <div className="font-mono text-[9px] text-[#64748b] mb-1.5">You</div>
                  <div className="text-[11px] text-[#e2e8f0] opacity-85">
                    How do I rotate this key safely if it was already pushed to git?
                  </div>
                </div>
                <div className="bg-[#1a2540] border border-[rgba(56,189,248,0.12)] rounded-md p-3">
                  <div className="font-mono text-[9px] text-[#38bdf8] mb-1.5">HZSec Assistant</div>
                  <div className="text-[11px] text-[#e2e8f0] leading-relaxed opacity-90">
                    Assume the key is compromised. Revoke it in AWS IAM now, then issue a new one.
                    Removing it from git history doesn&apos;t help — the old key was already
                    readable by anyone with access to the repo at that point...
                  </div>
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
              Why not just use<br />
              <span className="text-accent">an existing AI tool?</span>
            </h2>
            <p className="text-lg text-muted leading-relaxed mt-5">
              General-purpose AI is useful. But security assistance without code
              context, breach history, and live CVE data is just educated guessing.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-3 gap-5">
            {[
              {
                label: 'vs ChatGPT',
                theirs:
                  "Broad security knowledge, good at explaining concepts. But it hasn't read your code, can't check your dependencies against live CVEs, and doesn't know which patterns actually caused real-world breaches at scale.",
                ours: [
                  'Reads your scan results first',
                  'Live CVE database integration',
                  'Breach case context per finding',
                  'No copy-pasting code required',
                ],
              },
              {
                label: 'vs GitHub Copilot',
                theirs:
                  'Excellent at code completion and generation. Security suggestions are opportunistic — it flags patterns it recognizes inline, but there\'s no systematic scan, no severity ranking, and no remediation workflow.',
                ours: [
                  'Systematic scan before assist',
                  'Severity-ranked findings',
                  'Fix workflow with diff review',
                  'Monitors for new issues live',
                ],
              },
              {
                label: 'vs Cloud AI security tools',
                theirs:
                  "Platforms that scan your repo by uploading it to their servers. Useful for org-level reporting, but requires repo permissions, sends your source code offsite, and runs on their schedule — not yours.",
                ours: [
                  'Zero code egress, ever',
                  'Runs on-demand locally',
                  'No repo permissions needed',
                  'Works before pushing to git',
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
              <span className="text-accent">about the assistant.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">
            {[
              {
                q: 'Does the assistant access my source code?',
                a: 'The assistant uses your scan results and finding metadata — not raw source files. It knows what issues exist and where, but your code stays on your machine.',
              },
              {
                q: 'Do I need my own Anthropic API key?',
                a: 'On the free tier, yes. On Pro, HZSec provides a managed key with 1,000 messages/month included. You can also bring your own key at any tier for unlimited messages.',
              },
              {
                q: 'What is the Breach Intelligence layer?',
                a: '10+ documented real-world breaches — Uber, Equifax, Verkada, Log4Shell, and others — are embedded as assistant context. When your scan matches a breach pattern, you hear the exact incident referenced.',
              },
              {
                q: 'What does Live Monitor watch for?',
                a: 'Any change to a watched file or folder is re-analyzed for security findings. If a modification introduces a new exposure, you\'re notified immediately without running a full scan.',
              },
              {
                q: 'Can I ask general security questions?',
                a: 'Yes. The assistant isn\'t limited to your current findings. You can ask about secure coding patterns, explore a CVE, or get a second opinion on a specific code snippet.',
              },
              {
                q: 'Is the assistant available offline?',
                a: 'The scan and Live Monitor run fully offline. The AI assistant requires a network connection to call the Anthropic API, but your code never leaves your machine as part of that call.',
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
            Context-aware security
          </div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight text-text mt-6">
            Security intelligence that knows<br />
            <span className="text-accent">your code before you ask.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-5 mx-auto">
            Download HZSec and get an AI assistant pre-loaded with your findings,
            breach history, and live CVE data — running entirely on your machine.
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
