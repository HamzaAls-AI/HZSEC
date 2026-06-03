import Link from 'next/link';

export const metadata = {
  title: 'Quickstart — HZSec Docs',
  description: 'Get HZSec installed and run your first security scan in under 3 minutes.',
};

export default function QuickstartPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Getting Started
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Quickstart
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        From download to your first scan result in under 3 minutes. No account
        required to scan — you only need a free account to use the AI assistant
        and persist scan history.
      </p>

      {/* Step 1 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold shrink-0">1</div>
          <h2 className="text-lg font-bold text-text">Download and install</h2>
        </div>
        <div className="ml-10 space-y-3 text-sm text-muted leading-relaxed">
          <p>
            Download the signed installer for your platform from{' '}
            <Link href="/download" className="text-accent hover:underline">hzsec.io/download</Link>.
          </p>
          <p>
            <strong className="text-text">macOS:</strong> Open the <code className="font-mono text-accent">.dmg</code>,
            drag HZSec to <code className="font-mono text-accent">/Applications</code>, and launch it.
            macOS Gatekeeper validates the Apple notarization automatically.
          </p>
          <p>
            <strong className="text-text">Windows:</strong> Run the <code className="font-mono text-accent">HZSec-Setup.exe</code> installer.
            Accept the UAC prompt and follow the setup wizard.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold shrink-0">2</div>
          <h2 className="text-lg font-bold text-text">Sign in (optional for first scan)</h2>
        </div>
        <div className="ml-10 text-sm text-muted leading-relaxed space-y-3">
          <p>
            HZSec lets you run an initial scan without an account so you can evaluate
            it first. To unlock the AI assistant and persist your scan history, create
            a free account at{' '}
            <a href="https://app.hzsec.io" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">app.hzsec.io</a>{' '}
            and sign in from the app. Your license is pulled automatically via a
            <code className="font-mono text-accent mx-1">hzsec://license/...</code> deep link.
          </p>
          <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Free tier</div>
            <p>No credit card, no expiry. The AI assistant on the free tier requires your own Anthropic API key — see <Link href="/docs/ai-assistant" className="text-accent hover:underline">AI Assistant</Link> for setup.</p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold shrink-0">3</div>
          <h2 className="text-lg font-bold text-text">Run your first scan</h2>
        </div>
        <div className="ml-10 space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Click <strong className="text-text">New Scan</strong> in the sidebar, choose a local
            folder, and click <strong className="text-text">Start Scan</strong>. All detectors run
            in parallel. Most codebases under 50,000 lines complete in under 30 seconds.
          </p>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Or use the CLI</div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
              <code>{`# Full scan (all detectors, default)
hzsec scan ./src

# Quick scan — code, config, and web only
hzsec scan --mode quick ./src

# Secrets only
hzsec scan --mode secret ./src

# JSON output for scripting
hzsec scan --format json . > results.json`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold shrink-0">4</div>
          <h2 className="text-lg font-bold text-text">Review findings and take action</h2>
        </div>
        <div className="ml-10 space-y-3 text-sm text-muted leading-relaxed">
          <p>
            The results view shows a security score, findings grouped by severity
            (CRITICAL, HIGH, MEDIUM, LOW), and the file path and line number for each issue.
            Click any finding to see a description, the relevant CWE or CVE, and a
            recommended fix.
          </p>
          <p>
            For deterministic findings — exposed API key format, <code className="font-mono text-accent">debug=True</code>,
            insecure HTTP config — an <strong className="text-text">Apply Fix</strong> button is available.
            HZSec shows a diff before changing anything; you confirm or dismiss.
          </p>
        </div>
      </div>

      {/* Next steps */}
      <h2 className="text-lg font-bold text-text mb-4">Next steps</h2>
      <div className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-3 mb-12">
        {[
          { label: 'Read findings',    href: '/docs/first-scan',  desc: 'Severity levels, auto-fix workflow, and exporting results.' },
          { label: 'Scan modes',       href: '/docs/scan-modes',  desc: 'What each detector looks for and how to target one mode.' },
          { label: 'AI assistant',     href: '/docs/ai-assistant',desc: 'Ask questions about your findings — API key setup and what gets sent.' },
        ].map(({ label, href, desc }) => (
          <Link key={href} href={href} className="group rounded-lg border border-border bg-panel p-4 hover:border-accent/50 hover:bg-accent/5 transition-all">
            <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors mb-1">{label} →</div>
            <div className="text-xs text-muted leading-relaxed">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Overview
        </Link>
        <Link href="/docs/install" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Installation →
        </Link>
      </div>
    </article>
  );
}
