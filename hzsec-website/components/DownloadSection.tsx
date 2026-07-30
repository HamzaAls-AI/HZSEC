'use client';

export function DownloadSection() {
  return (
    <div>
      <h3 className="font-medium text-text mb-1">Desktop app</h3>
      <p className="text-sm text-muted mb-5">
        Full GUI with AI assistant, live monitor, compliance mapping, and scan history.
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
