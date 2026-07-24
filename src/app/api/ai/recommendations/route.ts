import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations, REVIEW_LENSES } from '@/lib/groq';
import { getFieldsByReturn, getReturnById } from '@/mocks/data';
import { checkRateLimit } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/promptSafety';

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const returnId = sanitizeText(body.returnId, 50);
  const excludeLens = sanitizeText(body.excludeLens, 200);

  const taxReturn = getReturnById(returnId);
  if (!taxReturn) {
    return NextResponse.json({ error: 'Unknown return' }, { status: 404 });
  }

  const fields = getFieldsByReturn(returnId);
  const summary = [
    `Client: ${taxReturn.clientName} (${taxReturn.entityType}), tax year ${taxReturn.taxYear}.`,
    ...fields.map(
      (f) =>
        `- ${f.formField} (${f.formLine}) = ${f.value}, confidence ${(f.confidence * 100).toFixed(0)}%, status ${f.status}${
          f.calculation ? `, derived as: ${f.calculation}` : ''
        }`
    ),
  ].join('\n');

  const lensPool = REVIEW_LENSES.filter((l) => l !== excludeLens);
  const lens = lensPool[Math.floor(Math.random() * lensPool.length)] ?? REVIEW_LENSES[0];

  try {
    const { recommendations, sources } = await generateRecommendations(summary, lens);
    return NextResponse.json({ recommendations, sources, source: 'groq', lens });
  } catch (err) {
    return NextResponse.json(
      {
        recommendations: [
          {
            kind: 'warning',
            title: 'Live AI review unavailable',
            detail: `Falling back to static guidance — ${err instanceof Error ? err.message : 'unknown error'}. Re-check low-confidence fields manually.`,
            confidence: 0.5,
          },
        ],
        sources: [],
        source: 'fallback',
      },
      { status: 200 }
    );
  }
}
