import Link from 'next/link';

export const metadata = {
  title: 'CLI Reference — HZSec Docs',
  description: 'Complete CLI reference for hzsec scan — every flag, output format, exit code, and CI integration example.',
};

export default function CLIPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Scanning
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        CLI Reference
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        The <code className="font-mono text-accent">hzsec</code> CLI is installed alongside the desktop app.
        It exposes the full scanner with output format options suited for CI pipelines and scripting.
      </p>

      {/* hzsec scan */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-1">
          <code className="font-mono text-accent">hzsec scan [path]</code>
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Scan a file or directory for security issues. Defaults to the current directory if no path is given.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# Scan ./src with all detectors (full mode, default)
hzsec scan ./src

# Quick mode — faster, covers code, config, and web only
hzsec scan --mode quick ./src

# Scan for secrets only
hzsec scan --mode secret ./src

# Output as JSON (for CI scripts or other tooling)
hzsec scan --format json . > results.json

# Output as SARIF (for GitHub Code Scanning)
hzsec scan --format sarif --output results.sarif .

# Fail the pipeline if any CRITICAL or HIGH findings exist
hzsec scan --fail-on critical,high .`}</code>
        </pre>
      </section>

      {/* Flags table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Flags</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Flag</th>
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Short</th>
                <th className="text-left py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  flag: '--mode <mode>',
                  short: '-m',
                  desc: 'Scan mode. Default: full. Choices: full | quick | secret | config | web | hardening | custom',
                },
                {
                  flag: '--format <format>',
                  short: '-f',
                  desc: 'Output format. Default: text. Choices: text | json | sarif',
                },
                {
                  flag: '--output <file>',
                  short: '-o',
                  desc: 'Write output to a file instead of stdout.',
                },
                {
                  flag: '--fail-on <severities>',
                  short: '',
                  desc: 'Exit with code 1 if any findings match. Comma-separated list of: CRITICAL, HIGH, MEDIUM, LOW, INFO. Example: --fail-on critical,high',
                },
                {
                  flag: '--no-color',
                  short: '',
                  desc: 'Disable ANSI colors in text output.',
                },
                {
                  flag: '--quiet',
                  short: '',
                  desc: 'Suppress the progress spinner. Only findings and the summary are printed.',
                },
                {
                  flag: '--version',
                  short: '-v',
                  desc: 'Print the installed hzsec version and exit.',
                },
              ].map(({ flag, short, desc }) => (
                <tr key={flag}>
                  <td className="py-2.5 pr-6 font-mono text-xs text-accent align-top whitespace-nowrap">{flag}</td>
                  <td className="py-2.5 pr-6 font-mono text-xs text-muted align-top">{short}</td>
                  <td className="py-2.5 text-xs text-muted leading-relaxed">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scan modes */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Scan modes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Mode</th>
                <th className="text-left py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted">Detectors active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { mode: 'full',      detectors: 'code, config, secret, web, hardening — all detectors (default)' },
                { mode: 'quick',     detectors: 'code, config, web — faster, targeted at changed files in practice' },
                { mode: 'secret',    detectors: 'Secrets and credentials only' },
                { mode: 'config',    detectors: 'Configuration files only' },
                { mode: 'web',       detectors: 'Web exposure issues only' },
                { mode: 'hardening', detectors: 'System hardening and CI/CD config only' },
                { mode: 'custom',    detectors: 'code, config, secret, web, hardening + any custom rules' },
              ].map(({ mode, detectors }) => (
                <tr key={mode}>
                  <td className="py-2.5 pr-6 font-mono text-xs text-accent align-top">{mode}</td>
                  <td className="py-2.5 text-xs text-muted leading-relaxed">{detectors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Output formats */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Output formats</h2>

        <h3 className="text-base font-semibold text-text mb-3">text (default)</h3>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Human-readable terminal output with ANSI colors. Findings are sorted by severity,
          each showing the severity level, title, file path, line number, and a brief
          description. A posture score is printed at the end.
        </p>

        <h3 className="text-base font-semibold text-text mb-3">json</h3>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Structured JSON containing the full findings array, posture score, scan metadata,
          and risk distribution. Suitable for piping into other tools or storing as a CI artifact.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed mb-4">
          <code>{`hzsec scan --format json . > results.json`}</code>
        </pre>

        <h3 className="text-base font-semibold text-text mb-3">sarif</h3>
        <p className="text-sm text-muted leading-relaxed mb-3">
          SARIF v2.1.0 output — the standard format for GitHub Code Scanning and other
          SAST tooling integrations.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`hzsec scan --format sarif --output results.sarif .`}</code>
        </pre>
      </section>

      {/* Exit codes */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Exit codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Code</th>
                <th className="text-left py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { code: '0', meaning: 'Scan completed. No findings matched the --fail-on threshold (or --fail-on was not set).' },
                { code: '1', meaning: 'Scan completed. One or more findings matched the --fail-on severity list.' },
                { code: '2', meaning: 'Invalid arguments or runtime error. Details printed to stderr.' },
              ].map(({ code, meaning }) => (
                <tr key={code}>
                  <td className="py-2.5 pr-6 font-mono text-sm text-accent align-top">{code}</td>
                  <td className="py-2.5 text-sm text-muted leading-relaxed">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CI example */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">GitHub Actions example</h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`- name: HZSec security scan
  run: |
    hzsec scan --format sarif --output hzsec.sarif .
    hzsec scan --fail-on critical,high .

- name: Upload SARIF to GitHub Code Scanning
  if: always()
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: hzsec.sarif`}</code>
        </pre>
        <p className="text-xs text-muted mt-3 leading-relaxed">
          Running the SARIF pass first (exit code 0 always) ensures the artifact is
          uploaded even when the fail-on pass returns exit code 1.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/scan-modes" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Scan Modes
        </Link>
        <Link href="/docs/architecture" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Architecture →
        </Link>
      </div>
    </article>
  );
}
