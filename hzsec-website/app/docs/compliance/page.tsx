import Link from 'next/link';

export const metadata = {
  title: 'Compliance — HZSec Docs',
  description: 'OWASP, CIS, and SOC 2 mapping in HZSec — how findings are tagged, how gap percentages are calculated, and how to export your audit log.',
};

const frameworks = [
  {
    name: 'OWASP Top 10',
    desc: 'The ten most critical web application security risks. Every HZSec finding is mapped to an OWASP category (A01–A10) where applicable.',
    categories: ['A01 Broken Access Control', 'A02 Cryptographic Failures', 'A03 Injection', 'A04 Insecure Design', 'A05 Security Misconfiguration', 'A06 Vulnerable Components', 'A07 Auth Failures', 'A08 Integrity Failures', 'A09 Logging Failures', 'A10 SSRF'],
  },
  {
    name: 'CIS Benchmarks',
    desc: 'Center for Internet Security hardening guidelines. HZSec maps system hardening and configuration findings to CIS controls for Linux, Docker, and Kubernetes environments.',
    categories: ['CIS Docker Benchmark', 'CIS Kubernetes Benchmark', 'CIS Linux Benchmark (RHEL, Debian, Ubuntu)', 'CIS nginx Benchmark', 'CIS AWS Foundations'],
  },
  {
    name: 'SOC 2 (CC criteria)',
    desc: 'Trust Service Criteria for Security. HZSec maps applicable findings to CC6.x (Logical and Physical Access Controls) and CC7.x (System Operations) controls.',
    categories: ['CC6.1 Access control', 'CC6.2 Authentication', 'CC6.3 Access removal', 'CC7.1 System config', 'CC7.2 Anomaly detection'],
  },
];

export default function CompliancePage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Govern
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Compliance
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        HZSec automatically maps every finding to the relevant compliance framework
        controls. No manual tagging, no spreadsheets — the audit trail builds itself
        as you scan and fix.
      </p>

      {/* Frameworks */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-6">Supported frameworks</h2>
        <div className="space-y-6">
          {frameworks.map(({ name, desc, categories }) => (
            <div key={name} className="rounded-xl border border-border bg-panel p-6">
              <h3 className="text-base font-bold text-text mb-2">{name}</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-md bg-bg border border-border text-xs font-mono text-muted">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Auto-tagging */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Auto-tagging</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Every finding is tagged at scan time. You don&apos;t need to configure
          which findings map to which frameworks — the mapping is built into
          the detection rules. Example:
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`// Example finding with auto-applied framework tags
{
  "id": "f_a1b2c3",
  "type": "VULN_SQLI",
  "severity": "HIGH",
  "description": "SQL injection via string concatenation",
  "frameworks": [
    "OWASP:A03",       // Injection
    "CWE-89",          // Improper Neutralization of SQL Input
    "SOC2:CC7.1"       // System configuration
  ]
}`}</code>
        </pre>
      </section>

      {/* Gap percentage */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Compliance gap percentage</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The Compliance view shows a gap percentage for each framework. This
          number represents the proportion of a framework&apos;s mapped controls
          that have no open findings against them.
        </p>
        <div className="rounded-lg border border-border bg-panel p-5 text-sm space-y-3 mb-4">
          <p className="text-muted leading-relaxed">
            <strong className="text-text">Example:</strong> OWASP Top 10 has 10 categories. If your
            scan has open findings tagged to OWASP:A03 (Injection) and OWASP:A05
            (Security Misconfiguration), 2 categories are &ldquo;failing&rdquo; and 8 are
            &ldquo;passing&rdquo; — giving you an 80% OWASP score.
          </p>
          <p className="text-muted leading-relaxed">
            Fixing those 2 findings moves the score to 100%. The score reflects
            what&apos;s been scanned — not what hasn&apos;t been checked yet.
          </p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Note</div>
          <p className="text-muted leading-relaxed">
            The gap percentage is based on HZSec&apos;s automated scan coverage. It does
            not substitute for a manual control assessment or a formal certification audit.
          </p>
        </div>
      </section>

      {/* Fix memory and recurrence */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Fix memory and recurrence tracking</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          When you resolve a finding — either via auto-fix or manually — HZSec records the
          fix in the audit log. If the same issue reappears in a later scan (same type,
          same file region), HZSec marks it as <strong className="text-text">recurring</strong>.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Recurring findings signal that the surface patch didn&apos;t address the root cause.
          They are highlighted differently in the findings list and in exported reports, so
          auditors can see the pattern.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`// Audit log entry for a recurring finding
{
  "finding_id": "f_a1b2c3",
  "type": "SECRET_EXPOSED",
  "first_seen": "2025-01-10T14:22:00Z",
  "resolved": "2025-01-10T15:05:00Z",
  "reappeared": "2025-01-14T09:18:00Z",
  "recurrence_count": 2,
  "status": "RECURRING"
}`}</code>
        </pre>
      </section>

      {/* Audit log export */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Audit log export</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The audit log is formatted to be shareable with an auditor without
          additional interpretation. Each export includes scan timestamps,
          finding summaries with severities, framework tags, applied fixes,
          and recurrence status.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Export is available from the desktop app&apos;s <strong className="text-text">Reports</strong> view.
          Select a scan or a date range, choose JSON or PDF, and click{' '}
          <strong className="text-text">Export</strong>. The CLI does not currently expose a report command.
        </p>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">What the export contains</h3>
        <div className="space-y-2">
          {[
            'Scan timestamps and target paths (as directory-type hints, not absolute paths)',
            'Finding IDs, types, severities, and CWE/CVE references',
            'Framework tags (OWASP, CIS, SOC 2) per finding',
            'Resolution timestamps and method (auto-fix, manual)',
            'Recurrence flags and count',
            'Security score over time',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-muted">
              <span className="text-accent mt-0.5 shrink-0">·</span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* What HZSec is not */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">What HZSec doesn&apos;t do</h2>
        <div className="rounded-lg border border-border bg-panel p-5 space-y-3 text-sm text-muted leading-relaxed">
          <p>
            <strong className="text-text">HZSec is a developer security tool, not a compliance certifier.</strong>{' '}
            It helps you find issues, track fixes, and prepare evidence — but it does not
            issue compliance certifications or replace a professional penetration test.
          </p>
          <p>
            A 100% gap score in HZSec means every finding HZSec can detect has been
            resolved. It does not mean your application is vulnerability-free or that
            you will pass a SOC 2 audit. Use HZSec to strengthen your posture and
            generate supporting evidence — then work with a qualified auditor for
            formal certification.
          </p>
        </div>
      </section>

      {/* Team plan */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Team plan — shared audit trail</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          On the Team plan, all seats share a consolidated compliance view and audit trail.
          Each finding is attributed to the team member who resolved it, and shared notes
          can be attached to any finding for auditor context.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Compliance gap tracking, audit log export, framework mapping, and recurrence
          tracking are available on all plans — including Free.
          See <Link href="/pricing" className="text-accent hover:underline">Pricing</Link> for
          a full feature comparison.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/live-monitor" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Live Monitor
        </Link>
        <Link href="/docs" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Back to Overview →
        </Link>
      </div>
    </article>
  );
}
