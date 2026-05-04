import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Sign in — HZSec' };

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <SignIn signUpUrl="/signup" afterSignInUrl="/dashboard" />
    </div>
  );
}
