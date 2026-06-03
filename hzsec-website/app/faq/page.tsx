import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'FAQ — HZSec',
  description:
    'Answers to common questions about HZSec — local processing, scanning, the AI assistant, pricing, and compliance.',
};

const sections = [
  {
    id: 'general',
    eyebrow: 'General',
    heading: 'About HZSec',
    qa: [
      {
        q: 'What is HZSec?',
        a: 'HZSec is a local-first desktop security platform for developers. It scans your code for vulnerabilities, monitors files in real time, and gives you an AI assistant pre-loaded with your findings — without uploading a single line of code to the cloud.',
      },
      {
        q: 'What platforms does HZSec run on?',
        a: 'HZSec is available for macOS (Apple Silicon, signed and notarized) and Windows 10/11 (standard installer, authentically signed). A Linux build is on the roadmap.',
      },
      {
        q: 'Is HZSec open source?',
        a: 'Not currently. HZSec is a proprietary product with a free tier that requires no credit card. The local-first architecture means your code never leaves your machine regardless of license tier.',
      },
      {
        q: 'How do I get started?',
        a: 'Download the desktop app, install it, sign in with your HZSec account to pull your license, then point it at any local folder. Your first scan takes under 30 seconds.',
      },
      {
        q: 'How do I get help or report an issue?',
        a: 'Email hello@hzsec.io for support. For early access users, response time is typically within one business day.',
      },
    ],
  },
  {
    id: 'privacy',
    eyebrow: 'Privacy & Local Processing',
    heading: 'Your code stays on your machine.',
    qa: [
      {
        q: 'Does HZSec upload my source code?',
        a: 'Never. HZSec scans run entirely on your machine. No source files, no file paths, and no code snippets are transmitted anywhere during a scan. You can verify this with any network monitor while a scan runs.',
      },
      {
        q: 'What data does HZSec store locally?',
        a: 'HZSec stores scan results, your security score history, the audit log of findings and fixes, and your settings — all on your local machine. None of this is synced to HZSec servers.',
      },
      {
        q: 'Does HZSec need internet access?',
        a: 'Scanning and Live Monitor work fully offline. The AI assistant requires a network connection to call the Anthropic API, but your source code is never included in those calls — only finding metadata is used as context.',
      },
      {
        q: 'How is my Anthropic API key stored?',
        a: 'If you bring your own key (free tier), it is stored locally using AES-256-GCM encryption with PBKDF2-SHA512 key derivation. On Pro, HZSec manages the key for you and it is never stored on your device.',
      },
      {
        q: 'Can I verify HZSec isn\'t sending my code anywhere?',
        a: 'Yes. Run a scan while monitoring outbound network traffic in Charles, Proxyman, or macOS\'s built-in network monitor. You will see no outbound calls carrying source content during a scan.',
      },
    ],
  },
  {
    id: 'scanning',
    eyebrow: 'Scanning',
    heading: 'Running scans and reading results.',
    qa: [
      {
        q: 'How fast does a scan run?',
        a: 'Most projects under 50,000 lines complete in under 30 seconds. Large monorepos may take a couple of minutes depending on how many modes are active. You can run a targeted quick scan on just the changed files for faster feedback.',
      },
      {
        q: 'What does the scanner look for?',
        a: 'Six detection categories: exposed secrets and credentials, insecure configuration settings, known-vulnerable code patterns, dependency CVEs via CISA and NVD, web exposure risks, and system-level hardening gaps.',
      },
      {
        q: 'Can I scan a single file or just one folder?',
        a: 'Yes. You can point the scanner at any local path — a single file, a module directory, or your entire repo. The scanner respects .gitignore by default so build artifacts and dependencies are excluded.',
      },
      {
        q: 'What are auto-fixes?',
        a: 'For common, deterministic findings — exposed API key format, debug flag set to true, insecure HTTP config — HZSec can apply the fix directly. You always see a diff before anything changes, and you can reject or modify it.',
      },
      {
        q: 'How does the security score work?',
        a: 'Each scan produces a 0–100 score based on the severity and count of open findings relative to your codebase size. HZSec tracks this over time so you can see whether security is improving or slipping between scans.',
      },
      {
        q: 'Does the scanner work on monorepos?',
        a: 'Yes. You can scan the entire monorepo at once or target individual packages within it. The score and audit log work at whatever path level you choose.',
      },
    ],
  },
  {
    id: 'assistant',
    eyebrow: 'AI Assistant',
    heading: 'Context-aware help for every finding.',
    qa: [
      {
        q: 'Does the AI assistant access my source code?',
        a: 'No. The assistant uses your scan results and finding metadata as context — not raw source files. It knows what issues exist and where, but your code stays on your machine and is never sent to Anthropic.',
      },
      {
        q: 'Do I need my own Anthropic API key?',
        a: 'On the free tier, yes — you bring your own key. On Pro, HZSec provides a managed key with 1,000 messages per month included. You can also supply your own key at any tier for unlimited messages.',
      },
      {
        q: 'What is the Breach Intelligence layer?',
        a: '10+ documented real-world breaches — Uber (2022), Equifax (2017), Verkada (2021), Log4Shell (2021), and others — are embedded as assistant context. When your scan matches a breach pattern, the assistant references the exact incident and how fast it was exploited.',
      },
      {
        q: 'What does Live Monitor watch for?',
        a: 'Live Monitor watches any folder you specify. When a file change introduces a new security finding, HZSec surfaces it immediately — no manual rescan required. It\'s useful for watching your source directory while you code.',
      },
      {
        q: 'Can I ask the assistant general security questions?',
        a: 'Yes. The assistant isn\'t limited to your current scan findings. You can ask about secure coding patterns, review a code snippet, explore a CVE in depth, or get a second opinion on a remediation approach.',
      },
      {
        q: 'Is the assistant available offline?',
        a: 'Scanning and Live Monitor run fully offline. The AI assistant requires a network connection to reach the Anthropic API. Your source code is never transmitted — only structured finding context is used.',
      },
    ],
  },
  {
    id: 'pricing',
    eyebrow: 'Pricing',
    heading: 'Plans and billing.',
    qa: [
      {
        q: 'What\'s included in the free tier?',
        a: 'The free tier includes all six scan modes, Live Monitor, the breach intelligence library, and the full audit log. You bring your own Anthropic key for the AI assistant. Free is free forever — no trial expiry.',
      },
      {
        q: 'What does Pro add over Free?',
        a: 'Pro adds a managed Anthropic key (no setup), 1,000 AI assistant messages per month, security playbooks, and email support. It\'s $19/month or $190/year.',
      },
      {
        q: 'Do I need a credit card to start?',
        a: 'No. The free tier requires no credit card. You only need payment details when upgrading to Pro or Team.',
      },
      {
        q: 'How does the 7-day trial work?',
        a: 'Pro and Team both include a 7-day free trial. You can cancel at any time from your billing portal — access continues until the end of the paid period.',
      },
      {
        q: 'How does Team pricing work?',
        a: 'Team is custom-priced for squads of 3 or more. It includes 5,000 assistant messages per seat, multi-seat billing, shared notes, and priority support. Email hello@hzsec.io to discuss.',
      },
    ],
  },
  {
    id: 'compliance',
    eyebrow: 'Compliance',
    heading: 'Framework mapping and audit readiness.',
    qa: [
      {
        q: 'Which compliance frameworks does HZSec map to?',
        a: 'Currently OWASP Top 10, CIS benchmarks for common environments, and SOC 2 trust service criteria. Every finding is automatically tagged — no manual mapping required. Coverage expands as new scan rules are added.',
      },
      {
        q: 'Is HZSec a replacement for a formal security audit?',
        a: 'No. HZSec is a developer security tool — it helps you find issues, track fixes, and prepare evidence. It doesn\'t replace a professional penetration test or issue compliance certifications.',
      },
      {
        q: 'What does the compliance gap percentage mean?',
        a: 'For each framework, HZSec calculates a percentage based on which controls have passing findings versus open issues. A 71% OWASP score means 71% of the framework\'s mapped controls pass based on what\'s been scanned.',
      },
      {
        q: 'How does fix memory and recurrence tracking work?',
        a: 'When you fix a finding and the same issue reappears in a later scan, HZSec marks it as recurring. This flags patterns that need a deeper root-cause fix rather than a surface patch, and it\'s visible in the audit log.',
      },
      {
        q: 'Can I export the audit log for an auditor?',
        a: 'Yes. The audit log can be exported as a structured report with scan timestamps, finding summaries, severities, and applied fixes. It\'s formatted to be shareable without additional interpretation.',
      },
      {
        q: 'Do I need the Team plan for compliance features?',
        a: 'No. Compliance mapping, audit log, gap calculations, and recurrence tracking are available on all plans including Free. Team adds shared notes and multi-seat audit trails for collaborative compliance work.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <MarketingHeader />

      {/* ── Page header ── */}
      <section className="relative pt-[204px] pb-16 px-[6%] overflow-hidden">
        <div
          className="absolute -top-52 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              FAQ
            </div>
            <h1 className="font-sans text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.08] tracking-tight text-text mb-5">
              Frequently asked<br />
              <span className="text-accent">questions.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-[480px]">
              Everything you need to know about HZSec — how it works, what it
              stores, and what each plan includes.
            </p>
          </div>

          {/* Jump links */}
          <div className="flex flex-wrap gap-2 mt-10">
            {sections.map(({ id, eyebrow }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-border text-sm text-muted font-mono hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              >
                {eyebrow}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sections ── */}
      {sections.map(({ id, eyebrow, heading, qa }, sectionIndex) => (
        <section
          key={id}
          id={id}
          className={`scroll-mt-[128px] py-20 px-[6%]${sectionIndex % 2 === 0 ? '' : ' bg-panel'}`}
        >
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-4">
                {eyebrow}
              </div>
              <h2 className="text-[clamp(22px,2.5vw,32px)] font-extrabold leading-tight tracking-tight text-text">
                {heading}
              </h2>
            </div>
            <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-5">
              {qa.map(({ q, a }) => (
                <div
                  key={q}
                  className={`rounded-2xl border border-border p-7${sectionIndex % 2 === 0 ? ' bg-panel' : ' bg-bg'}`}
                >
                  <h3 className="text-base font-bold text-text mb-3">{q}</h3>
                  <p className="text-sm text-muted leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Closing CTA ── */}
      <section className="relative py-24 px-[6%] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[640px] mx-auto text-center">
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-tight text-text">
            Still have questions?
          </h2>
          <p className="text-lg text-muted leading-relaxed mt-4">
            Email us at{' '}
            <a
              href="mailto:hello@hzsec.io"
              className="text-accent hover:underline"
            >
              hello@hzsec.io
            </a>{' '}
            or download HZSec and try it yourself — the free tier requires no
            credit card.
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
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
