import Link from 'next/link';

export const metadata = {
  title: 'Documentation — HZSec',
  description: 'Complete documentation for HZSec — installation, scanning, the AI assistant, compliance, and CLI reference.',
};

const sections = [
  { label: 'Quickstart',   href: '/docs/quickstart',   summary: 'Up and running in under 3 minutes.',           group: 'Getting Started' },
  { label: 'Installation', href: '/docs/install',       summary: 'macOS, Windows, signature verification.',      group: 'Getting Started' },
  { label: 'First Scan',   href: '/docs/first-scan',    summary: 'Run a scan and read your first results.',      group: 'Getting Started' },
  { label: 'Scan Modes',   href: '/docs/scan-modes',    summary: '6 detection categories and how to tune them.', group: 'Scanning' },
  { label: 'CLI Reference',href: '/docs/cli',           summary: 'Every command, flag, and exit code.',          group: 'Scanning' },
  { label: 'Architecture', href: '/docs/architecture',  summary: 'How local-first works under the hood.',        group: 'Platform' },
  { label: 'AI Assistant', href: '/docs/ai-assistant',  summary: 'Context-aware help from breach intelligence.', group: 'Defend' },
  { label: 'Live Monitor', href: '/docs/live-monitor',  summary: 'Real-time file watching and alerting.',        group: 'Defend' },
  { label: 'Compliance',   href: '/docs/compliance',    summary: 'OWASP, CIS, and SOC 2 mapping and reporting.', group: 'Govern' },
];

export default function DocsOverviewPage() {
  return (
    <article>
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Documentation
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        HZSec Documentation
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        HZSec is a local-first security platform for developers. Scan your code
        for vulnerabilities, monitor changes in real time, and get AI-assisted
        remediation — without a single line of source code leaving your machine.
      </p>

      {/* Quick install */}
      <div className="rounded-xl border border-border bg-panel p-6 mb-10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
          Install &amp; first scan — 3 minutes
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# 1. Download the desktop app from hzsec.io/download
#    macOS: open the .dmg and drag to /Applications
#    Windows: run HZSec-Setup.exe

# 2. Run your first scan with the CLI
hzsec scan ./src`}</code>
        </pre>
        <p className="text-xs text-muted mt-3">
          Download the signed installer from{' '}
          <Link href="/download" className="text-accent hover:underline">hzsec.io/download</Link>.
          See <Link href="/docs/install" className="text-accent hover:underline">Installation</Link> for full setup steps.
        </p>
      </div>

      {/* What HZSec scans for */}
      <h2 className="text-xl font-bold text-text mb-4">What HZSec detects</h2>
      <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-3 mb-12">
        {[
          { name: 'Secrets & Credentials',    desc: 'API keys, tokens, and passwords committed to code. 40+ patterns plus entropy analysis.' },
          { name: 'Insecure Configuration',   desc: 'Debug flags, HTTP endpoints, weak TLS, and env variable misuse across 6 languages.' },
          { name: 'Vulnerable Code Patterns', desc: 'SQLi, XSS, path traversal, and unsafe deserialization based on OWASP/CWE.' },
          { name: 'Dependency CVEs',          desc: 'Open-source packages with known CVEs via CISA KEV and NVD. Updated daily.' },
          { name: 'Web Exposure',             desc: 'Open CORS, missing security headers, CSP gaps, and exposed admin routes.' },
          { name: 'System Hardening',         desc: 'File permissions, service configs, and CI/CD configuration gaps.' },
        ].map(({ name, desc }) => (
          <div key={name} className="rounded-lg border border-border bg-bg p-4">
            <div className="text-sm font-semibold text-text mb-1">{name}</div>
            <div className="text-xs text-muted leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* Section links */}
      <h2 className="text-xl font-bold text-text mb-4">In these docs</h2>
      <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-3">
        {sections.map(({ label, href, summary, group }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-1 rounded-lg border border-border bg-panel p-4 hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text group-hover:text-accent transition-colors">{label}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted">{group}</span>
            </div>
            <span className="text-xs text-muted leading-relaxed">{summary}</span>
          </Link>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-end">
        <Link href="/docs/quickstart" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Quickstart →
        </Link>
      </div>
    </article>
  );
}
