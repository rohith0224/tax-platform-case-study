'use client';

import { useParams } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { getReturnById, getThreadsByReturn } from '@/mocks/data';
import { ThreadView } from '@/components/messaging/ThreadView';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { CLIENT_ROLES } from '@/types';

export default function ReturnMessagesPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, activeRole } = useRole();
  const taxReturn = getReturnById(id);
  const threads = getThreadsByReturn(id);
  const isClientAudience = CLIENT_ROLES.includes(activeRole);

  if (!taxReturn) return <p className="text-slate-500">Return not found.</p>;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          ...(isClientAudience ? [] : [{ label: 'Returns', href: '/returns' }]),
          { label: taxReturn.clientName, href: `/returns/${taxReturn.id}` },
          { label: 'Messages' },
        ]}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Messages — {taxReturn.clientName}</h1>

      {threads.length === 0 ? (
        <p className="text-slate-500">No message threads on this return yet.</p>
      ) : (
        <ThreadView threads={threads} viewerRole={activeRole} viewerId={currentUser.id} viewerName={currentUser.name} />
      )}
    </div>
  );
}
