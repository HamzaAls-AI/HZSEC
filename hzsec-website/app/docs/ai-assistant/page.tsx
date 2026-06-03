import Link from 'next/link';

export const metadata = {
  title: 'AI Assistant — HZSec Docs',
  description: 'How the HZSec AI assistant works — breach intelligence, API key setup, what it can and cannot see, and example prompts.',
};

const breaches = [
  { name: 'Uber (2022)',        vuln: 'Hardcoded credentials in source code',     impact: 'Full internal system access' },
  { name: 'Equifax (2017)',     vuln: 'Unpatched Apache Struts CVE-2017-5638',     impact: '147M records exfiltrated' },
  { name: 'Verkada (2021)',     vuln: 'Exposed admin credentials in public JS',    impact: 150000 + ' cameras compromised' },
  { name: 'Log4Shell (2021)',   vuln: 'JNDI injection in log4j (CVE-2021-44228)',  impact: 'RCE on millions of servers' },
  { name: 'Capital One (2019)', vuln: 'Misconfigured WAF + SSRF',                  impact: '106M records exposed' },
  { name: 'Toyota (2023)',      vuln: 'GitHub repo with hardcoded API key',         impact: '2M customer records exposed' },
  { name: 'CircleCI (2022)',    vuln: 'Secrets in memory scraped from CI runner',  impact: 'Customer tokens compromised' },
  { name: 'Twitch (2021)',      vuln: 'Misconfigured server + .git exposed',        impact: '125GB source code leaked' },
  { name: 'Okta (2022)',        vuln: 'Session token from third-party contractor', impact: '366 customers affected' },
  { name: 'Codecov (2021)',     vuln: 'Supply chain: bash uploader modified',      impact: 'CI secrets harvested en masse' },
];

export default function AIAssistantPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Defend
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        AI Assistant
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        The HZSec AI assistant is pre-loaded with your scan findings and a library
        of real-world breach intelligence. Ask it anything about your results —
        without your source code ever leaving your machine.
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">How it works</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          When you send a message, HZSec builds a context payload from your scan
          findings and sends it to the Anthropic API. The context contains structured
          metadata about each finding — severity, type, CWE reference, compliance
          framework tags, and a line-number hint. It does not contain source code,
          file paths, variable names, or any content from your files.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-4">
          This means the assistant can answer <em className="text-text">what is wrong and why</em> and <em className="text-text">how to fix it</em>,
          but it cannot quote your code back to you — which is intentional.
        </p>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">What the assistant can see</div>
          <ul className="mt-2 space-y-1.5 text-muted leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> Finding type (e.g., SECRET_EXPOSED, VULN_SQLI)</li>
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> Severity level and CVSS score (for CVEs)</li>
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> Detector category and CWE/CVE reference</li>
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> Compliance framework tags (OWASP, CIS, SOC 2)</li>
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> File type hint (e.g., &quot;Python file&quot;) and approximate line number</li>
            <li className="flex items-start gap-2"><span className="text-accent shrink-0">·</span> Breach intelligence context (matched breaches from the library)</li>
          </ul>
        </div>
      </section>

      {/* Breach intelligence */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Breach intelligence</h2>
        <p className="text-sm text-muted leading-relaxed mb-6">
          10 documented real-world breaches are embedded as permanent assistant context.
          When a finding pattern matches a breach — for example, a hardcoded credential
          matches the Uber 2022 pattern — the assistant references the specific incident
          and the timeline from exposure to exploit.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Incident</th>
                <th className="text-left py-2.5 pr-6 font-mono text-[11px] uppercase tracking-wider text-muted">Root cause</th>
                <th className="text-left py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {breaches.map(({ name, vuln, impact }) => (
                <tr key={name}>
                  <td className="py-2.5 pr-6 text-xs font-semibold text-text align-top whitespace-nowrap">{name}</td>
                  <td className="py-2.5 pr-6 text-xs text-muted leading-relaxed align-top">{vuln}</td>
                  <td className="py-2.5 text-xs text-muted leading-relaxed align-top">{impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted mt-4 leading-relaxed">
          When your scan matches a breach pattern, the assistant surfaces it automatically.
          You don&apos;t need to prompt for it.
        </p>
      </section>

      {/* API key setup */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">API key setup</h2>

        <h3 className="text-base font-semibold text-text mb-3">Free tier — bring your own key</h3>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The free tier requires an Anthropic API key. Get one from{' '}
          <a href="https://console.anthropic.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.
          In HZSec, go to <strong className="text-text">Settings → AI Assistant → API Key</strong>, paste your key,
          and click <strong className="text-text">Save</strong>.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-6">
          The key is encrypted with AES-256-GCM before being written to disk and is
          never sent to HZSec. See <Link href="/docs/architecture" className="text-accent hover:underline">Architecture</Link> for
          the full encryption details.
        </p>

        <h3 className="text-base font-semibold text-text mb-3">Pro tier — managed key</h3>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Pro subscribers get 1,000 assistant messages per month included — no API key
          setup required. The managed key is provisioned server-side and never stored
          on your device. If you exceed 1,000 messages, you can add your own key to
          continue without limits.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# Free tier — use your own key
hzsec config set anthropic-key sk-ant-...

# Check remaining managed messages (Pro)
hzsec config get assistant-quota
# Remaining: 847 / 1000 this month`}</code>
        </pre>
      </section>

      {/* Example prompts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">What to ask</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The assistant is not limited to your current findings. You can ask general security questions,
          review a code snippet you paste in, or explore a CVE in depth.
        </p>
        <div className="space-y-3">
          {[
            { prompt: 'Walk me through every CRITICAL finding and tell me which one to fix first.', context: 'Prioritization across findings' },
            { prompt: 'The exposed AWS key — how quickly could it be exploited if it was committed to a public repo?', context: 'Breach timeline context' },
            { prompt: 'What\'s the difference between the SQL injection in finding #3 and a parameterized query?', context: 'Remediation explanation' },
            { prompt: 'Which of my open findings map to OWASP A01?', context: 'Compliance-aware triage' },
            { prompt: 'Show me what this app looks like from an attacker\'s perspective given these findings.', context: 'Threat modeling' },
            { prompt: 'I patched the lodash CVE — is there anything else in the dependency chain I should check?', context: 'Dependency chain analysis' },
          ].map(({ prompt, context }) => (
            <div key={prompt} className="rounded-lg border border-border bg-panel p-4">
              <p className="text-sm text-text font-medium mb-1">&ldquo;{prompt}&rdquo;</p>
              <p className="text-xs text-muted">{context}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offline behavior */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Offline behavior</h2>
        <p className="text-sm text-muted leading-relaxed">
          Scanning and Live Monitor work fully offline — they never need a network
          connection. The AI assistant requires a live connection to the Anthropic API.
          If you&apos;re offline, the assistant shows a &ldquo;No connection&rdquo; state but all
          findings, scores, and audit log entries remain accessible locally.
        </p>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/architecture" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Architecture
        </Link>
        <Link href="/docs/live-monitor" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Live Monitor →
        </Link>
      </div>
    </article>
  );
}
