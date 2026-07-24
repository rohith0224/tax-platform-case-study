/**
 * Deterministic text embeddings via the "hashing trick" (feature hashing):
 * tokenize -> hash each unigram/bigram into a fixed-size bucket -> L2-normalize.
 * No model download, no native binary, no external API — safe to run in any
 * serverless function with zero cold-start risk. Same retrieval pipeline a
 * transformer-embedding + ChromaDB setup would use (embed -> store -> cosine
 * similarity search); only the embedding function itself is swapped for a
 * dependency-free one, since this project needs to deploy as a single
 * self-contained Vercel app.
 */

const DIM = 1024;

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Crude suffix-stripping so "wages"/"wage", "salaries"/"salary", "filing"/"filed" hash to the same bucket. */
function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 3 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);

  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`); // bigrams add a little word-order signal
  }
  return tokens;
}

export function embed(text: string): number[] {
  const vector = new Array(DIM).fill(0);
  for (const token of tokenize(text)) {
    const bucket = fnv1a(token) % DIM;
    vector[bucket] += 1;
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both vectors are already L2-normalized, so dot product == cosine similarity
}
