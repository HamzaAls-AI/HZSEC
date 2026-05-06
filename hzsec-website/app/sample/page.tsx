import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'Sample scan — HZSec',
  description: 'A public example of what a HZSec scan looks like before you install the app.'
};

const findings = [
  {
    severity: 'High',
    title: 'Hardcoded secret detected',
    detail: 'A token-looking value appears in config.ts and should be moved to an environment variable.'
  },
  {
    severity: 'Medium',
    title: 'Insecure public endpoint',
    detail: 'A route accepts unauthenticated requests and should be gated or rate limited.'
  },
  {
    severity: 'Low',
    title: 'Missing retry guidance',
    detail: 'The remediation notes can be improved with a short playbook for the owning team.'
  }
] as const;

export default function SamplePage() {
  return (
    <>
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-muted">Sample scan</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">See what HZSec finds before you install it.</h1>
          <p className="mt-4 text-muted">
            This is a public example of the type of output HZSec produces: clear findings,
            severity, and a concrete next step.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {findings.map(item => (
            <div key={item.title} className="rounded-xl border border-border bg-panel p-6">
              <div className="text-xs uppercase tracking-wider text-muted">{item.severity}</div>
              <h2 className="mt-2 text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-panel/40 p-6">
          <h2 className="text-lg font-medium">What makes this useful</h2>
          <p className="mt-2 text-sm text-muted">
            A sample scan reduces uncertainty and helps users understand the value before they download.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/download" className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90">
              Download the app
            </Link>
            <Link href="/guide" className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:text-text">
              See the workflow
            </Link>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}
