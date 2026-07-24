import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { buildChatSystemPrompt } from '@/lib/groq';
import { retrieve } from '@/lib/retrieval';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText, wrapUserContent } from '@/lib/promptSafety';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LEN = 2000;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return new Response('Too many requests — please wait a bit before asking again.', {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSeconds), 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return new Response('Invalid request.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const messages: ChatMessage[] = body.messages
    .slice(-MAX_MESSAGES)
    .filter((m: unknown): m is ChatMessage => !!m && typeof m === 'object' && (m as ChatMessage).role !== undefined)
    .map((m: ChatMessage) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeText(m.content, MAX_MESSAGE_LEN),
    }))
    .filter((m: ChatMessage) => m.content.length > 0);

  if (messages.length === 0) {
    return new Response('No message content received.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const context = sanitizeText(body.context, 2000);
  const roleLabel = sanitizeText(body.roleLabel, 60) || 'user';
  const userName = sanitizeText(body.userName, 80) || 'there';

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const sources = retrieve(`${lastUserMessage} ${context}`, 3);

  const encoder = new TextEncoder();
  const sourcesHeader = encodeURIComponent(JSON.stringify(sources.map((s) => ({ id: s.id, title: s.title }))));

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 350,
      temperature: 0.4,
      stream: true,
      messages: [
        { role: 'system', content: buildChatSystemPrompt(context, roleLabel, userName, sources) },
        ...messages.map((m) => ({ role: m.role, content: m.role === 'user' ? wrapUserContent(m.content) : m.content })),
      ],
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch {
          controller.enqueue(encoder.encode('\n\n(The response was interrupted.)'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Retrieved-Sources': sourcesHeader },
    });
  } catch (err) {
    const message = `Sorry — the assistant is temporarily unavailable (${err instanceof Error ? err.message : 'unknown error'}).`;
    return new Response(message, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
