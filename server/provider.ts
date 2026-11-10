import type { Substance, Suggestion } from "../shared/types.ts";

/**
 * The seam between the API and wherever substance data comes from.
 *
 * Today that's a hand-written dataset (`static-provider.ts`). Later it could be a
 * database, a toxicology API, or an LLM that writes up arbitrary things people search
 * for. The HTTP layer (`app.ts`) only ever talks to this interface.
 */
export interface SubstanceProvider {
  /** Autocomplete entries for a partial query. */
  suggest(query: string, limit?: number): Promise<Suggestion[]>;
  /** Best match for a query, or null if there's nothing remotely close. */
  lookup(query: string): Promise<{ substance: Substance; exact: boolean } | null>;
  getBySlug(slug: string): Promise<Substance | null>;
  /** Any substance, for the "Surprise me" button. */
  random(): Promise<Suggestion>;
  /** A few well-known entries, offered when a search finds nothing. */
  popular(limit?: number): Promise<Suggestion[]>;
}
