import Link from 'next/link';
import { FileText, ListChecks, MessagesSquare } from 'lucide-react';
import { getDocumentsByReturn, getTasksByReturn, getThreadsByReturn } from '@/mocks/data';

interface RelatedPanelProps {
  returnId: string;
  /** id of the object currently being viewed, so the panel can highlight "you are here" */
  currentId?: string;
}

/**
 * Keeps documents, open tasks, and message threads for a return one click
 * away from wherever you are in it — the connective tissue for Challenge 04.
 */
export function RelatedPanel({ returnId, currentId }: RelatedPanelProps) {
  const documents = getDocumentsByReturn(returnId);
  const tasks = getTasksByReturn(returnId).filter((t) => t.status === 'open');
  const threads = getThreadsByReturn(returnId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-5">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <FileText className="h-3.5 w-3.5" /> Documents
        </p>
        <ul className="space-y-1">
          {documents.map((d) => (
            <li key={d.id}>
              <Link
                href={`/documents/${d.id}`}
                className={`block truncate rounded-md px-2 py-1.5 text-sm ${
                  d.id === currentId ? 'bg-teal-50 font-medium text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d.name}
              </Link>
            </li>
          ))}
          {documents.length === 0 && <li className="px-2 text-sm text-slate-400">No documents yet</li>}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <ListChecks className="h-3.5 w-3.5" /> Open tasks
        </p>
        <ul className="space-y-1">
          {tasks.map((t) => (
            <li key={t.id} className={`rounded-md px-2 py-1.5 text-sm ${t.id === currentId ? 'bg-teal-50 font-medium text-teal-800' : 'text-slate-600'}`}>
              {t.title}
              <span className="ml-1.5 text-xs text-slate-400">· {t.owner}</span>
            </li>
          ))}
          {tasks.length === 0 && <li className="px-2 text-sm text-slate-400">No open tasks</li>}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <MessagesSquare className="h-3.5 w-3.5" /> Threads
        </p>
        <ul className="space-y-1">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/returns/${returnId}/messages#${t.id}`}
                className={`block truncate rounded-md px-2 py-1.5 text-sm ${
                  t.id === currentId ? 'bg-teal-50 font-medium text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.subject}
              </Link>
            </li>
          ))}
          {threads.length === 0 && <li className="px-2 text-sm text-slate-400">No threads</li>}
        </ul>
      </div>
    </div>
  );
}
