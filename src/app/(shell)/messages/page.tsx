'use client';

import { useRole } from '@/context/RoleContext';
import { allThreads, getReturnsForRole, getReturnById } from '@/mocks/data';
import { ThreadView } from '@/components/messaging/ThreadView';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';

export default function GlobalMessagesPage() {
  const { currentUser, activeRole } = useRole();
  const myReturns = getReturnsForRole(currentUser, activeRole);
  const myReturnIds = new Set(myReturns.map((r) => r.id));
  const threads = allThreads.filter((t) => myReturnIds.has(t.returnId));

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Messages' }]} />
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Messages</h1>
      <p className="text-slate-500 mb-4">Every conversation tied to a document, task, or return you&apos;re involved in.</p>

      {threads.length === 0 ? (
        <p className="text-slate-500">No message threads yet.</p>
      ) : (
        <ThreadView
          threads={threads}
          viewerRole={activeRole}
          viewerId={currentUser.id}
          viewerName={currentUser.name}
          clientNameFor={(returnId) => getReturnById(returnId)?.clientName ?? ''}
        />
      )}
    </div>
  );
}
