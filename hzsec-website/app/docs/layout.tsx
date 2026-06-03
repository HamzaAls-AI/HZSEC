import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { DocsSidebar } from '@/components/DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />

      <div className="min-h-screen pt-[108px]">
        <div className="max-w-[1180px] mx-auto px-[6%]">
          <div className="flex gap-10 min-[960px]:gap-14 items-start">

            {/* Sidebar — desktop only */}
            <aside className="hidden min-[960px]:block w-[210px] shrink-0">
              <div className="sticky top-[128px] py-10">
                <DocsSidebar />
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1 py-10 min-[960px]:py-10">
              {children}
            </main>

          </div>
        </div>
      </div>

      <MarketingFooter />
    </>
  );
}
