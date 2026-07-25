'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { SourceChips, type SourceRef } from '@/components/SourceChips';

interface State {
  loading: boolean;
  text?: string;
  sources?: SourceRef[];
}

/** "Why do we need this?" — lets a client get an AI explanation for any document/info request instead of just trusting the instruction. */
export function ExplainRequestButton({ title, context, className = '' }: { title: string; context?: string; className?: string }) {
  const [state, setState] = useState<State>({ loading: false });

  const explain = async () => {
    setState({ loading: true });
    try {
      const res = await fetch('/api/ai/explain-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, context }),
      });
      const data = await res.json();
      setState({ loading: false, text: data.explanation, sources: data.sources });
    } catch {
      setState({ loading: false, text: 'Could not reach the AI explanation service.' });
    }
  };

  if (state.text) {
    return (
      <div className={`mt-1.5 rounded-md bg-violet-50 px-2 py-1.5 ${className}`}>
        <p className="flex items-start gap-1.5 text-xs text-violet-800">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> {state.text}
        </p>
        <SourceChips sources={state.sources ?? []} />
      </div>
    );
  }

  return (
    <button
      onClick={explain}
      disabled={state.loading}
      className={`mt-1 flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900 disabled:opacity-50 ${className}`}
    >
      {state.loading ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Sparkles className="h-3 w-3" aria-hidden />}
      Why do we need this?
    </button>
  );
}
