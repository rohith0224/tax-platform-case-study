import { NextRequest, NextResponse } from 'next/server';
import { explainField } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/promptSafety';

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const formField = sanitizeText(body.formField, 200);
  const formLine = sanitizeText(body.formLine, 200);
  const value = sanitizeText(body.value, 100);

  if (!formField) {
    return NextResponse.json({ error: 'formField is required' }, { status: 400 });
  }

  try {
    const { explanation, sources } = await explainField(formField, formLine, value);
    return NextResponse.json({ explanation, sources, source: 'groq' });
  } catch (err) {
    return NextResponse.json(
      {
        explanation: `"${formField}" is a standard line on your return. (Live AI explanation unavailable right now — ${
          err instanceof Error ? err.message : 'unknown error'
        }.)`,
        sources: [],
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
