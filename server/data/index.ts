import type { Substance } from "../../shared/types.ts";
import { normalize } from "../search.ts";
import { FOODS } from "./foods.generated.ts";
import { SUBSTANCES as INGREDIENTS } from "./substances.ts";

/**
 * Everything searchable: hand-written ingredients plus researched foods.
 *
 * Foods win clashes over names. "coffee" should find brewed coffee (which carries caffeine as its headline), not
 * the bare caffeine entry, so any ingredient alias that a food already answers to is dropped from the ingredient.
 */
function merge(ingredients: Substance[], foods: Substance[]): Substance[] {
  const taken = new Set(foods.flatMap((f) => [f.name, ...f.aliases]).map(normalize));
  const slugs = new Set(foods.map((f) => f.slug));

  const kept = ingredients
    .filter((i) => !slugs.has(i.slug))
    .map((i) => ({ ...i, aliases: i.aliases.filter((a) => !taken.has(normalize(a))) }));

  return [...kept, ...foods];
}

export const SUBSTANCES: Substance[] = merge(INGREDIENTS, FOODS);

/** Offered when a search finds nothing. Entries that don't exist are skipped. */
export const POPULAR_SLUGS = ["banana", "brewed-coffee", "cheddar-cheese", "water", "table-salt", "dark-chocolate", "potato", "cola"];
