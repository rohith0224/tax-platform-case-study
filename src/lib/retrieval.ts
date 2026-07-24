import { embed, cosineSimilarity } from './hashEmbedding';
import { taxKnowledge, type KnowledgeSnippet } from '@/knowledge/taxKnowledge';

export interface RetrievedSnippet extends KnowledgeSnippet {
  score: number;
}

// Corpus embeddings are cheap to compute (no model download) and small in
// number, so they're built once per server instance and cached in memory —
// the same shape a real ChromaDB collection.add() would leave you with,
// just skipping the network hop to an external vector DB.
let corpusIndex: { snippet: KnowledgeSnippet; vector: number[] }[] | null = null;

function getIndex() {
  if (!corpusIndex) {
    corpusIndex = taxKnowledge.map((snippet) => ({
      snippet,
      vector: embed(`${snippet.title}. ${snippet.text}`),
    }));
  }
  return corpusIndex;
}

const MIN_SCORE = 0.08; // below this, the match is noise — better to admit no relevant knowledge than force one in

export function retrieve(query: string, k = 3): RetrievedSnippet[] {
  const queryVector = embed(query);
  return getIndex()
    .map(({ snippet, vector }) => ({ ...snippet, score: cosineSimilarity(queryVector, vector) }))
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
