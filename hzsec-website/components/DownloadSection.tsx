'use client';

export function DownloadSection() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h3 className="font-medium text-text">Desktop app</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-warn bg-warn/10 border border-warn/20 px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>
      <p className="text-sm text-muted mb-2">
        Full GUI with AI assistant, live monitor, compliance mapping, and scan history.
      </p>
      <p className="text-xs text-muted/70 mb-5">
        Not yet code-signed. macOS will show a Gatekeeper warning on first open —
        right-click the app and choose <strong className="text-text">Open</strong> to bypass it.
      </p>

      <div className="flex flex-col gap-3 max-w-xs">
        <a
          href="/api/download/mac"
          className="rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          Download for macOS
        </a>
        <a
          href="/api/download/windows"
          className="rounded-full border border-border px-5 py-2.5 text-center text-sm font-medium text-muted hover:border-accent hover:text-accent transition-colors"
        >
          Download for Windows
        </a>
      </div>
    </div>
  );
}
