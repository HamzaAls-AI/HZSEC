import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Anything under /dashboard is auth-required. Marketing + legal pages and
// the auth pages themselves are public. /api routes inside this Next app
// (e.g. proxies to the backend) inherit the same gate via this matcher.
const isProtected = createRouteMatcher([
  '/dashboard(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next internals, static files, and the public /api routes that
    // we don't want to auth-protect. Adjust if you add public APIs.
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)'
  ]
};
