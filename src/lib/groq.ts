import Groq from 'groq-sdk';
import { retrieve, type RetrievedSnippet } from './retrieval';
import { INJECTION_GUARD, wrapUserContent } from './promptSafety';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

function knowledgeBlock(snippets: RetrievedSnippet[]): string {
  if (snippets.length === 0) return '';
  return (
    '\n\nRelevant platform knowledge (use if helpful, ignore if not relevant, never contradict it):\n' +
    snippets.map((s) => `- ${s.title}: ${s.text}`).join('\n')
  );
}

export interface ExplainResult {
  explanation: string;
  sources: RetrievedSnippet[];
}

export async function explainField(formField: string, formLine: string, value: string): Promise<ExplainResult> {
  const sources = retrieve(`${formField} ${formLine}`, 2);

  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 150,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'You explain individual tax return line items to a taxpayer in plain, reassuring language. 1-2 short sentences. No jargon, no disclaimers. ' +
          INJECTION_GUARD +
          knowledgeBlock(sources),
      },
      {
        role: 'user',
        content: wrapUserContent(`Explain "${formField}" (${formLine}), currently showing ${value}, in simple terms.`),
      },
    ],
  });
  return {
    explanation: completion.choices[0]?.message?.content?.trim() ?? 'No explanation available.',
    sources,
  };
}

export interface AiRecommendation {
  kind: 'warning' | 'suggestion' | 'confirmation';
  title: string;
  detail: string;
  confidence: number;
}

export const REVIEW_LENSES = [
  'data quality and confidence risks in the extracted fields',
  'deduction and credit optimization opportunities the client might be missing',
  'completeness — anything that looks missing, inconsistent, or worth double-checking',
  'what an IRS auditor would flag first if they reviewed this return',
] as const;

/**
 * Generates plausible review recommendations for a return from its
 * (fabricated) extracted-field summary. The extraction itself is mock data —
 * this call is what's real: a live LLM reasoning over that mock data,
 * grounded in a small retrieved knowledge base, to produce the kind of
 * review commentary a CPA would want to see.
 *
 * `lens` steers which angle this pass emphasizes. Since the underlying field
 * data for a demo return never changes, always asking the same open-ended
 * question would converge on near-identical output — the lens gives a real,
 * disclosed reason for each regeneration to differ instead of just rewording.
 */
export async function generateRecommendations(
  returnSummary: string,
  lens: string
): Promise<{ recommendations: AiRecommendation[]; sources: RetrievedSnippet[] }> {
  const sources = retrieve(`${returnSummary} ${lens}`, 3);

  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    temperature: 0.6,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a review assistant for a CPA tax platform. Given a summary of extracted fields on a tax return, produce 2-4 short, specific review notes a preparer would find useful. ' +
          `For this pass, weight your attention toward: ${lens}. Still ground every note in the specific data given below — never invent figures or items that aren't there. ` +
          'Return strict JSON: {"recommendations": [{"kind": "warning" | "suggestion" | "confirmation", "title": string (<=8 words), "detail": string (1-2 sentences), "confidence": number (0-1)}]}. ' +
          'Use "warning" for low-confidence or unusual items, "confirmation" for high-confidence items that look correct, "suggestion" for optimization ideas (deductions, credits). Be specific to the data given, not generic. ' +
          INJECTION_GUARD +
          knowledgeBlock(sources),
      },
      { role: 'user', content: wrapUserContent(returnSummary) },
    ],
  });

  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    return { recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [], sources };
  } catch {
    return { recommendations: [], sources };
  }
}

export function buildChatSystemPrompt(context: string | undefined, roleLabel: string, userName: string, sources: RetrievedSnippet[]): string {
  return (
    'You are the in-app assistant for Clearline, an AI-powered tax platform. ' +
    `You are helping ${userName}, currently using the platform as a ${roleLabel}. ` +
    'Answer questions about tax terms in plain English, about what they are currently looking at, or about how to use the platform. ' +
    'Be concise — 2-4 sentences unless the user explicitly asks for more detail. No markdown headers or bullet walls for short answers. ' +
    'Never state a specific dollar figure or confidence score unless it was given to you in context below — say you do not have that figure rather than inventing one. ' +
    INJECTION_GUARD +
    (context ? `\n\nCurrent context: ${context}` : '') +
    knowledgeBlock(sources)
  );
}

export interface SummarizeResult {
  summary: string;
  sources: RetrievedSnippet[];
}

/** Summarizes a (simulated) document's content — see docContent() in mocks/data.ts for what "content" means here. */
export async function summarizeDocument(docName: string, docType: string, docContent: string): Promise<SummarizeResult> {
  const sources = retrieve(docType, 2);

  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 200,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'You summarize tax documents for a preparer who is skimming a client file. 2-3 sentences: what the document is, the key figures on it, and anything that looks like it needs attention. ' +
          INJECTION_GUARD +
          knowledgeBlock(sources),
      },
      {
        role: 'user',
        content: wrapUserContent(`Document: "${docName}" (type: ${docType}).\n\nContent:\n${docContent}`),
      },
    ],
  });

  return {
    summary: completion.choices[0]?.message?.content?.trim() ?? 'No summary available.',
    sources,
  };
}
