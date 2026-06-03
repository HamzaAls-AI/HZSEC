import Link from 'next/link';

export const metadata = {
  title: 'Scan Modes — HZSec Docs',
  description: 'The six detection categories HZSec uses, how to target individual modes, and how .gitignore exclusions work.',
};

const modes = [
  {
    num: '01',
    name: 'Secrets & Credentials',
    what: 'Finds API keys, tokens, connection strings, and passwords that have been committed to code — intentionally or by accident.',
    details: [
      '40+ named patterns covering AWS, GCP, Azure, GitHub, Stripe, Twilio, SendGrid, and dozens of other services.',
      'Entropy analysis catches high-entropy strings that don\'t match a named pattern but are statistically likely to be secrets.',
      'Checks both current files and, if run in a git repo, commit history back to the initial commit.',
    ],
    examples: ['AWS access key in .env.example', 'GitHub PAT hardcoded in CI config', 'Database password in source file'],
  },
  {
    num: '02',
    name: 'Insecure Configuration',
    what: 'Detects configuration values that are known to weaken security — regardless of what language or framework you\'re using.',
    details: [
      'Debug mode enabled in production config (Django DEBUG=True, Flask debug=True, Rails config.log_level = :debug).',
      'HTTP endpoints where HTTPS should be used.',
      'Weak TLS versions (TLS 1.0, TLS 1.1) or insecure cipher suites.',
      'Missing security headers in web server configs (nginx, Apache, Caddy).',
    ],
    examples: ['DEBUG=True in .env', 'http:// callback URL', 'SSLv3 in nginx.conf'],
  },
  {
    num: '03',
    name: 'Vulnerable Code Patterns',
    what: 'Identifies code constructs that are commonly exploited in the OWASP Top 10 and CWE catalog.',
    details: [
      'SQL injection via string concatenation or f-string formatting in query builders.',
      'Cross-site scripting (XSS) via unsanitized user input in template rendering.',
      'Path traversal in file read/write operations.',
      'Unsafe deserialization using pickle, YAML.load(), or eval().',
      'Command injection via subprocess with shell=True and user input.',
    ],
    examples: ['f"SELECT * FROM users WHERE id={user_id}"', 'pickle.loads(untrusted_data)', 'subprocess.run(cmd, shell=True)'],
  },
  {
    num: '04',
    name: 'Dependency CVEs',
    what: 'Checks every dependency in your lockfiles against current CVE databases — without sending your package list anywhere.',
    details: [
      'Reads: package.json / package-lock.json, requirements.txt / Pipfile.lock, go.sum, Cargo.lock, Gemfile.lock, pom.xml.',
      'Cross-references CISA Known Exploited Vulnerabilities (KEV) catalog and NVD.',
      'CVE data is pulled to your machine daily. Scans run against the local copy — no package names leave your device.',
      'Findings include CVSS score, affected version range, patched version, and a link to the CVE advisory.',
    ],
    examples: ['lodash < 4.17.21 (Prototype Pollution)', 'log4j 2.x < 2.15.0 (Log4Shell)', 'requests < 2.32.0 (SSRF)'],
  },
  {
    num: '05',
    name: 'Web Exposure',
    what: 'Surfaces security gaps in how your web application presents itself to browsers and upstream proxies.',
    details: [
      'Open or overly permissive CORS configurations (`Access-Control-Allow-Origin: *`).',
      'Missing or misconfigured Content Security Policy (CSP).',
      'Absent security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`.',
      'Exposed admin routes or sensitive paths accessible without authentication middleware.',
    ],
    examples: ['cors({ origin: "*" }) in Express', 'No CSP header in Next.js config', 'Admin route missing auth check'],
  },
  {
    num: '06',
    name: 'System Hardening',
    what: 'Reviews your project\'s infrastructure and deployment configuration for hardening gaps based on CIS benchmarks.',
    details: [
      'Overly permissive file permissions (world-writable scripts, 0777 on sensitive config).',
      'Docker: running as root, no USER directive, privileged mode, sensitive mounts.',
      'CI/CD: secrets printed to logs, environment variables exposed in build artifacts.',
      'SSH config: PasswordAuthentication enabled, PermitRootLogin yes.',
    ],
    examples: ['chmod 777 deploy.sh', 'Docker USER not set', 'env vars echoed in GitHub Actions'],
  },
];

export default function ScanModesPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Scanning
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Scan Modes
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        HZSec runs six parallel detection engines in a single scan. Each targets
        a distinct class of vulnerability. You can run all six together or target
        one mode at a time.
      </p>

      {/* Mode cards */}
      <div className="space-y-8 mb-12">
        {modes.map(({ num, name, what, details, examples }) => (
          <section key={num} className="rounded-xl border border-border bg-panel p-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="font-mono text-[11px] text-muted shrink-0 mt-1">{num}</span>
              <div>
                <h2 className="text-base font-bold text-text mb-2">{name}</h2>
                <p className="text-sm text-muted leading-relaxed">{what}</p>
              </div>
            </div>

            <div className="ml-8 space-y-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">What it checks</div>
                <ul className="space-y-1.5">
                  {details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-muted leading-relaxed">
                      <span className="text-accent mt-1 shrink-0">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Example findings</div>
                <div className="flex flex-wrap gap-2">
                  {examples.map((e) => (
                    <code key={e} className="px-2 py-0.5 rounded bg-bg border border-border text-xs font-mono text-text">
                      {e}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Targeting a specific mode */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Targeting a specific mode</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Pass a single mode name with <code className="font-mono text-accent">--mode</code>.
          Available modes: <code className="font-mono text-accent">full</code> (default), <code className="font-mono text-accent">quick</code>, <code className="font-mono text-accent">secret</code>, <code className="font-mono text-accent">config</code>, <code className="font-mono text-accent">web</code>, <code className="font-mono text-accent">hardening</code>, <code className="font-mono text-accent">custom</code>.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# Secrets only
hzsec scan --mode secret ./src

# Config files only
hzsec scan --mode config ./src

# All detectors (default)
hzsec scan --mode full ./src`}</code>
        </pre>
      </section>

      {/* Quick mode */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Quick mode</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Quick mode runs the code, config, and web detectors — skipping hardening and
          dependency checks. It completes faster and is well-suited for pre-commit use.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`hzsec scan --mode quick ./src

# Use as a pre-commit hook — add to .git/hooks/pre-commit:
#!/bin/sh
hzsec scan --mode quick --fail-on critical .`}</code>
        </pre>
      </section>

      {/* .gitignore */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">.gitignore</h2>
        <p className="text-sm text-muted leading-relaxed">
          HZSec respects <code className="font-mono text-accent">.gitignore</code> by default.
          Build artifacts, <code className="font-mono text-accent">node_modules</code>, virtual environments,
          and compiled output are automatically excluded from every scan.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/first-scan" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← First Scan
        </Link>
        <Link href="/docs/cli" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          CLI Reference →
        </Link>
      </div>
    </article>
  );
}
