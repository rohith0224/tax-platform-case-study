import { NextRequest, NextResponse } from 'next/server';
import { explainRequest } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/promptSafety';

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const title = sanitizeText(body.title, 200);
  const context = sanitizeText(body.context, 300);

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  try {
    const { explanation, sources } = await explainRequest(title, context);
    return NextResponse.json({ explanation, sources, source: 'groq' });
  } catch (err) {
    return NextResponse.json(
      {
        explanation: `We need this to complete your return accurately. (Live AI explanation unavailable right now — ${
          err instanceof Error ? err.message : 'unknown error'
        }.)`,
        sources: [],
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
