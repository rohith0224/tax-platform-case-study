import { NextRequest, NextResponse } from 'next/server';
import { summarizeDocument } from '@/lib/groq';
import { getDocumentById } from '@/mocks/data';
import { getDocumentContent } from '@/lib/docContent';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/promptSafety';

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const documentId = sanitizeText(body.documentId, 50);
  const doc = getDocumentById(documentId);
  if (!doc) {
    return NextResponse.json({ error: 'Unknown document' }, { status: 404 });
  }

  try {
    const { summary, sources } = await summarizeDocument(doc.name, doc.type, getDocumentContent(doc));
    return NextResponse.json({ summary, sources, source: 'groq' });
  } catch (err) {
    return NextResponse.json(
      { summary: `Could not generate a live summary right now (${err instanceof Error ? err.message : 'unknown error'}).`, sources: [], source: 'fallback' },
      { status: 200 }
    );
  }
}
