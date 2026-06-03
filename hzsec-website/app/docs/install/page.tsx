import Link from 'next/link';

export const metadata = {
  title: 'Installation — HZSec Docs',
  description: 'Install HZSec on macOS and Windows. Verify signatures and check your installed version.',
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
        HZSec ships as a signed desktop application for macOS and Windows. The
        <code className="font-mono text-accent mx-1">hzsec</code> CLI is bundled
        with the app and added to your PATH during installation.
      </p>

      {/* macOS */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-1">macOS</h2>
        <p className="text-sm text-muted mb-4">Requires macOS 12.0 (Monterey) or later. Apple Silicon native — no Rosetta required.</p>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Install</h3>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1">
          <li>Download <code className="font-mono text-accent">HZSec.dmg</code> from <Link href="/download" className="text-accent hover:underline">hzsec.io/download</Link>.</li>
          <li>Open the <code className="font-mono text-accent">.dmg</code> and drag <strong className="text-text">HZSec.app</strong> to <code className="font-mono text-accent">/Applications</code>.</li>
          <li>Double-click <strong className="text-text">HZSec</strong> to launch. macOS Gatekeeper validates the Apple notarization automatically on first open.</li>
          <li>HZSec adds <code className="font-mono text-accent">hzsec</code> to your PATH on first launch — open a new terminal tab to use it.</li>
        </ol>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Verify the signature</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# Check notarization and Developer ID signature
spctl --assess --verbose /Applications/HZSec.app

# Expected:
# /Applications/HZSec.app: accepted
# source=Notarized Developer ID`}</code>
        </pre>
      </section>

      {/* Windows */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-1">Windows</h2>
        <p className="text-sm text-muted mb-4">Requires Windows 10 version 1903 or later, or Windows 11. Both x64 and ARM64 are supported.</p>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Install</h3>
        <ol className="space-y-2 text-sm text-muted leading-relaxed list-decimal list-inside ml-1">
          <li>Download <code className="font-mono text-accent">HZSec-Setup.exe</code> from <Link href="/download" className="text-accent hover:underline">hzsec.io/download</Link>.</li>
          <li>Right-click the installer and choose <strong className="text-text">Run as administrator</strong>, or accept the UAC prompt when it appears.</li>
          <li>Follow the setup wizard. HZSec installs to <code className="font-mono text-accent">%ProgramFiles%\HZSec</code> by default.</li>
          <li>Open a new terminal — <code className="font-mono text-accent">hzsec</code> is added to your system PATH by the installer.</li>
        </ol>

        <h3 className="text-base font-semibold text-text mt-6 mb-3">Verify the Authenticode signature</h3>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9] leading-relaxed">
          <code>{`# In PowerShell
Get-AuthenticodeSignature .\\HZSec-Setup.exe | Select-Object Status, SignerCertificate

# Expected:
# Status : Valid
# SignerCertificate : [HZSec, Inc.]`}</code>
        </pre>
      </section>

      {/* Linux */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-1">Linux</h2>
        <div className="rounded-lg border border-border bg-panel p-5 text-sm text-muted leading-relaxed">
          <p>
            A Linux build is in development. To be notified when it ships, email{' '}
            <a href="mailto:hello@hzsec.io" className="text-accent hover:underline">hello@hzsec.io</a>{' '}
            with <strong className="text-text">Linux build</strong> in the subject line.
          </p>
        </div>
      </section>

      {/* Check version */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Check your version</h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-4 font-mono text-sm text-[#c9d1d9]">
          <code>{`hzsec --version
# HZSec v1.1.0 (darwin/arm64)`}</code>
        </pre>
      </section>

      {/* Updating */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Updating HZSec</h2>
        <p className="text-sm text-muted leading-relaxed">
          HZSec checks for updates on launch and shows a banner when one is available.
          To update, download the latest installer from{' '}
          <Link href="/download" className="text-accent hover:underline">hzsec.io/download</Link>{' '}
          and run it — the installer replaces the existing installation in place.
        </p>
        <p className="text-sm text-muted leading-relaxed mt-3">
          CVE rule data is refreshed from CISA KEV and NVD in the background and does not
          require a full app update.
        </p>
      </section>

      {/* Uninstalling */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">Uninstalling</h2>
        <div className="space-y-4 text-sm text-muted leading-relaxed">
          <div>
            <strong className="text-text">macOS:</strong> Drag HZSec.app to the Trash. HZSec stores all local data (scan history, settings, encrypted API key) in <code className="font-mono text-accent">~/.shieldops</code>. To remove it completely:
            <pre className="overflow-x-auto rounded-lg border border-border bg-[#0d1117] px-5 py-3 font-mono text-sm text-[#c9d1d9] mt-2">
              <code>{`rm -rf ~/.shieldops`}</code>
            </pre>
          </div>
          <div>
            <strong className="text-text">Windows:</strong> Go to <strong className="text-text">Settings → Apps → HZSec → Uninstall</strong>. Local data is stored in <code className="font-mono text-accent">%USERPROFILE%\.shieldops</code> and is not removed automatically — delete that folder if you want a clean removal.
          </div>
        </div>
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
