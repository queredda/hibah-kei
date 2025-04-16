import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

import { authOptions } from '@/lib/auth';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm space-y-6 sm:max-w-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email dan password Anda untuk login
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          Belum punya akun?{' '}
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
