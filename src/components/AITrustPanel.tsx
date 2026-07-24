'use client';

import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, Loader2, RefreshCcw, Send } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { ROLE_LABELS } from '@/types';
import { describeContext } from '@/lib/assistantContext';
import { SourceChips, type SourceRef } from '@/components/SourceChips';

interface Recommendation {
  kind: 'warning' | 'suggestion' | 'confirmation';
  title: string;
  detail: string;
  confidence: number;
}

interface AskExchange {
  question: string;
  answer: string;
  sources: SourceRef[];
}

const KIND_META = {
  warning: { icon: AlertTriangle, class: 'bg-amber-50 text-amber-800 border-amber-200' },
  suggestion: { icon: Lightbulb, class: 'bg-blue-50 text-blue-800 border-blue-200' },
  confirmation: { icon: CheckCircle2, class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
} as const;

export function AITrustPanel({ returnId }: { returnId: string }) {
  const { currentUser, activeRole } = useRole();
  const [items, setItems] = useState<Recommendation[] | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'groq' | 'fallback' | null>(null);
  const [lens, setLens] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<number, 'confirmed' | 'flagged'>>({});

  const [askDraft, setAskDraft] = useState('');
  const [asking, setAsking] = useState(false);
  const [exchanges, setExchanges] = useState<AskExchange[]>([]);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId, excludeLens: lens }),
      });
      const data = await res.json();
      setItems(data.recommendations ?? []);
      setSource(data.source ?? null);
      setLens(data.lens ?? null);
      setSources(data.sources ?? []);
      setDismissed(new Set());
      setFeedback({});
    } catch {
      setError('Could not reach the AI review service.');
    }
    setLoading(false);
  };

  const askAbout = async () => {
    const question = askDraft.trim();
    if (!question || asking) return;
    setAskDraft('');
    setAsking(true);
    setExchanges((prev) => [...prev, { question, answer: '', sources: [] }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          context: describeContext(`/returns/${returnId}/review`),
          roleLabel: ROLE_LABELS[activeRole],
          userName: currentUser.name,
        }),
      });

      const sourcesHeader = res.headers.get('X-Retrieved-Sources');
      const askSources: SourceRef[] = sourcesHeader ? JSON.parse(decodeURIComponent(sourcesHeader)) : [];

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream');

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          const chunkText = decoder.decode(result.value, { stream: true });
          setExchanges((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { question: last.question, answer: last.answer + chunkText, sources: askSources };
            return copy;
          });
        }
      }
    } catch {
      setExchanges((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], answer: 'Sorry, something went wrong reaching the assistant.' };
        return copy;
      });
    }
    setAsking(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
          <h3 className="font-semibold text-slate-900">AI Review Notes</h3>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          {items ? 'Regenerate' : 'Generate review notes'}
        </button>
      </div>

      {!items && !loading && (
        <p className="mt-2 text-sm text-slate-500">
          Ask the AI to scan this return&apos;s extracted fields for anything worth a second look before it moves forward.
        </p>
      )}

      {source && (
        <>
          <p className="mt-1 text-[11px] text-slate-400">
            {source === 'groq' ? (
              <>Live model output — generated just now{lens ? <> · this pass focused on <span className="font-medium text-slate-500">{lens}</span></> : ''}.</>
            ) : (
              'Live model unreachable — showing fallback guidance.'
            )}
          </p>
          <SourceChips sources={sources} />
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 space-y-2">
        {items?.map((rec, i) => {
          if (dismissed.has(i)) return null;
          const meta = KIND_META[rec.kind] ?? KIND_META.suggestion;
          const Icon = meta.icon;
          const status = feedback[i];
          return (
            <div key={i} className={`rounded-lg border p-3 ${meta.class}`}>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <span className="shrink-0 text-[11px] font-medium opacity-70">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm opacity-90">{rec.detail}</p>

                  {status ? (
                    <p className="mt-2 text-xs font-medium opacity-80">
                      {status === 'confirmed' ? '✓ Marked as reviewed' : '⚑ Flagged for follow-up'}
                    </p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: 'confirmed' }))}
                        className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium hover:bg-white"
                      >
                        Looks right
                      </button>
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: 'flagged' }))}
                        className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium hover:bg-white"
                      >
                        Flag for follow-up
                      </button>
                      <button
                        onClick={() => setDismissed((d) => new Set(d).add(i))}
                        className="rounded-md px-2 py-1 text-xs font-medium opacity-60 hover:opacity-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Ask about this return</p>

        {exchanges.length > 0 && (
          <div className="mb-2 space-y-2">
            {exchanges.map((ex, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs font-medium text-slate-500">{ex.question}</p>
                <p className="mt-1 text-sm text-slate-800">
                  {ex.answer || (asking && i === exchanges.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '')}
                </p>
                <SourceChips sources={ex.sources} />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={askDraft}
            onChange={(e) => setAskDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAbout()}
            placeholder='e.g. "Why is the supply expense flagged?"'
            disabled={asking}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400 disabled:opacity-60"
          />
          <button
            onClick={askAbout}
            disabled={asking || !askDraft.trim()}
            className="flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
            aria-label="Ask"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
