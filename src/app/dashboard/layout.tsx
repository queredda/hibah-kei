import type React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { Sidebar, MobileSidebar } from '@/components/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr] md:gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="fixed top-0 z-30 -ml-2 hidden h-full w-full shrink-0 md:sticky md:block">
          <Sidebar className="h-full border-r" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <div className="md:hidden">
              <MobileSidebar />
            </div>
            <div className="flex-1">{/* Header content here */}</div>
          </div>
          <div className="flex-1 p-4 pt-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
