import { backend } from '@/lib/backend';

export const metadata = { title: 'Usage — HZSec' };
export const dynamic = 'force-dynamic';

export default async function UsagePage() {
  let me = null;
  try { me = await backend.me(); } catch {}

  const used = me?.usage.used  ?? 0;
  const cap  = me?.usage.cap   ?? 0;
  const month = me?.usage.month ?? '';

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Usage &amp; limits</h1>
      <p className="mt-2 text-muted">
        Assistant messages routed through HZSec&apos;s managed proxy. Usage
        resets on the 1st of each month (UTC).
      </p>

      <div className="mt-8 rounded-xl border border-border bg-panel p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">
              {month ? formatMonth(month) : 'This month'}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{used.toLocaleString()}</span>
              <span className="text-muted">
                / {cap === 0 ? <span title="Free tier — no managed proxy">∞</span> : cap.toLocaleString()} messages
              </span>
            </div>
          </div>
          <div className="text-xs text-muted">
            {cap > 0 && `${Math.max(0, cap - used).toLocaleString()} remaining`}
          </div>
        </div>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-panel2">
          <div
            className="h-full bg-accent transition-[width]"
            style={{ width: cap === 0 ? '0%' : `${Math.min(100, (used / cap) * 100)}%` }}
          />
        </div>
      </div>

      <h2 className="mt-12 text-sm font-medium uppercase tracking-wider text-muted">History</h2>
      <p className="mt-2 text-sm text-muted">
        Multi-month history will appear here once the backend has a few months
        of data. Roll-ups are stored monthly in the
        <code className="mx-1 rounded bg-panel px-1 py-0.5 text-xs">usage</code>
        table.
      </p>
    </>
  );
}

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split('-').map(Number);
  if (!y || !m) return yyyymm;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, {
    month: 'long', year: 'numeric'
  });
}
