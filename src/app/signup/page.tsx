import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

import { authOptions } from '@/lib/auth';
import { SignUpForm } from '@/components/signup-form';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm space-y-6 sm:max-w-md">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Image
              src="/images/ugm.png"
              alt="Universitas Gadjah Mada"
              width={80}
              height={80}
            />
            <Image
              src="/images/maluku.png"
              alt="Maluku"
              width={80}
              height={80}
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Buat Akun
          </h1>
          <p className="text-sm text-muted-foreground">
            Daftar untuk mulai menggunakan aplikasi
          </p>
        </div>
        <SignUpForm />
        <div className="text-center text-sm">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
