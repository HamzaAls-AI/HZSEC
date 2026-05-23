import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Lock, ServerOff, FileLock2, Cpu, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

// /security — the trust page. Concrete claims, not marketing fluff. The
// content here is the source of truth for what HZSec promises about user
// data; the homepage privacy section summarizes a subset of it.

export const metadata = {
  title: 'Security & Privacy · HZSec',
  description: 'How HZSec handles your code, your scan results, and your account data. Local-first by architecture.'
};

export default function SecurityPage() {
  return (
    <>
      <MarketingHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="text-xs uppercase tracking-wider text-muted">Security & privacy</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your code never leaves your machine.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            HZSec is local-first by architecture, not by toggle. The scanner
            runs on your CPU, against files on your disk, and writes findings
            to your local store. There is no upload step.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">What HZSec does with your data</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DataCard
              Icon={Cpu}
              title="Source code"
              status="Stays local"
              body="The scanner reads your files directly from disk and analyzes them in-process. No copies are sent off-host. Ever."
            />
            <DataCard
              Icon={FileLock2}
              title="Scan results"
              status="Stays local by default"
              body="Findings land in a local store under your home directory. You can opt into syncing them to a workspace for team review — that's an explicit, separate action."
            />
            <DataCard
              Icon={ServerOff}
              title="Telemetry"
              status="Off by default"
              body="No metrics, no error pings, no usage reporting unless you opt in. We don't need it to ship a working scanner."
            />
            <DataCard
              Icon={Lock}
              title="License keys"
              status="Validated locally"
              body="License signature checks happen offline. There is no per-scan check-in to a remote server."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Architecture guarantees</h2>
          <p className="mt-3 text-base text-muted">
            These aren&apos;t promises we can break with a config flag — they&apos;re properties of how HZSec is built.
          </p>
          <ul className="mt-8 space-y-4">
            <Guarantee
              Icon={ShieldCheck}
              title="The scanner is a single binary"
              body="HZSec ships as one signed executable. It has no companion daemon, no background process, and no listener. When you're not running it, it isn't doing anything."
            />
            <Guarantee
              Icon={Eye}
              title="Detectors are auditable"
              body="Every detector is plain code — no model weights, no remote rulebooks fetched at scan time. You can read, fork, and pin the rules you depend on."
            />
            <Guarantee
              Icon={ServerOff}
              title="No 'phone home' on scan"
              body="The scan command makes zero outbound network calls unless you explicitly enable a feature that requires one (e.g., CVE lookups, which can be cached and run offline)."
            />
            <Guarantee
              Icon={Lock}
              title="Account data is minimal"
              body="If you create a HZSec account, we store an email, a license key, and a billing record. That's the full list. We don't have your code to lose."
            />
          </ul>
        </div>
      </section>

      <section className="bg-panel">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted">
            Found a security issue in HZSec itself? We take that seriously.
          </div>
          <Link
            href="mailto:security@hzsec.io"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2 text-sm text-text hover:border-accent/60 transition-colors"
          >
            Email security@hzsec.io <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function DataCard({
  Icon, title, status, body
}: {
  Icon: typeof Lock; title: string; status: string; body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <div className="flex items-center gap-2">
        <Icon className="text-accent" size={18} />
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-panel2 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-ok">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
        {status}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Guarantee({
  Icon, title, body
}: {
  Icon: typeof Lock; title: string; body: string;
}) {
  return (
    <li className="flex gap-4 rounded-lg border border-border bg-panel p-5">
      <Icon className="mt-0.5 shrink-0 text-accent" size={18} />
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}
