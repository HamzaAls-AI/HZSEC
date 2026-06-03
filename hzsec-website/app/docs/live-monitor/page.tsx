import Link from 'next/link';

export const metadata = {
  title: 'Live Monitor — HZSec Docs',
  description: 'How HZSec Live Monitor works — setting up file watching, how new findings surface, performance, and exclusions.',
};

export default function LiveMonitorPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Defend
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Live Monitor
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        Live Monitor watches your source directory while you code. When a file
        change introduces a new security finding, HZSec surfaces it immediately —
        without you having to trigger a manual scan.
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">How it works</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Live Monitor uses the operating system&apos;s native file event API —
          <strong className="text-text"> FSEvents</strong> on macOS and{' '}
          <strong className="text-text">ReadDirectoryChangesW</strong> on Windows.
          When a file is saved, HZSec queues a targeted scan of that file
          (and any files it imports, for dependency analysis) using the same
          six detection engines as a full scan.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Only files that have changed are re-scanned. The existing findings
          for unchanged files are preserved from the last full scan. This
          means incremental results appear in under a second for most single-file
          saves.
        </p>
        <div className="grid grid-cols-1 min-[550px]:grid-cols-3 gap-3">
          {[
            { stat: '< 1s', label: 'Typical latency from save to finding' },
            { stat: '< 1%', label: 'CPU overhead during idle watch' },
            { stat: '0 bytes', label: 'Source code sent over the network' },
          ].map(({ stat, label }) => (
            <div key={stat} className="rounded-lg border border-border bg-panel p-4 text-center">
              <div className="text-2xl font-bold text-accent font-mono">{stat}</div>
              <div className="text-xs text-muted mt-1 leading-relaxed">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Setting up */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Starting Live Monitor</h2>

        <h3 className="text-base font-semibold text-text mb-3">Desktop app</h3>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1 mb-6">
          <li>Click <strong className="text-text">Live Monitor</strong> in the sidebar.</li>
          <li>Click <strong className="text-text">Choose Folder</strong> and select the directory to watch.</li>
          <li>Click <strong className="text-text">Start Watching</strong>. The status indicator turns green.</li>
          <li>Edit and save any file in the watched directory — new findings appear in the panel immediately.</li>
        </ol>

        <div className="rounded-lg border border-border bg-panel px-5 py-4 text-sm text-muted leading-relaxed">
          Live Monitor is a desktop app feature. The <code className="font-mono text-accent">hzsec</code> CLI does not currently expose a watch command.
        </div>
      </section>

      {/* How findings surface */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">How findings surface</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          When a new finding is detected after a file save, HZSec notifies you in
          three ways:
        </p>
        <div className="space-y-3">
          {[
            {
              channel: 'In-app panel',
              desc: 'The Live Monitor panel shows a real-time feed of new findings — severity badge, file type, and a one-line description. Click any entry to open the full detail view.',
            },
            {
              channel: 'Desktop notification',
              desc: 'A system notification appears with the severity and finding type. Clicking it brings the HZSec window to the foreground with the finding focused.',
            },
          ].map(({ channel, desc }) => (
            <div key={channel} className="rounded-lg border border-border bg-panel p-4">
              <div className="text-sm font-semibold text-text mb-1">{channel}</div>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-5 py-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Resolved findings</div>
          <p className="text-muted leading-relaxed">
            When you save a file that previously had a finding and the issue is no longer
            present, HZSec marks it as resolved automatically and updates the score in
            real time.
          </p>
        </div>
      </section>

      {/* Exclusions */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Excluding paths</h2>
        <p className="text-sm text-muted leading-relaxed">
          Live Monitor respects <code className="font-mono text-accent">.gitignore</code> by default.
          Build artifacts and <code className="font-mono text-accent">node_modules</code> are never watched.
          There is no additional exclusion configuration at this time.
        </p>
      </section>

      {/* Performance */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Performance</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          Live Monitor is designed to be always-on without noticeably affecting
          editor or build performance.
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-bg px-4 py-3">
            <span className="text-accent mt-0.5 shrink-0">·</span>
            <p className="text-muted leading-relaxed"><strong className="text-text">Event-driven:</strong> HZSec reacts to OS file events rather than polling. No timer ticks, no continuous disk reads.</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-bg px-4 py-3">
            <span className="text-accent mt-0.5 shrink-0">·</span>
            <p className="text-muted leading-relaxed"><strong className="text-text">Debounced:</strong> Rapid successive saves (e.g., auto-save every keystroke) are coalesced — HZSec waits 300ms after the last write before scanning.</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-bg px-4 py-3">
            <span className="text-accent mt-0.5 shrink-0">·</span>
            <p className="text-muted leading-relaxed"><strong className="text-text">Scoped:</strong> Only the changed file and its direct import chain are re-evaluated. The full project result set is updated incrementally.</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-bg px-4 py-3">
            <span className="text-accent mt-0.5 shrink-0">·</span>
            <p className="text-muted leading-relaxed"><strong className="text-text">CPU budget:</strong> The scan worker is set to a background QoS class on macOS — the OS deprioritizes it under load so your editor stays fast.</p>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/ai-assistant" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← AI Assistant
        </Link>
        <Link href="/docs/compliance" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          Compliance →
        </Link>
      </div>
    </article>
  );
}
