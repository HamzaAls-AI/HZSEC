import { DashboardSidebar } from '@/components/DashboardSidebar';

// Auth gate is handled by middleware.ts (clerkMiddleware → auth.protect()).
// This layout just renders the chrome.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-4xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
