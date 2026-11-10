/**
 * Deterministic LD50 maths. Shared by client and server so a future data
 * provider (static file, database, LLM...) only ever supplies *facts*, and the
 * numbers shown to users are always computed the same way.
 */

import type { Constituent, EquivalentUnit, Ld50Record, Substance } from "./types.ts";

export const DEFAULT_WEIGHT_KG = 75;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 200;

/** Total dose (mg) that would be the LD50 for a body of this weight. */
export function lethalDoseMg(ld50: Ld50Record, weightKg: number): number {
  return ld50.mgPerKg * weightKg;
}

/** How many of `unit` make up `doseMg`. */
export function unitsInDose(doseMg: number, unit: EquivalentUnit): number {
  return doseMg / unit.mgPerUnit;
}

/** The constituent a food's page is built around, or undefined for plain ingredients. */
export function headlineConstituent(s: Substance): Constituent | undefined {
  return s.food?.constituents.find((c) => c.key === s.food?.headlineKey);
}

/**
 * A constituent's label without its trailing qualifier, for use in sentences:
 * "Potassium (as KCl)" -> "Potassium", "Sugars (total, glucose LD50 as stand-in)" -> "Sugars".
 * The full label stays in the table, where the qualifier is useful.
 */
export function plainLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/** Grams of food that contain `doseMg` of this constituent. */
export function foodGramsForDose(doseMg: number, c: Constituent): number {
  return (doseMg / c.mgPer100g) * 100;
}

/** Grams of food needed to hit each constituent's LD50 for this body weight, smallest (the headline) first. */
export function constituentRanking(s: Substance, weightKg: number): Array<{ constituent: Constituent; grams: number }> {
  return (s.food?.constituents ?? [])
    .map((constituent) => ({
      constituent,
      grams: foodGramsForDose(lethalDoseMg(constituent.ld50, weightKg), constituent),
    }))
    .sort((a, b) => a.grams - b.grams);
}

/** An LD50 in mg/kg to three significant figures: 1363.4 -> "1,360", 192 -> "192", 29_700 -> "29,700". */
export function formatLd50(mgPerKg: number): string {
  return sig3.format(mgPerKg);
}

/** 420 -> "420 g", 26_600 -> "26.6 kg", 3_400_000 -> "3.4 tonnes". */
export function formatFoodMass(grams: number): string {
  if (grams < 1_000) return `${sig3.format(grams)} g`;
  if (grams < 1_000_000) return `${sig3.format(grams / 1_000)} kg`;
  return `${sig3.format(grams / 1_000_000)} tonnes`;
}

/** The LD50 as a percentage of body weight (90,000 mg/kg -> 9%). */
export function bodyWeightPercent(ld50: Ld50Record): number {
  return ld50.mgPerKg / 10_000;
}

const sig3 = new Intl.NumberFormat("en", { maximumSignificantDigits: 3 });
const sig2 = new Intl.NumberFormat("en", { maximumSignificantDigits: 2 });

/** 420 -> "420 mg", 13_440 -> "13.4 g", 6_300_000 -> "6.3 kg". */
export function formatMass(mg: number): string {
  if (mg < 1_000) return `${sig3.format(mg)} mg`;
  if (mg < 1_000_000) return `${sig3.format(mg / 1_000)} g`;
  return `${sig3.format(mg / 1_000_000)} kg`;
}

/** 0.21 -> "0.21", 141.1 -> "141", 11_900 -> "11,900", 2_400_000 -> "2.4 million". */
export function formatCount(n: number): string {
  if (n < 1) return sig2.format(n);
  if (n >= 1_000_000) return `${sig2.format(n / 1_000_000)} million`;
  return sig3.format(n);
}

/** 0.0192 -> "0.019", 9 -> "9". Input is already a percentage. */
export function formatPercent(percent: number): string {
  return sig2.format(percent);
}

/** "1.5 cups" / "1 cup" / "141 cups". */
export function unitLabel(count: number, unit: EquivalentUnit): string {
  return Math.abs(count - 1) < 0.05 ? unit.singular : unit.plural;
}

/* ---------- Toxicity scale (Hodge & Sterner, oral rat LD50) ---------- */

export interface ToxicityTier {
  /** 1 (worst) to 6 (mildest). */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  blurb: string;
}

const TIERS: Array<ToxicityTier & { maxMgPerKg: number }> = [
  { level: 1, maxMgPerKg: 1, label: "Extremely toxic", blurb: "Please step away from the item." },
  { level: 2, maxMgPerKg: 50, label: "Highly toxic", blurb: "Admire from a safe distance." },
  { level: 3, maxMgPerKg: 500, label: "Moderately toxic", blurb: "Not a snack. Not even a little." },
  { level: 4, maxMgPerKg: 5_000, label: "Slightly toxic", blurb: "Fine in normal amounts. Concerning in heroic ones." },
  { level: 5, maxMgPerKg: 15_000, label: "Practically non-toxic", blurb: "Technically poison. Technically." },
  { level: 6, maxMgPerKg: Infinity, label: "Relatively harmless", blurb: "Your stomach will tap out first." },
];

export const TIER_COUNT = TIERS.length;

export function toxicityTier(ld50: Ld50Record): ToxicityTier {
  const tier = TIERS.find((t) => ld50.mgPerKg <= t.maxMgPerKg) ?? TIERS[TIERS.length - 1]!;
  return { level: tier.level, label: tier.label, blurb: tier.blurb };
}
