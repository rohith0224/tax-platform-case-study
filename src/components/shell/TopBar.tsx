'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Waypoints } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { ROLE_LABELS } from '@/types';
import { allThreads } from '@/mocks/data';

export function TopBar() {
  const { currentUser, activeRole, allUsers, switchUser, switchRole } = useRole();
  const [open, setOpen] = useState(false);

  const openThreadCount = allThreads.filter((t) => t.status === 'open').length;

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-4 gap-4 relative z-20">
      <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
        <Waypoints className="h-5 w-5 text-teal-700" aria-hidden />
        Clearline
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/messages"
          className="relative text-sm text-slate-600 hover:text-slate-900 hidden sm:inline"
        >
          {openThreadCount} open thread{openThreadCount === 1 ? '' : 's'}
        </Link>

        {currentUser.roles.length > 1 && (
          <div className="hidden sm:flex items-center rounded-full bg-slate-100 p-0.5 text-xs font-medium">
            {currentUser.roles.map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  activeRole === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r === 'client' ? 'My Personal Return' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 pl-1.5 pr-2.5 py-1 text-sm hover:bg-slate-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="font-medium text-slate-900">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500">{ROLE_LABELS[activeRole]}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Demo: view as
                </p>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 ${
                      u.id === currentUser.id ? 'bg-teal-50/60' : ''
                    }`}
                  >
                    <span className="text-left">
                      <span className="block font-medium text-slate-900">{u.name}</span>
                      <span className="block text-xs text-slate-500">
                        {u.roles.map((r) => ROLE_LABELS[r]).join(' + ')}
                        {u.team ? ` · ${u.team}` : ''}
                        {u.isFirstLogin ? ' · first login' : ''}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
