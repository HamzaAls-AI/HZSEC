import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} HZSec. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/legal/privacy" className="hover:text-text">Privacy</Link>
          <Link href="/legal/terms"   className="hover:text-text">Terms</Link>
          <Link href="/legal/eula"    className="hover:text-text">EULA</Link>
        </div>
      </div>
    </footer>
  );
}
