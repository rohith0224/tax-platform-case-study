'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDocumentById, getReturnById, heroExtractedFields } from '@/mocks/data';
import { Breadcrumbs } from '@/components/shell/Breadcrumbs';
import { SourceChips, type SourceRef } from '@/components/SourceChips';
import { FileText, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const doc = getDocumentById(id);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarySources, setSummarySources] = useState<SourceRef[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  if (!doc) return <p className="text-slate-500">Document not found.</p>;

  const taxReturn = getReturnById(doc.returnId);
  const linkedFields = heroExtractedFields.filter((f) => f.sourceDocumentId === doc.id);

  const summarize = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setSummarySources(data.sources ?? []);
    } catch {
      setSummary('Could not reach the AI summarization service.');
    }
    setSummarizing(false);
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Documents', href: '/documents' },
          { label: doc.name },
        ]}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-3">
            <FileText className="h-4 w-4 text-slate-400" /> {doc.name}
          </p>
          <div className="aspect-[8.5/11] w-full rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-2 rounded bg-slate-200 opacity-70" style={{ width: `${35 + ((i * 11) % 55)}%` }} />
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-slate-400">Type</dt><dd className="font-medium text-slate-900">{doc.type}</dd></div>
            <div><dt className="text-slate-400">Pages</dt><dd className="font-medium text-slate-900">{doc.pageCount}</dd></div>
            <div><dt className="text-slate-400">Uploaded</dt><dd className="font-medium text-slate-900">{doc.uploadedAt}</dd></div>
            <div><dt className="text-slate-400">Status</dt><dd className="font-medium text-slate-900">{doc.status.replace('_', ' ')}</dd></div>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" /> AI Summary
              </p>
              <button
                onClick={summarize}
                disabled={summarizing}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {summarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {summary ? 'Regenerate' : 'Summarize this document'}
              </button>
            </div>
            {summary ? (
              <>
                <p className="mt-2 text-sm text-slate-700">{summary}</p>
                <SourceChips sources={summarySources} />
              </>
            ) : (
              !summarizing && <p className="mt-2 text-sm text-slate-500">Ask the AI for a quick read on what this document contains.</p>
            )}
          </div>

          {taxReturn && (
            <Link href={`/returns/${taxReturn.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300">
              <div>
                <p className="text-xs text-slate-400">Part of return</p>
                <p className="font-medium text-slate-900">{taxReturn.clientName} — {taxReturn.taxYear}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </Link>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Fields sourced from this document</p>
            {linkedFields.length === 0 ? (
              <p className="text-sm text-slate-400">No traced fields recorded for this document.</p>
            ) : (
              <ul className="space-y-2">
                {linkedFields.map((f) => (
                  <li key={f.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{f.formField}</span>
                    <span className="font-medium text-slate-900">{f.value}</span>
                  </li>
                ))}
              </ul>
            )}
            {taxReturn && linkedFields.length > 0 && (
              <Link href={`/returns/${taxReturn.id}/review`} className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
                Open in traceability review →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
