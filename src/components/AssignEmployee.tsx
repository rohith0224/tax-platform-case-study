'use client';

import { useAssignments } from '@/context/AssignmentContext';
import { getAssignableEmployees, effectivePreparer } from '@/mocks/data';
import type { TaxReturn } from '@/types';
import { UserCog } from 'lucide-react';

/** Admin-only control to (re)assign which employee is preparing a given return. */
export function AssignEmployee({ taxReturn }: { taxReturn: TaxReturn }) {
  const { overrides, assignReturn } = useAssignments();
  const current = effectivePreparer(taxReturn, overrides);
  const employees = getAssignableEmployees();

  return (
    <label className="flex items-center gap-1.5 text-sm">
      <UserCog className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      <select
        value={current.id}
        onChange={(e) => assignReturn(taxReturn.id, e.target.value)}
        className="rounded-md border border-slate-200 bg-white py-1 pl-1.5 pr-6 text-sm font-medium text-slate-900 outline-none focus:border-teal-400"
      >
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
            {e.team ? ` — ${e.team}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
