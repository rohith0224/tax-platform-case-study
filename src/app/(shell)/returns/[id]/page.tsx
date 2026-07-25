'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useAssignments } from '@/context/AssignmentContext';
import { getReturnById, effectivePreparer } from '@/mocks/data';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { RelatedPanel } from '@/components/RelatedPanel';
import { AssignPreparer } from '@/components/AssignPreparer';
import { STATUS_META, daysUntil } from '@/lib/status';
import { CLIENT_ROLES } from '@/types';
import { AlertTriangle, FileSearch, MessagesSquare } from 'lucide-react';

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activeRole } = useRole();
  const { overrides } = useAssignments();
  const taxReturn = getReturnById(id);
  const isClientAudience = CLIENT_ROLES.includes(activeRole);

  if (!taxReturn) return <p className="text-slate-500">Return not found.</p>;

  const due = daysUntil(taxReturn.dueDate);
  const meta = STATUS_META[taxReturn.status];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          ...(isClientAudience ? [] : [{ label: 'Returns', href: '/returns' }]),
          { label: `${taxReturn.clientName} · ${taxReturn.taxYear}` },
        ]}
      />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{taxReturn.clientName} — {taxReturn.taxYear}</h1>
          <p className="text-slate-500 mt-0.5">{meta.clientDescription}</p>
        </div>
        <StatusBadge status={taxReturn.status} audience={isClientAudience ? 'client' : 'staff'} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <StatusTimeline status={taxReturn.status} />
          </div>

          {taxReturn.blockingIssue && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-amber-900">Blocked: {taxReturn.blockingIssue}</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Next action ({taxReturn.nextAction.owner}): {taxReturn.nextAction.label}
                </p>
              </div>
            </div>
          )}

          {!isClientAudience && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-0.5">Assigned preparer</p>
                {activeRole === 'admin' ? (
                  <AssignPreparer taxReturn={taxReturn} />
                ) : (
                  <p className="font-medium text-slate-900">{effectivePreparer(taxReturn, overrides).name}</p>
                )}
              </div>
              <div>
                <p className="text-slate-400">Reviewer</p>
                <p className="font-medium text-slate-900">{taxReturn.reviewerName ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Due</p>
                <p className={`font-medium ${due < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {due < 0 ? `${Math.abs(due)} days overdue` : `${due} days left`}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/returns/${taxReturn.id}/review`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-teal-300"
            >
              <FileSearch className="h-4 w-4 text-teal-700" /> Review source documents
            </Link>
            <Link
              href={`/returns/${taxReturn.id}/messages`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-teal-300"
            >
              <MessagesSquare className="h-4 w-4 text-teal-700" /> Messages
            </Link>
          </div>
        </div>

        <RelatedPanel returnId={taxReturn.id} />
      </div>
    </div>
  );
}
