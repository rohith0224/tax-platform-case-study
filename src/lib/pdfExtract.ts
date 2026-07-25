import { extractText, getDocumentProxy } from 'unpdf';

const MAX_CHARS_TO_MODEL = 8000;

export interface PdfExtractResult {
  text: string;
  truncated: boolean;
  totalPages: number;
}

/** Real text extraction (unpdf's serverless PDF.js build — no native binaries, safe in a Vercel function). */
export async function extractPdfText(bytes: Uint8Array): Promise<PdfExtractResult> {
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const trimmed = text.trim();
  return {
    text: trimmed.slice(0, MAX_CHARS_TO_MODEL),
    truncated: trimmed.length > MAX_CHARS_TO_MODEL,
    totalPages,
  };
}
