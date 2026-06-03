import Link from 'next/link';

export const metadata = {
  title: 'Architecture — HZSec Docs',
  description: 'How HZSec\'s local-first design works — what stays on your machine, how the scan engine runs, how the AI assistant handles your code, and how your API key is stored.',
};

export default function ArchitecturePage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Platform
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Architecture
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        HZSec is built around a local-first scanning model. This page explains what
        that means in practice, what data stays on your machine, and what the AI
        assistant actually sends when you ask it a question.
      </p>

      {/* Local-first scanning */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Local-first scanning</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Every scan runs entirely inside the HZSec desktop process on your machine.
          No source files, no file paths, and no code content are transmitted anywhere
          during a scan. The scanner reads your files locally, evaluates them against
          local detection rules, and writes results to local storage.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-4">
          You can verify this: run a scan while watching outbound network traffic in
          <strong className="text-text"> Charles</strong>, <strong className="text-text">Proxyman</strong>,
          or macOS&apos;s Activity Monitor. You will see no outbound calls carrying source
          content while the scan runs.
        </p>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Important distinction</div>
          <p className="text-muted leading-relaxed">
            The local-first guarantee applies to <strong className="text-text">scanning</strong>.
            The AI assistant works differently — it reads your files to give you useful answers.
            See the <Link href="#ai-assistant" className="text-accent hover:underline">AI assistant</Link> section below for exactly what gets sent.
          </p>
        </div>
      </section>

      {/* Local data storage */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">What stays on your machine</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          All scan data is stored locally under <code className="font-mono text-accent">~/.shieldops/</code>.
          Nothing in this directory is synced to HZSec servers.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed mb-4">
          <code>{`~/.shieldops/
  key.enc          # encrypted Anthropic API key (AES-256-GCM)
  key.salt         # 32-byte random salt for key derivation
  scan-history.json  # scan results and score history
  audit.log        # append-only event log (NDJSON)
  prefs.json       # app settings and preferences
  license.json     # license key + 24h-cached validation
  knowledge.db     # local CVE database (SQLite)`}</code>
        </pre>
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-3">
          {[
            { item: 'Scan results & score history', desc: 'Finding details, severities, security scores over time.' },
            { item: 'Audit log',                    desc: 'Append-only record of scans, fixes, and key events.' },
            { item: 'CVE database',                 desc: 'Local SQLite copy of CISA KEV and NVD data.' },
            { item: 'API key (encrypted)',          desc: 'AES-256-GCM encrypted before being written to disk.' },
          ].map(({ item, desc }) => (
            <div key={item} className="flex items-start gap-3 rounded-lg border border-border bg-panel px-4 py-3">
              <span className="text-accent mt-0.5 shrink-0">✓</span>
              <div>
                <span className="text-sm font-medium text-text">{item}</span>
                <p className="text-xs text-muted leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CVE database */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">CVE database</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          HZSec maintains a local SQLite database of known vulnerabilities. It is
          populated from two public sources:
        </p>
        <div className="space-y-3 mb-4">
          <div className="rounded-lg border border-border bg-panel px-4 py-3">
            <div className="text-sm font-medium text-text mb-1">CISA Known Exploited Vulnerabilities (KEV)</div>
            <p className="text-xs text-muted leading-relaxed">
              Fetched directly from <code className="font-mono text-accent">www.cisa.gov</code>. The KEV catalog lists
              vulnerabilities with confirmed active exploitation — the highest-priority CVEs for most teams.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel px-4 py-3">
            <div className="text-sm font-medium text-text mb-1">NVD (National Vulnerability Database)</div>
            <p className="text-xs text-muted leading-relaxed">
              Fetched directly from the NVD public API at <code className="font-mono text-accent">services.nvd.nist.gov</code>.
              Includes CVSS scores, CWE mappings, and recently published CVEs.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Dependency CVE checks run against this local database. No package names or
          dependency lists are sent anywhere.
        </p>
      </section>

      {/* AI assistant */}
      <section id="ai-assistant" className="mb-12 scroll-mt-[128px]">
        <h2 className="text-xl font-bold text-text mb-4">AI assistant — what gets sent</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The AI assistant is designed to give you answers grounded in your actual code,
          not generic security advice. To do that, it reads the relevant files from your
          project and includes that content in the conversation with Claude.
        </p>

        <h3 className="text-base font-semibold text-text mb-3">What the assistant sends to Claude</h3>
        <div className="space-y-3 mb-6">
          {[
            { label: 'Your scan findings', desc: 'The full findings list for your current scan — severity, type, file path, line number, and description.' },
            { label: 'Relevant file content', desc: 'For the top affected files, HZSec reads up to 500 lines of source code and includes it as context. This is how the assistant can discuss your specific code rather than hypotheticals.' },
            { label: 'Your question', desc: 'The message you typed.' },
            { label: 'System context', desc: 'Breach intelligence summaries and per-finding playbooks relevant to your scan.' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3 rounded-lg border border-border bg-panel px-4 py-3">
              <span className="text-accent mt-0.5 shrink-0">·</span>
              <div>
                <span className="text-sm font-medium text-text">{label} — </span>
                <span className="text-sm text-muted">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-text mb-3">Where it goes</h3>
        <div className="space-y-3 mb-4">
          <div className="rounded-lg border border-border bg-bg p-4">
            <div className="text-sm font-semibold text-text mb-1">BYOK (free tier)</div>
            <p className="text-sm text-muted leading-relaxed">
              Content is sent directly from your machine to <code className="font-mono text-accent">api.anthropic.com</code> using your own API key. HZSec servers never see it.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg p-4">
            <div className="text-sm font-semibold text-text mb-1">Managed key (Pro / signed-in)</div>
            <p className="text-sm text-muted leading-relaxed">
              Content is sent to the HZSec backend (<code className="font-mono text-accent">api.hzsec.io</code>),
              which validates your license, meters usage, and forwards the request to Anthropic.
              The response is passed back unmodified.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">The design trade-off</div>
          <p className="text-muted leading-relaxed">
            Sending file content is intentional. An assistant that only sees finding
            metadata gives generic answers. One that can read your actual code gives
            specific, actionable answers. You are in control — you choose when to ask
            a question, and nothing is sent automatically during scanning.
          </p>
        </div>
      </section>

      {/* API key encryption */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">API key storage</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          When you enter an Anthropic API key, HZSec encrypts it before writing to disk.
          The key is never stored in plaintext.
        </p>
        <div className="rounded-lg border border-border bg-panel p-5 text-sm space-y-2.5">
          {[
            { label: 'Encryption',   value: 'AES-256-GCM (authenticated encryption — tampering is detected on decrypt)' },
            { label: 'KDF',          value: 'PBKDF2-SHA512, 310,000 iterations' },
            { label: 'Key material', value: 'Derived from SHA-512 of 5 machine-specific factors: hostname, username, home directory, platform, and architecture. The derived key never leaves the machine.' },
            { label: 'Salt',         value: '32 random bytes, generated once and stored separately from the ciphertext.' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-muted mt-0.5 w-28 shrink-0">{label}</span>
              <span className="text-text text-xs leading-relaxed">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted leading-relaxed mt-4">
          On the Pro tier with a managed key, no API key is stored on your device at all.
        </p>
      </section>

      {/* Audit log */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Audit log</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          HZSec maintains an append-only NDJSON log at <code className="font-mono text-accent">~/.shieldops/audit.log</code>.
          Every significant event is recorded — scans, applied fixes, API key changes, monitor start/stop.
          Past entries cannot be modified; clearing the log itself creates a new entry recording the clear.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          The log is readable from the desktop app (Reports view) and exportable as JSON or PDF. See
          <Link href="/docs/compliance" className="text-accent hover:underline ml-1">Compliance</Link> for
          export details.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/cli" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← CLI Reference
        </Link>
        <Link href="/docs/ai-assistant" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          AI Assistant →
        </Link>
      </div>
    </article>
  );
}
