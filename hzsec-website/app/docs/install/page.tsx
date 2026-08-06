import Link from 'next/link';

export const metadata = {
  title: 'Installation — HZSec Docs',
  description: 'Install HZSec via npm (recommended) or download the desktop app for macOS and Windows.',
};

export default function InstallPage() {
  return (
    <article>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-[11px] uppercase tracking-widest text-accent mb-6">
        Getting Started
      </div>

      <h1 className="text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight text-text leading-[1.1] mb-4">
        Installation
      </h1>
      <p className="text-base text-muted leading-relaxed max-w-[560px] mb-10">
        The fastest way to get started is the CLI — one command, works on every platform.
        The desktop app is available as a beta if you prefer a GUI.
      </p>

      {/* CLI — primary */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-text">CLI via npm</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>
        <p className="text-sm text-muted mb-4">
          Node 18 or later required. Works on macOS, Linux, and Windows.
        </p>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Install</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`npm install -g hzsec-cli`}</code>
        </pre>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Run your first scan</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`hzsec scan .`}</code>
        </pre>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Check your version</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`hzsec --version
# 1.1.0`}</code>
        </pre>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Update</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`npm install -g hzsec-cli@latest`}</code>
        </pre>
      </section>

      {/* Desktop app — beta */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-text">Desktop app</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-warn bg-warn/10 border border-warn/20 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <p className="text-sm text-muted mb-4">
          Full GUI with AI assistant, live monitor, compliance mapping, and scan history.
          Available for macOS and Windows.
        </p>

        <div className="rounded-lg border border-warn/20 bg-warn/5 px-5 py-4 text-sm text-muted mb-6">
          <strong className="text-text">Unsigned build —</strong> the desktop app is not yet
          code-signed or notarized. macOS will show a Gatekeeper security warning on first
          launch. To open it: right-click <strong className="text-text">HZSec.app</strong> in
          your Applications folder and choose <strong className="text-text">Open</strong>.
          Windows may show a SmartScreen prompt — click <strong className="text-text">More info → Run anyway</strong>.
        </div>

        <h3 className="text-base font-semibold text-text mb-3">macOS</h3>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1 mb-6">
          <li>Download <code className="font-mono text-accent">HZSec-arm64.dmg</code> from <Link href="/pricing#download" className="text-accent hover:underline">hzsec.io/pricing</Link>.</li>
          <li>Open the <code className="font-mono text-accent">.dmg</code> and drag <strong className="text-text">HZSec.app</strong> to <code className="font-mono text-accent">/Applications</code>.</li>
          <li>Right-click <strong className="text-text">HZSec</strong> in Applications and choose <strong className="text-text">Open</strong> to bypass Gatekeeper.</li>
        </ol>

        <h3 className="text-base font-semibold text-text mb-3">Windows</h3>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1">
          <li>Download <code className="font-mono text-accent">HZSec-Setup.exe</code> from <Link href="/pricing#download" className="text-accent hover:underline">hzsec.io/pricing</Link>.</li>
          <li>Run the installer. If SmartScreen appears, click <strong className="text-text">More info → Run anyway</strong>.</li>
          <li>Launch HZSec from the Start menu.</li>
        </ol>
      </section>

      {/* Linux */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-3">Linux</h2>
        <p className="text-sm text-muted mb-4">No desktop build yet — use the CLI.</p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`npm install -g hzsec-cli
hzsec scan .`}</code>
        </pre>
      </section>

      {/* Bottom nav */}
      <div className="mt-14 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/docs/quickstart" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          ← Quickstart
        </Link>
        <Link href="/docs/first-scan" className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
          First Scan →
        </Link>
      </div>
    </article>
  );
}
