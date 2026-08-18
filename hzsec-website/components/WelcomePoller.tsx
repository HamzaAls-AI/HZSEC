'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-fetches server component data every 3 s until the parent stops rendering us.
// Used on /welcome when the Stripe webhook hasn't written the license yet.
export function WelcomePoller() {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 3000);
    const stop     = setTimeout(() => clearInterval(interval), 30_000);
    return () => { clearInterval(interval); clearTimeout(stop); };
  }, [router]);
  return null;
}
