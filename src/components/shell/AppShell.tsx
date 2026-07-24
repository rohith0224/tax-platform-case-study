'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useRole } from '@/context/RoleContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { needsOnboarding } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (needsOnboarding && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [needsOnboarding, pathname, router]);

  if (needsOnboarding) return null;

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
