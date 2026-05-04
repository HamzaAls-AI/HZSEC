import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Sign up — HZSec' };

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <SignUp signInUrl="/login" afterSignUpUrl="/dashboard" />
    </div>
  );
}
