import Link from 'next/link';

export const metadata = {
  title: 'First Scan — HZSec Docs',
  description: 'Run your first HZSec security scan, read the results, use auto-fix, and export your findings.',
};

export default function FirstScanPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Getting Started
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        First Scan
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        A walkthrough of scanning a project from scratch — what each part of the
        results view means, how to drill into a finding, and how auto-fix works.
      </p>

      {/* Step 1 — Select a folder */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text mb-4">1. Select a folder to scan</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Open HZSec and click <strong className="text-text">New Scan</strong> in the left sidebar.
          Use the folder picker to choose your project root — this can be a repo, a
          subdirectory, or a single module. HZSec respects <code className="font-mono text-accent">.gitignore</code> by
          default, so <code className="font-mono text-accent">node_modules</code>, build output, and
          dependency folders are automatically excluded.
        </p>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Tip</div>
          <p className="text-muted leading-relaxed">
            Scanning a large monorepo? Target a specific package directory first to get
            results faster. You can run additional scans against other paths and HZSec
            keeps each in your history separately.
          </p>
        </div>
      </section>

      {/* Step 2 — Choose scan modes */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text mb-4">2. Choose scan modes</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          HZSec runs all six detection modes by default. You can toggle individual modes
          in the scan settings panel before starting:
        </p>
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-2.5 mb-4">
          {[
            'Secrets & Credentials',
            'Insecure Configuration',
            'Vulnerable Code Patterns',
            'Dependency CVEs',
            'Web Exposure',
            'System Hardening',
          ].map((m) => (
            <div key={m} className="flex items-center gap-2.5 rounded-md border border-border bg-panel px-3 py-2 text-sm text-text">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              {m}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted leading-relaxed">
          For day-to-day pre-commit use, consider <strong className="text-text">Quick Scan</strong> (changed files only) or running a targeted mode. See <Link href="/docs/scan-modes" className="text-accent hover:underline">Scan Modes</Link> for details.
        </p>
      </section>

      {/* Step 3 — Reading results */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text mb-4">3. Reading your results</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          When the scan completes, you see a summary dashboard with your security score
          and a findings list grouped by severity.
        </p>

        <h3 className="text-base font-semibold text-text mb-3">Security score</h3>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The score is a 0–100 number based on the severity and count of open findings
          relative to the size of your codebase. A higher score means fewer open issues.
          HZSec tracks this across scans so you can see whether security is trending up
          or down over time.
        </p>

        <h3 className="text-base font-semibold text-text mb-3">Severity levels</h3>
        <div className="space-y-2 mb-4">
          {[
            { level: 'CRITICAL', color: 'bg-red-500/10 text-red-400 border-red-500/20', desc: 'Exploitable now with known techniques. Fix before the next commit.' },
            { level: 'HIGH',     color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', desc: 'Significant risk. Should be resolved within days.' },
            { level: 'MEDIUM',   color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', desc: 'Real issue but harder to exploit directly. Address in the current sprint.' },
            { level: 'LOW',      color: 'bg-green-500/10 text-green-400 border-green-500/20', desc: 'Best-practice gap. No immediate threat but worth cleaning up.' },
          ].map(({ level, color, desc }) => (
            <div key={level} className="flex items-start gap-3">
              <span className={`shrink-0 inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${color}`}>{level}</span>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-text mb-3">Drilling into a finding</h3>
        <p className="text-sm text-muted leading-relaxed">
          Click any finding in the list to open the detail panel. Each finding includes:
          the file path and line number, a plain-language explanation of why this is
          risky, a reference to the relevant CWE or CVE, the compliance frameworks it
          affects (OWASP Top 10, CIS, SOC 2), and a recommended remediation. If
          auto-fix is available, a button appears in the panel.
        </p>
      </section>

      {/* Step 4 — Auto-fix */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text mb-4">4. Using auto-fix</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          For deterministic, low-risk findings — exposed API key format, <code className="font-mono text-accent">DEBUG=True</code>,
          insecure <code className="font-mono text-accent">http://</code> endpoint, weak TLS version string — HZSec can
          apply the fix directly to your file.
        </p>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1 mb-4">
          <li>Click <strong className="text-text">Apply Fix</strong> in the finding detail panel.</li>
          <li>Review the diff. HZSec shows exactly what will change before touching any file.</li>
          <li>Click <strong className="text-text">Confirm</strong> to write the change, or <strong className="text-text">Dismiss</strong> to leave the file untouched.</li>
          <li>The finding is marked as resolved in the audit log with a timestamp.</li>
        </ol>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Important</div>
          <p className="text-muted leading-relaxed">
            Auto-fix only applies to findings where the correct change is unambiguous.
            Complex issues — logic bugs, authentication flaws, architectural misconfigurations —
            are surfaced with an explanation and remediation guidance, but no auto-fix.
          </p>
        </div>
      </section>

      {/* Step 5 — Export */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">5. Exporting results</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The audit log captures every scan, finding, and applied fix. To export:
        </p>
        <ul className="space-y-2 text-sm text-muted leading-relaxed list-disc list-inside ml-1 mb-4">
          <li>Go to <strong className="text-text">Reports</strong> in the sidebar.</li>
          <li>Select a scan or a date range.</li>
          <li>Click <strong className="text-text">Export Report</strong> — available as structured JSON or a printable PDF.</li>
        </ul>
        <p className="text-sm text-muted leading-relaxed">
          Export is available through the desktop app only — the CLI does not currently
          expose a report command. JSON and PDF are both available from the Reports view.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/install" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Installation
        </Link>
        <Link href="/docs/scan-modes" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Scan Modes →
        </Link>
      </div>
    </article>
  );
}
