'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useAssignments } from '@/context/AssignmentContext';
import { getReturnsForRole, effectivePreparer } from '@/mocks/data';
import { StatusBadge } from '@/components/StatusBadge';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { AssignPreparer } from '@/components/AssignPreparer';
import { daysUntil } from '@/lib/status';
import { STATUS_META } from '@/lib/status';
import type { ReturnStatus } from '@/types';
import { Search } from 'lucide-react';

export default function ReturnsPage() {
  const { currentUser, activeRole } = useRole();
  const { overrides } = useAssignments();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all');

  const returns = getReturnsForRole(currentUser, activeRole, overrides);

  const filtered = useMemo(() => {
    return returns
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => r.clientName.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));
  }, [returns, query, statusFilter]);

  const statusCounts = returns.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Returns' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Returns</h1>
      <p className="text-slate-500 mb-4">{filtered.length} of {returns.length} returns</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client name"
            className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm w-64 focus:border-teal-400 outline-none"
          />
        </div>
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All ({returns.length})
        </button>
        {(Object.keys(statusCounts) as ReturnStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {STATUS_META[s].staffLabel} ({statusCounts[s]})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Client</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Assigned preparer</th>
              <th className="px-4 py-2.5 font-medium">Due</th>
              <th className="px-4 py-2.5 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const due = daysUntil(r.dueDate);
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/returns/${r.id}`} className="font-medium text-slate-900 hover:text-teal-700">
                      {r.clientName}
                    </Link>
                    {r.blockingIssue && <p className="text-xs text-amber-700">{r.blockingIssue}</p>}
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {activeRole === 'admin' ? <AssignPreparer taxReturn={r} /> : effectivePreparer(r, overrides).name}
                  </td>
                  <td className={`px-4 py-2.5 ${due < 0 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {due < 0 ? `${Math.abs(due)}d overdue` : `${due}d`}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{r.progress}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No returns match your filters.</p>}
      </div>
    </div>
  );
}
