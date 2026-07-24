import { BookOpen } from 'lucide-react';

export interface SourceRef {
  id: string;
  title: string;
}

/** Shows which knowledge-base snippets an AI response was grounded in — the retrieval half of RAG made visible. */
export function SourceChips({ sources }: { sources: SourceRef[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <BookOpen className="h-3 w-3 text-slate-400" aria-hidden />
      {sources.map((s) => (
        <span key={s.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {s.title}
        </span>
      ))}
    </div>
  );
}
