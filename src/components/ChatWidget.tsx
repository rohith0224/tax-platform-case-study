'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { ROLE_LABELS, type DemoUser, type UserRole } from '@/types';
import { describeContext } from '@/lib/assistantContext';
import { SourceChips, type SourceRef } from '@/components/SourceChips';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceRef[];
}

const SUGGESTIONS = ["What's happening on this page?", 'What should I do next?', 'Explain this in plain English'];

export function ChatWidget() {
  const { currentUser, activeRole } = useRole();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Keying by persona remounts the panel (and resets its conversation)
          when the demo user switches, instead of syncing it via an effect. */}
      {open && <ChatPanel key={currentUser.id} currentUser={currentUser} activeRole={activeRole} onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg hover:bg-teal-800"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}

function ChatPanel({ currentUser, activeRole, onClose }: { currentUser: DemoUser; activeRole: UserRole; onClose: () => void }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setDraft('');
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: describeContext(pathname),
          roleLabel: ROLE_LABELS[activeRole],
          userName: currentUser.name,
        }),
      });

      const sourcesHeader = res.headers.get('X-Retrieved-Sources');
      const sources: SourceRef[] = sourcesHeader ? JSON.parse(decodeURIComponent(sourcesHeader)) : [];

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream');

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          const chunkText = decoder.decode(result.value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { role: 'assistant', content: last.content + chunkText, sources };
            return copy;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong reaching the assistant.' };
        return copy;
      });
    }
    setStreaming(false);
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 flex h-[520px] w-96 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-teal-700 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <p className="text-sm font-semibold leading-tight">Clearline Assistant</p>
            <p className="text-[11px] text-teal-100">Ask about this page or your return</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-teal-800" aria-label="Close chat">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-slate-500">
              Hi {currentUser.name.split(' ')[0]} — ask me anything about what you&apos;re looking at, or how Clearline works.
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-left text-xs text-slate-600 hover:border-teal-300 hover:text-teal-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '')}
              {m.role === 'assistant' && <SourceChips sources={m.sources ?? []} />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            placeholder="Ask a question..."
            disabled={streaming}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400 disabled:opacity-60"
          />
          <button
            onClick={() => send(draft)}
            disabled={streaming || !draft.trim()}
            className="flex items-center justify-center rounded-lg bg-teal-700 px-3 py-2 text-white hover:bg-teal-800 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
