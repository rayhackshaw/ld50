import type { Substance, Suggestion } from "../shared/types.ts";
import { POPULAR_SLUGS, SUBSTANCES } from "./data/index.ts";
import { rank, SCORE } from "./search.ts";
import type { SubstanceProvider } from "./provider.ts";

function toSuggestion(s: Substance): Suggestion {
  return { slug: s.slug, name: s.name, emoji: s.emoji };
}

/** Serves the hand-written dataset in `data/substances.ts`. */
export function createStaticProvider(substances: Substance[] = SUBSTANCES): SubstanceProvider {
  return {
    async suggest(query, limit = 6) {
      return rank(query, substances)
        .slice(0, limit)
        .map((r) => toSuggestion(r.substance));
    },

    async lookup(query) {
      const best = rank(query, substances)[0];
      if (!best) return null;
      return { substance: best.substance, exact: best.score >= SCORE.exact };
    },

    async getBySlug(slug) {
      return substances.find((s) => s.slug === slug) ?? null;
    },

    async random() {
      const pick = substances[Math.floor(Math.random() * substances.length)]!;
      return toSuggestion(pick);
    },

    async popular(limit = 5) {
      const bySlug = new Map(substances.map((s) => [s.slug, s]));
      const picks = POPULAR_SLUGS.map((slug) => bySlug.get(slug)).filter((s): s is Substance => s !== undefined);
      // Fall back to dataset order if the curated list has gone stale.
      return (picks.length >= limit ? picks : [...picks, ...substances.filter((s) => !picks.includes(s))])
        .slice(0, limit)
        .map(toSuggestion);
    },
  };
}
