'use client';

import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useAssignments } from '@/context/AssignmentContext';
import { getReturnsForRole } from '@/mocks/data';
import { prioritizeReturns } from '@/lib/priority';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { ROLE_LABELS, CLIENT_ROLES, type ActionOwner } from '@/types';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const OWNER_BY_ROLE: Record<string, ActionOwner | null> = {
  employee: 'preparer',
  reviewer: 'reviewer',
  admin: null,
  client: 'client',
  business_owner: 'client',
};

const BUCKET_ORDER = ['Overdue', 'Needs your action', 'Due this week', 'On track'] as const;
const BUCKET_STYLE: Record<string, string> = {
  Overdue: 'text-red-700',
  'Needs your action': 'text-amber-700',
  'Due this week': 'text-blue-700',
  'On track': 'text-slate-500',
};

export default function DashboardPage() {
  const { currentUser, activeRole } = useRole();
  const { overrides } = useAssignments();
  const isClient = CLIENT_ROLES.includes(activeRole);
  const returns = getReturnsForRole(currentUser, activeRole, overrides);

  if (isClient) {
    const myReturn = returns[0];
    if (!myReturn) return <p className="text-slate-500">No return on file yet.</p>;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Here&apos;s where your {myReturn.taxYear} return stands.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <StatusTimeline status={myReturn.status} />
        </div>

        {myReturn.blockingIssue && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" aria-hidden />
            <div>
              <p className="font-medium text-amber-900">Action needed: {myReturn.blockingIssue}</p>
              <p className="text-sm text-amber-800 mt-0.5">{myReturn.nextAction.label}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Link href={`/returns/${myReturn.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300">
            <p className="font-medium text-slate-900">View return details</p>
            <p className="text-sm text-slate-500 mt-0.5">Status, documents, and next steps</p>
          </Link>
          <Link href="/messages" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300">
            <p className="font-medium text-slate-900">Messages</p>
            <p className="text-sm text-slate-500 mt-0.5">Talk with your preparer</p>
          </Link>
        </div>
      </div>
    );
  }

  const ownerFilter = OWNER_BY_ROLE[activeRole] ?? null;
  const prioritized = prioritizeReturns(returns, ownerFilter);
  const grouped = BUCKET_ORDER.map((bucket) => ({
    bucket,
    items: prioritized.filter((p) => p.bucket === bucket),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {activeRole === 'admin' ? 'Firm Overview' : `Welcome back, ${currentUser.name.split(' ')[0]}`}
        </h1>
        <p className="text-slate-500">
          {prioritized.length} active return{prioritized.length === 1 ? '' : 's'} across your queue, ranked by what needs attention first.
        </p>
      </div>

      {grouped.map(({ bucket, items }) => (
        <div key={bucket}>
          <h2 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${BUCKET_STYLE[bucket]}`}>
            {bucket} · {items.length}
          </h2>
          <div className="space-y-2">
            {items.map(({ taxReturn, reason }) => (
              <Link
                key={taxReturn.id}
                href={`/returns/${taxReturn.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{taxReturn.clientName}</p>
                    <StatusBadge status={taxReturn.status} />
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block w-28">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-teal-600" style={{ width: `${taxReturn.progress}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{taxReturn.progress}% complete</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {prioritized.length === 0 && (
        <p className="text-slate-500">Nothing needs attention right now — every return you own is on track.</p>
      )}

      {activeRole !== 'admin' && (
        <p className="text-xs text-slate-400">Showing returns owned or reviewed by {ROLE_LABELS[activeRole]} {currentUser.name}.</p>
      )}
    </div>
  );
}
