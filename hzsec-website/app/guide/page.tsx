import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'How it works — HZSec',
  description: 'A short walkthrough showing how to install, scan, and review findings in HZSec.'
};

const steps = [
  {
    title: 'Install the desktop app',
    body: 'Download the current desktop build and sign in with your HZSec account.'
  },
  {
    title: 'Run your first scan',
    body: 'Point HZSec at a repo or folder, then run a quick local scan to surface findings.'
  },
  {
    title: 'Review and follow the next step',
    body: 'Open the finding, read the context, and use the suggested remediation path.'
  }
] as const;

export default function GuidePage() {
  return (
    <>
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-muted">How it works</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A simple workflow for finding and fixing issues.</h1>
          <p className="mt-4 text-muted">
            HZSec keeps the workflow focused: install the app, scan locally,
            review the result, and move on with a clear next step.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map(({ title, body }, index) => (
            <div key={title} className="rounded-xl border border-border bg-panel p-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
                {index + 1}
              </div>
              <h2 className="mt-4 text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-panel/40 p-6 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium">What you get in the app</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>• Local scans that run on your machine</li>
              <li>• Live monitoring for watched folders</li>
              <li>• Findings with context and remediation guidance</li>
              <li>• License and billing controls in the dashboard</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-border bg-bg p-5">
            <div>
              <div className="text-sm font-medium text-text">Demo flow</div>
              <p className="mt-2 text-sm text-muted">
                Use this guide as the lightweight demo path for new users.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/download" className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90">Download</Link>
              <Link href="/pricing" className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:text-text">Pricing</Link>
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}
