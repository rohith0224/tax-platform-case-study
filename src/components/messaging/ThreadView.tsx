'use client';

import { useEffect, useState } from 'react';
import type { Message, MessageThread, UserRole } from '@/types';
import { CLIENT_ROLES } from '@/types';
import { CheckCircle2, Lock, Send } from 'lucide-react';

interface ThreadViewProps {
  threads: MessageThread[];
  viewerRole: UserRole;
  viewerId: string;
  viewerName: string;
  /** shown next to each thread when browsing across multiple returns */
  clientNameFor?: (returnId: string) => string;
}

export function ThreadView({ threads, viewerRole, viewerId, viewerName, clientNameFor }: ThreadViewProps) {
  const isStaff = !CLIENT_ROLES.includes(viewerRole);
  const [selectedId, setSelectedId] = useState(threads[0]?.id);
  const [draft, setDraft] = useState('');
  const [asInternal, setAsInternal] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    // window.location isn't available during SSR, so the deep-linked thread
    // (from RelatedPanel's #threadId links) can only be read post-mount.
    const hash = window.location.hash.replace('#', '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hash && threads.some((t) => t.id === hash)) setSelectedId(hash);
  }, [threads]);

  const selected = threads.find((t) => t.id === selectedId) ?? threads[0];
  if (!selected) return <p className="text-slate-500">No message threads.</p>;

  const visibleMessages = [...selected.messages, ...(localMessages[selected.id] ?? [])].filter(
    (m) => isStaff || !m.internal
  );

  const send = () => {
    if (!draft.trim()) return;
    const message: Message = {
      id: `local-${Date.now()}`,
      threadId: selected.id,
      authorId: viewerId,
      authorName: viewerName,
      authorRole: viewerRole,
      body: draft.trim(),
      timestamp: new Date().toISOString(),
      internal: isStaff && asInternal,
    };
    setLocalMessages((prev) => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), message] }));
    setDraft('');
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-13rem)]">
      <div className="col-span-1 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`block w-full text-left px-3 py-3 ${t.id === selected.id ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 truncate">{t.subject}</p>
              {t.status === 'resolved' ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">open</span>
              )}
            </div>
            {clientNameFor && <p className="text-xs text-slate-400">{clientNameFor(t.returnId)}</p>}
            <p className="mt-0.5 text-xs text-slate-500">
              Waiting on: <span className="font-medium">{t.ownerAction}</span>
            </p>
          </button>
        ))}
      </div>

      <div className="col-span-2 flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-semibold text-slate-900">{selected.subject}</p>
          <p className="text-xs text-slate-500">
            {selected.status === 'open' ? `Outstanding · waiting on ${selected.ownerAction}` : 'Resolved'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visibleMessages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-xl px-3 py-2 ${m.internal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-100'}`}>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{m.authorName}</span>
                <span>
                  ·{' '}
                  {new Date(m.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'UTC',
                  })}
                </span>
                {m.internal && (
                  <span className="flex items-center gap-0.5 text-amber-700">
                    <Lock className="h-3 w-3" /> internal only
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-800">{m.body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-3">
          {isStaff && (
            <label className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
              <input type="checkbox" checked={asInternal} onChange={(e) => setAsInternal(e.target.checked)} />
              Internal note — not visible to client
            </label>
          )}
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={asInternal ? 'Write an internal note...' : 'Write a message...'}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
            />
            <button onClick={send} className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
