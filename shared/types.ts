/**
 * Types shared by the Hono API (server/) and the React client (src/).
 * Keep this file free of runtime code so both sides can import it as types only.
 */

/** A real-world thing you could consume, used to make a lethal dose relatable. */
export interface EquivalentUnit {
  /** "cup of coffee" */
  singular: string;
  /** "cups of coffee" */
  plural: string;
  /** Milligrams of the substance in ONE unit (rough is fine, this is a comedy site). */
  mgPerUnit: number;
  emoji: string;
  /** Optional one-liner shown under the number. */
  quip?: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface Ld50Record {
  /** Median lethal dose in milligrams of substance per kilogram of body weight. */
  mgPerKg: number;
  /** The animal it was measured in. We are not rats. */
  species: string;
  /** "oral", "intraperitoneal", ... */
  route: string;
  /**
   * Only for borrowed LD50s: the compound the published figure was measured for ("Potassium chloride"),
   * when `mgPerKg` has been converted to the element/ion ("potassium") that foods are measured in.
   */
  compound?: string;
  /** How the conversion was done, in one line. */
  conversion?: string;
}

/** A page we actually read the figure on. */
export interface Reference {
  name: string;
  url: string;
}

/** One thing inside a food that has a published LD50, so the food can borrow it. */
export interface Constituent {
  key: string;
  /** "Potassium" */
  label: string;
  /** Milligrams of the constituent in 100 g of the food. */
  mgPer100g: number;
  ld50: Ld50Record;
  /** Where the amount in the food and the LD50 came from. */
  references: Reference[];
  notes?: string;
}

export type Attainability = "absurd" | "large";
export type Confidence = "high" | "medium" | "low";

/** Extra data carried by foods, which have no LD50 of their own. */
export interface FoodInfo {
  category: string;
  /** "raw, peeled", "cooked", ... */
  form: string;
  /**
   * Every constituent we could source (2 to 5). The one named by `headlineKey` needs the least food to reach its
   * LD50, so it is the one the page is built around.
   */
  constituents: Constituent[];
  headlineKey: string;
  /** How big the lethal serving is: "absurd" is 5 kg or more, "large" is 2 to 5 kg. */
  attainability: Attainability;
  confidence: Confidence;
  confidenceNote: string;
  /** Where the weight of each serving came from. */
  servingReferences: Reference[];
}

export interface Substance {
  slug: string;
  name: string;
  emoji: string;
  /** Extra search terms: "bicarb", "nacl", "h2o"... */
  aliases: string[];
  /** One cheeky line under the name. */
  tagline: string;
  /** "The basics": a few short paragraphs. */
  overview: string[];
  facts: Fact[];
  ld50: Ld50Record;
  equivalents: EquivalentUnit[];
  funFact?: string;
  /** The honest "don't take this literally" note specific to this substance. */
  caveat?: string;
  sources: string[];
  /**
   * Present for foods. `ld50` is then the headline constituent's figure (per kg of the constituent) and every
   * `equivalents[].mgPerUnit` is the mass of that constituent in one serving.
   */
  food?: FoodInfo;
}

/** Lightweight entry for autocomplete. */
export interface Suggestion {
  slug: string;
  name: string;
  emoji: string;
}

/* ---------- API response shapes ---------- */

export interface SuggestResponse {
  suggestions: Suggestion[];
}

export interface LookupResponse {
  substance: Substance;
  /** false when we matched fuzzily ("cafeine" -> Caffeine). */
  exact: boolean;
}

export interface NotFoundResponse {
  error: "not_found";
  query: string;
  suggestions: Suggestion[];
}

export interface RandomResponse {
  suggestion: Suggestion;
}
