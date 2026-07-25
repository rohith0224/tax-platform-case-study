import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/pdfExtract';
import { extractKeyInfoFromPdfText } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: `File is too large — max ${MAX_FILE_BYTES / (1024 * 1024)}MB.` }, { status: 400 });
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { text, truncated, totalPages } = await extractPdfText(bytes);

    if (!text) {
      return NextResponse.json({ error: 'No extractable text found in this PDF (it may be a scanned image with no text layer).' }, { status: 422 });
    }

    const result = await extractKeyInfoFromPdfText(text, file.name);
    return NextResponse.json({ ...result, totalPages, truncated, source: 'groq' });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not process this PDF — ${err instanceof Error ? err.message : 'unknown error'}.` },
      { status: 500 }
    );
  }
}
