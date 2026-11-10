import type { Substance } from "../shared/types.ts";

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Classic two-row Levenshtein distance. Inputs are short, so this is plenty fast. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = row;
  }
  return prev[b.length]!;
}

export const SCORE = {
  exact: 100,
  prefix: 80,
  wordPrefix: 60,
  includes: 40,
  fuzzy: 20,
} as const;

/** How well a normalized query matches one normalized candidate string. 0 = no match. */
function scoreCandidate(query: string, candidate: string): number {
  if (candidate === query) return SCORE.exact;
  if (candidate.startsWith(query)) return SCORE.prefix;
  if (candidate.split(" ").some((word) => word.startsWith(query))) return SCORE.wordPrefix;
  if (query.length >= 3 && candidate.includes(query)) return SCORE.includes;

  // Typos: one edit for words up to 7 letters, two for longer ones. (Two edits on a 6-letter word matched things like
  // "olives" -> "cloves", which is nonsense once there are a hundred items with aliases.) Closer matches rank higher.
  if (query.length >= 4) {
    const allowed = query.length <= 9 ? 1 : 2;
    let best = Infinity; // lower is closer
    // Matching the whole name beats matching one word of it ("strawbery" should find Strawberry, not "strawberry jam").
    const options: Array<{ word: string; penalty: number }> = [
      { word: candidate, penalty: 0 },
      ...candidate.split(" ").map((word) => ({ word, penalty: 0.5 })),
    ];
    for (const { word, penalty } of options) {
      if (Math.abs(word.length - query.length) > allowed) continue;
      const d = editDistance(query, word);
      if (d <= allowed) best = Math.min(best, d + penalty);
    }
    if (best < Infinity) return SCORE.fuzzy - best;
  }
  return 0;
}

export function scoreSubstance(rawQuery: string, substance: Substance): number {
  const query = normalize(rawQuery);
  if (!query) return 0;
  // "Sweet potato (kumara)" should also answer to plain "sweet potato".
  const withoutQualifier = substance.name.replace(/\([^)]*\)/g, "");
  const candidates = [substance.name, withoutQualifier, ...substance.aliases].map(normalize);
  return Math.max(...candidates.map((c) => scoreCandidate(query, c)));
}

export interface Ranked {
  substance: Substance;
  score: number;
}

/** All substances that match, best first. */
export function rank(rawQuery: string, substances: Substance[]): Ranked[] {
  return substances
    .map((substance) => ({ substance, score: scoreSubstance(rawQuery, substance) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.substance.name.localeCompare(b.substance.name));
}
