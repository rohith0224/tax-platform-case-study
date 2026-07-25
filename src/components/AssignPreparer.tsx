'use client';

import { useAssignments } from '@/context/AssignmentContext';
import { getAssignablePreparers, effectivePreparer } from '@/mocks/data';
import type { TaxReturn } from '@/types';
import { UserCog } from 'lucide-react';

/** Admin-only control to (re)assign which Preparer is preparing a given return. */
export function AssignPreparer({ taxReturn }: { taxReturn: TaxReturn }) {
  const { overrides, assignReturn } = useAssignments();
  const current = effectivePreparer(taxReturn, overrides);
  const preparers = getAssignablePreparers();

  return (
    <label className="flex items-center gap-1.5 text-sm">
      <UserCog className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      <select
        value={current.id}
        onChange={(e) => assignReturn(taxReturn.id, e.target.value)}
        className="rounded-md border border-slate-200 bg-white py-1 pl-1.5 pr-6 text-sm font-medium text-slate-900 outline-none focus:border-teal-400"
      >
        {preparers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.team ? ` — ${p.team}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
