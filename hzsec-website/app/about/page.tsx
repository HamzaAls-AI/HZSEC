import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ArrowRight, ShieldCheck, Terminal, Lock } from 'lucide-react';

export const metadata = {
  title: 'About HZSec — Local-First Developer Security',
  description:
    'HZSec is a local-first security platform that helps developers find exposed secrets, insecure configurations, and unsafe code patterns — without uploading a single line of code.',
};

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            About HZSec
          </div>
          <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold tracking-tight text-text leading-[1.1] mb-6 max-w-2xl">
            Security should start with the developer.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-2xl mb-8">
            HZSec is a local-first security platform built to help developers find
            exposed secrets, insecure configurations, and unsafe code patterns before
            they become production problems.
          </p>

          {/* Core differentiator callout */}
          <div className="inline-flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/5 px-5 py-3.5 mb-10">
            <Lock size={16} className="text-accent shrink-0" />
            <span className="text-sm font-medium text-text">
              Your code stays on your machine.
            </span>
          </div>

          {/* Full name — present but not dominant */}
          <p className="text-xs text-muted font-mono">
            HZSec — Horizon Zero Security
          </p>
        </div>
      </section>

      {/* ── 2. Why HZSec exists ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            The problem
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-6 max-w-xl">
            Security issues reach production because they&apos;re too easy to miss.
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-2xl mb-8">
            Developers move quickly. Between writing features, reviewing PRs, and
            keeping up with dependencies, security is often the thing that gets checked
            after the fact — if it gets checked at all.
          </p>
          <p className="text-base text-muted leading-relaxed max-w-2xl mb-10">
            That&apos;s how things like this end up in production:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            {[
              'API keys and tokens committed to a public repo',
              'Database credentials hardcoded in a config file',
              'Debug mode left on in a production build',
              'Wildcard CORS policies that were never tightened',
              'Private keys checked in "temporarily" and forgotten',
              'Dangerous code patterns that slip past code review',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-border bg-bg px-4 py-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="text-sm text-text/80 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-base text-muted leading-relaxed max-w-2xl">
            HZSec exists to make catching those problems easier — before the commit,
            before the PR, before the deploy.
          </p>
        </div>
      </section>

      {/* ── 3. Local-first principle ─────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            Local-first
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-6 max-w-xl">
            Your code belongs to you.
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 max-w-3xl">
            <div>
              <p className="text-base text-muted leading-relaxed mb-5">
                Most security tools work by sending your code to a remote server for
                analysis. That means your source code, your secrets, your architecture
                — all of it leaves your machine.
              </p>
              <p className="text-base text-muted leading-relaxed">
                The HZSec CLI runs entirely on your machine. Your files are read
                locally, analysed locally, and the results stay local. Nothing is
                uploaded. No account required to scan.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={14} className="text-ok" />
                <span className="text-xs font-medium text-ok uppercase tracking-wider">No upload</span>
              </div>
              <div className="rounded-xl border border-border bg-[#0d1117] p-5 font-mono text-sm">
                <div className="text-[#8b949e] mb-1 text-xs">$ hzsec scan .</div>
                <div className="text-[#3fb950] text-xs mb-3">✓ Scanning locally...</div>
                <div className="text-[#c9d1d9] text-xs space-y-1">
                  <div>Secrets detected: <span className="text-[#f85149]">2 CRITICAL</span></div>
                  <div>Config issues:   <span className="text-[#e3b341]">1 HIGH</span></div>
                  <div>Code patterns:   <span className="text-[#e3b341]">1 MEDIUM</span></div>
                </div>
                <div className="mt-3 text-[#8b949e] text-xs border-t border-white/10 pt-3">
                  No data left this machine.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. What HZSec is today ──────────────────────────────────────── */}
      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            What HZSec is today
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-10 max-w-xl">
            A CLI and a desktop app.
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* CLI */}
            <div className="rounded-xl border border-border bg-bg p-7">
              <div className="flex items-center gap-2 mb-1">
                <Terminal size={16} className="text-accent" />
                <span className="font-semibold text-text">Free CLI</span>
              </div>
              <p className="text-xs text-muted mb-5">
                <code className="font-mono">npm install -g hzsec-cli</code>
              </p>
              <ul className="space-y-2.5">
                {[
                  'Secrets detection — API keys, tokens, private keys',
                  'Unsafe code patterns — command injection, eval()',
                  'Configuration issues — CORS, debug mode, and more',
                  'Web security checks',
                  'Hardening recommendations',
                  'Text, JSON, and SARIF output formats',
                  'CI-friendly with --fail-on and exit codes',
                  'Multiple scan modes — quick, full, focused',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop */}
            <div className="rounded-xl border border-border bg-bg p-7">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-text">Desktop App</span>
                <span className="rounded-full bg-warn/10 border border-warn/20 px-2 py-0.5 text-[10px] font-medium text-warn uppercase tracking-wider">
                  Beta
                </span>
              </div>
              <p className="text-xs text-muted mb-5">macOS · Windows</p>
              <ul className="space-y-2.5">
                {[
                  'Full GUI — no terminal required',
                  'Scan history across projects',
                  'AI assistant for understanding and fixing findings',
                  'Live process monitor for credential leaks',
                  'Breach Library — check emails against breach databases',
                  'Managed Anthropic key for Pro and Team (no API key setup)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn/60" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted">
                The desktop app is in active development and not yet code-signed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Where HZSec is going ─────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            Direction
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-6 max-w-xl">
            From finding problems to preventing them.
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-2xl mb-10">
            The long-term direction for HZSec is to help developers move through the
            full security loop — not just surface issues, but understand them, fix
            them, verify the fix, and keep them from coming back.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap max-w-3xl">
            {[
              'Find the problem',
              'Understand it',
              'Fix it',
              'Verify the fix',
              'Prevent it returning',
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <div className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm font-medium text-text">
                  {step}
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight size={14} className="text-muted shrink-0" />
                )}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted max-w-2xl leading-relaxed">
            This includes ideas like smarter remediation guidance, continuous
            background monitoring, verification workflows, and better security
            history across a project&apos;s lifetime. These are directions, not
            promises — the work happens incrementally.
          </p>
        </div>
      </section>

      {/* ── 6. Built by ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-8">
            The builder
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6 max-w-2xl">
            <div>
              <div className="font-semibold text-text text-lg mb-1">
                Hamza Al-Samraaie
              </div>
              <div className="text-sm text-muted mb-4">
                Founder · HZSec
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5">
                HZSec began as a project focused on making developer security tooling
                more practical, private, and accessible. The goal is simple: give
                every developer the tools to catch security problems early, without
                adding friction to their workflow or asking them to hand over their code.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/HamzaAls-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
                  aria-label="GitHub"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CTA ──────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-text mb-3">
            Run your first scan.
          </h2>
          <p className="text-base text-muted mb-10 max-w-md leading-relaxed">
            Install the CLI, point it at any project, and see what it finds.
            No account required.
          </p>

          <div className="space-y-3 mb-10 max-w-sm">
            <div className="rounded-xl border border-border bg-[#0d1117] px-5 py-3.5 font-mono text-sm">
              <span className="text-[#8b949e] select-none">$ </span>
              <span className="text-[#c9d1d9]">npm install -g hzsec-cli</span>
            </div>
            <div className="rounded-xl border border-border bg-[#0d1117] px-5 py-3.5 font-mono text-sm">
              <span className="text-[#8b949e] select-none">$ </span>
              <span className="text-[#c9d1d9]">hzsec scan .</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Get started free <ArrowRight size={14} />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-muted hover:text-text hover:border-accent/40 transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
