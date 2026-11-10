/**
 * Turns the research agents' output (research/foods-*.json) into the app's dataset.
 *
 *   node scripts/build-foods.ts
 *
 * It does NOT trust the agents' arithmetic. For every food it recomputes, from the sourced inputs:
 *   mgPerKgConstituent      = mgPerKgCompound * constituentFraction
 *   lethalFoodGramsAt70kg   = mgPerKgConstituent * 70 / mgPer100g * 100
 *   headline constituent    = the one needing the least food
 *   attainability           = absurd (>= 5 kg) | large (>= 2 kg) | otherwise the food is dropped
 * and reports every disagreement, plus any LD50 that is quoted differently in different files.
 *
 * Writes server/data/foods.generated.ts (the dataset) and research/QA.md (the report).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatCount, formatFoodMass, formatLd50, lethalDoseMg, plainLabel, unitsInDose } from "../shared/ld50.ts";
import type { Constituent, EquivalentUnit, Reference, Substance } from "../shared/types.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESEARCH = path.join(ROOT, "research");
const OUT_DATA = path.join(ROOT, "server", "data", "foods.generated.ts");
const OUT_QA = path.join(RESEARCH, "QA.md");

const WEIGHT_KG = 70;
const ABSURD_G = 5_000;
const LARGE_G = 2_000;

/* ---------- Raw shape (see research/SPEC.md) ---------- */

interface RawSource {
  name?: string;
  url?: string;
  id?: string;
}
interface RawLd50 {
  compound?: string;
  mgPerKgCompound?: number;
  species?: string;
  route?: string;
  constituentFraction?: number;
  mgPerKgConstituent?: number;
  conversionNote?: string;
  otherValuesSeen?: Array<{ mgPerKg?: number; species?: string; route?: string; note?: string; url?: string }>;
  sources?: RawSource[];
}
interface RawConstituent {
  key?: string;
  label?: string;
  mgPer100g?: number;
  compositionSource?: RawSource;
  ld50?: RawLd50;
  lethalFoodGramsAt70kg?: number;
  notes?: string;
}
interface RawServing {
  singular?: string;
  plural?: string;
  gramsPerUnit?: number;
  emoji?: string;
  source?: RawSource;
  quip?: string;
}
interface RawFood {
  slug?: string;
  name?: string;
  emoji?: string;
  aliases?: string[];
  category?: string;
  form?: string;
  tagline?: string;
  overview?: string[];
  facts?: Array<{ label?: string; value?: string }>;
  funFact?: string;
  constituents?: RawConstituent[];
  headlineConstituentKey?: string;
  servingUnits?: RawServing[];
  attainability?: string;
  confidence?: string;
  confidenceNote?: string;
  realWorldCaveat?: string;
}
interface RawFile {
  meta?: { category?: string };
  foods?: RawFood[];
  flagged?: Array<{ name?: string; reason?: string; details?: string }>;
  problems?: string[];
}

/* ---------- Report plumbing ---------- */

const errors: string[] = [];
const warnings: string[] = [];
const notes: string[] = [];

const err = (food: string, msg: string) => errors.push(`${food}: ${msg}`);
const warn = (food: string, msg: string) => warnings.push(`${food}: ${msg}`);

const isHttps = (u: unknown): u is string => {
  if (typeof u !== "string") return false;
  try {
    return new URL(u).protocol === "https:";
  } catch {
    return false;
  }
};
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Some agents read composition data from a bulk download (a 100 MB zip, a spreadsheet) because the API was
 * rate-limited. Linking a reader to a download is a poor experience, so point at the matching human page instead:
 * the FoodData Central page for the same record id, or the NZ database's home page.
 */
function linkable(s: RawSource): string {
  const u = new URL(s.url!);
  if (!/\.(zip|xlsx?|csv)$/i.test(u.pathname)) return s.url!;
  if (u.hostname.endsWith("nal.usda.gov") && /^\d+$/.test(s.id ?? "")) {
    return `https://fdc.nal.usda.gov/food-details/${s.id}/nutrients`;
  }
  if (u.hostname.endsWith("foodcomposition.co.nz")) return "https://www.foodcomposition.co.nz/";
  return `${u.origin}/`;
}

function ref(s: RawSource | undefined): Reference | null {
  if (!s || !isStr(s.name) || !isHttps(s.url)) return null;
  return { name: s.name.trim(), url: linkable(s) };
}

const uniqueRefs = (refs: Array<Reference | null>): Reference[] => [
  ...new Map(refs.filter((r): r is Reference => r !== null).map((r) => [r.url, r])).values(),
];

const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= Math.abs(b) * tol;

/* ---------- Load ---------- */

const files = fs
  .readdirSync(RESEARCH)
  .filter((f) => /^foods-.*\.json$/.test(f))
  .sort();

if (files.length === 0) {
  console.error("No research/foods-*.json files found.");
  process.exit(1);
}

/* Human lethal-dose figures per compound, gathered from EVERY record. An agent only wrote the human figure into the
   foods it happened to be researching, but it is a fact about the compound (e.g. sodium chloride), so the safety screen
   must apply it to every food that leans on that compound, not just the ones that quoted it. */
const compoundKey = (c: string) => normalize(c.replace(/\([^)]*\)/g, ""));
const humanByCompound = new Map<string, { mgPerKg: number; url: string }>();
for (const f of files) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(RESEARCH, f), "utf8")) as RawFile;
    for (const rf of raw.foods ?? []) {
      for (const rc of rf.constituents ?? []) {
        const ld = rc.ld50;
        if (!ld || !isStr(ld.compound)) continue;
        for (const o of ld.otherValuesSeen ?? []) {
          // "Human?/unspecified" means the source did not say whose dose it was, which is not a human figure.
          if (!isNum(o.mgPerKg) || !/^\s*human/i.test(o.species ?? "") || /[?]|unspecified|not given/i.test(o.species ?? "")) continue;
          const k = compoundKey(ld.compound);
          const have = humanByCompound.get(k);
          if (!have || o.mgPerKg < have.mgPerKg) humanByCompound.set(k, { mgPerKg: o.mgPerKg, url: o.url ?? "" });
        }
      }
    }
  } catch {
    /* parse errors are reported in the main pass */
  }
}

/** Agent-written prose that frames water as the limit or the runner-up. Water is excluded from the maths on purpose. */
const WATER_WORD = /\bwater\b/i;
const LIMIT_WORD =
  /\b(limit|limiting|limited|headline|lower.bound|runner.up|second|edges|sets|problem|beat|beats|beating|ahead of|behind|gets there first|wins|either way|close to water|comfortably)\b/i;
const WATER_AS_LIMIT = {
  /** True if any one sentence mentions water together with a limit/comparison word. Sentences split on ". " so
   *  decimals ("5.3 kg") stay inside their sentence. */
  test(text: string): boolean {
    return text.split(/(?<=[.!?])\s+/).some((s) => WATER_WORD.test(s) && LIMIT_WORD.test(s));
  },
};

interface Rewrite {
  slug?: string;
  tagline?: string;
  overview?: string[];
  funFact?: string;
  realWorldCaveat?: string;
  confidenceNote?: string;
  confidence?: string;
}

/** research/rewritten-*.json: prose re-done by an agent around the headline we actually use (see REWRITE.md). */
const rewrites = new Map<string, Rewrite>();
for (const f of fs.readdirSync(RESEARCH).filter((f) => /^rewritten-.*\.json$/.test(f))) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(RESEARCH, f), "utf8")) as { rewrites?: Rewrite[] };
    for (const r of j.rewrites ?? []) if (isStr(r.slug)) rewrites.set(r.slug, r);
  } catch (e) {
    errors.push(`${f}: does not parse (${(e as Error).message})`);
  }
}

const factsDropped: string[] = [];
const foods: Substance[] = [];
const pending: Array<{ file: string; input: Record<string, unknown> }> = [];
let rewritten = 0;
const dropped: Array<{ name: string; file: string; why: string }> = [];
const flagged: Array<{ file: string; name: string; reason: string; details: string }> = [];
const agentProblems: Array<{ file: string; problem: string }> = [];
const ld50Seen = new Map<string, Set<string>>(); // compound -> "mg/kg species"
let waterSkipped = 0;
const slugs = new Set<string>();
const claimed = new Map<string, string>(); // normalized name/alias -> slug

for (const file of files) {
  let raw: RawFile;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(RESEARCH, file), "utf8")) as RawFile;
  } catch (e) {
    errors.push(`${file}: does not parse (${(e as Error).message})`);
    continue;
  }

  for (const f of raw.flagged ?? []) {
    flagged.push({ file, name: f.name ?? "?", reason: f.reason ?? "", details: f.details ?? "" });
  }
  for (const p of raw.problems ?? []) agentProblems.push({ file, problem: p });

  for (const rf of raw.foods ?? []) {
    const label = `${file} / ${rf.name ?? rf.slug ?? "?"}`;
    const before = errors.length;

    /* required text */
    for (const k of ["slug", "name", "emoji", "category", "form", "tagline", "funFact", "confidenceNote", "realWorldCaveat"] as const) {
      if (!isStr(rf[k])) err(label, `missing ${k}`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rf.slug ?? "")) err(label, `bad slug "${rf.slug}"`);
    if (rf.slug && slugs.has(rf.slug)) err(label, `duplicate slug "${rf.slug}"`);
    if (!Array.isArray(rf.overview) || rf.overview.length < 1 || !rf.overview.every(isStr)) err(label, "bad overview");
    else if (rf.overview.length > 3) warn(label, `overview has ${rf.overview.length} paragraphs`);
    if (!Array.isArray(rf.facts) || rf.facts.length < 2 || !rf.facts.every((x) => isStr(x.label) && isStr(x.value)))
      err(label, "bad facts");
    else if (rf.facts.length > 4) warn(label, `${rf.facts.length} facts`);
    if (isStr(rf.tagline) && rf.tagline.length > 90) warn(label, `tagline is ${rf.tagline.length} chars`);
    if (rf.confidence !== "high" && rf.confidence !== "medium" && rf.confidence !== "low")
      err(label, `bad confidence "${rf.confidence}"`);

    /* constituents: recompute everything */
    const constituents: Constituent[] = [];
    const grams = new Map<string, number>();
    const humanGrams = new Map<string, { grams: number; mgPerKg: number; label: string }>();
    const seenKeys = new Set<string>();

    for (const rc of rf.constituents ?? []) {
      const cl = `${label} / ${rc.key ?? "?"}`;
      const ld = rc.ld50;
      if (!isStr(rc.key) || !isStr(rc.label)) {
        err(cl, "missing key/label");
        continue;
      }
      // Water would be the "limiting" constituent of nearly every moist food, which makes every page the same joke,
      // and ">90 mL/kg" is a limit value rather than a measured LD50 (water poisoning is about rate, not mass).
      if (/^water$/i.test(rc.key) || /^water$/i.test(rc.label.trim())) {
        waterSkipped++;
        continue;
      }
      if (seenKeys.has(rc.key)) {
        err(cl, "duplicate constituent key");
        continue;
      }
      seenKeys.add(rc.key);
      if (!isNum(rc.mgPer100g) || rc.mgPer100g <= 0) {
        err(cl, `bad mgPer100g ${rc.mgPer100g}`);
        continue;
      }
      if (!ld || !isNum(ld.mgPerKgCompound) || ld.mgPerKgCompound <= 0 || !isNum(ld.constituentFraction)) {
        err(cl, "bad ld50 inputs");
        continue;
      }
      if (ld.constituentFraction <= 0 || ld.constituentFraction > 1) {
        err(cl, `constituentFraction ${ld.constituentFraction} outside (0,1]`);
        continue;
      }
      if (!isStr(ld.compound) || !isStr(ld.species) || !isStr(ld.route)) {
        err(cl, "ld50 missing compound/species/route");
        continue;
      }
      const comp = ref(rc.compositionSource);
      const ldRefs = (ld.sources ?? []).map(ref);
      if (!comp) err(cl, "compositionSource needs a name and https url");
      if (!ldRefs.some((r) => r !== null)) err(cl, "ld50 needs at least one source with an https url");

      if (!/^rat/i.test(ld.species)) warn(cl, `LD50 species is ${ld.species}, not rat`);
      if (!/oral/i.test(ld.route)) warn(cl, `LD50 route is ${ld.route}, not oral`);

      // Our numbers, not the agent's.
      const mgPerKgConstituent = ld.mgPerKgCompound * ld.constituentFraction;
      if (isNum(ld.mgPerKgConstituent) && !close(ld.mgPerKgConstituent, mgPerKgConstituent, 0.03))
        warn(cl, `agent mgPerKgConstituent ${ld.mgPerKgConstituent} vs recomputed ${mgPerKgConstituent.toFixed(1)}`);
      const lethalG = ((mgPerKgConstituent * WEIGHT_KG) / rc.mgPer100g) * 100;
      if (isNum(rc.lethalFoodGramsAt70kg) && !close(rc.lethalFoodGramsAt70kg, lethalG, 0.03))
        warn(cl, `agent lethalFoodGramsAt70kg ${rc.lethalFoodGramsAt70kg} vs recomputed ${Math.round(lethalG)}`);

      for (const o of ld.otherValuesSeen ?? []) {
        if (!isNum(o.mgPerKg)) continue;
        const otherConstituent = o.mgPerKg * ld.constituentFraction;
        // Is a lower RAT value on record that the agent did not use? (Labels like "Mouse (not rat)" must not match.)
        // A "> 5000 mg/kg" limit value says nothing about the median, so it isn't a lower value worth reporting.
        const isLimitValue = /limit value|not a median|greater.than|[>≥]/i.test(`${o.route ?? ""} ${o.species ?? ""} ${o.note ?? ""}`);
        if (!isLimitValue && /^\s*rat\b/i.test(o.species ?? "") && otherConstituent < mgPerKgConstituent * 0.97) {
          warn(cl, `a lower rat value (${o.mgPerKg} mg/kg of ${ld.compound}) was seen but not used`);
        }
        // Human figures are the one cross-species value we use, and only as a safety screen: if a person's
        // estimated lethal dose puts the food within reach, a rat-based "you'd never manage it" would be misleading.
        if (/^\s*human/i.test(o.species ?? "")) {
          const g = ((otherConstituent * WEIGHT_KG) / rc.mgPer100g) * 100;
          if (!humanGrams.has(rc.key) || g < humanGrams.get(rc.key)!.grams) {
            humanGrams.set(rc.key, { grams: g, mgPerKg: o.mgPerKg, label: rc.label });
          }
        }
      }

      // Same screen, using the compound's human figure from any record (see humanByCompound).
      const humanElsewhere = humanByCompound.get(compoundKey(ld.compound));
      if (humanElsewhere) {
        const g = ((humanElsewhere.mgPerKg * ld.constituentFraction * WEIGHT_KG) / rc.mgPer100g) * 100;
        if (!humanGrams.has(rc.key) || g < humanGrams.get(rc.key)!.grams) {
          humanGrams.set(rc.key, { grams: g, mgPerKg: humanElsewhere.mgPerKg, label: rc.label });
        }
      }

      const bucket = ld50Seen.get(normalize(ld.compound)) ?? new Set<string>();
      bucket.add(`${ld.mgPerKgCompound} (${ld.species})`);
      ld50Seen.set(normalize(ld.compound), bucket);

      /* The page prints this inside "the published figure is for <compound>; <conversion>", so it is generated here
         rather than copied from the agents' free-text notes (which ranged from "no conversion (100%)" to paragraphs). */
      const compoundName = plainLabel(ld.compound).replace(/^[DL]-/i, "");
      const what = plainLabel(rc.label).toLowerCase();
      let conversion: string | undefined;
      if (ld.constituentFraction < 0.9995) {
        conversion = `${what} is ${(ld.constituentFraction * 100).toFixed(1)}% of ${compoundName.toLowerCase()} by mass, so the published ${formatLd50(ld.mgPerKgCompound)} mg/kg of the compound works out to ${formatLd50(mgPerKgConstituent)} mg/kg of ${what}`;
      } else if (/sugar/i.test(rc.label)) {
        conversion = `total sugars are treated as if they were all ${compoundName.toLowerCase()}, because no LD50 exists for "sugars" as a whole, so this is a stand-in rather than a measurement`;
      }

      grams.set(rc.key, lethalG);
      constituents.push({
        key: rc.key,
        label: rc.label.trim(),
        mgPer100g: rc.mgPer100g,
        ld50: {
          mgPerKg: Number(mgPerKgConstituent.toPrecision(5)),
          species: ld.species,
          route: ld.route,
          compound: compoundName,
          ...(conversion ? { conversion } : {}),
        },
        references: uniqueRefs([comp, ...ldRefs]),
        ...(isStr(rc.notes) ? { notes: rc.notes.trim() } : {}),
      });
    }

    if (constituents.length === 0) err(label, "no usable constituents");
    else if (constituents.length < 2) warn(label, "only one constituent");

    /* headline + attainability, recomputed */
    let headline: Constituent | undefined;
    let headlineG = Infinity;
    for (const c of constituents) {
      const g = grams.get(c.key)!;
      if (g < headlineG) {
        headlineG = g;
        headline = c;
      }
    }
    // The agents usually chose water, which we skip on purpose, so only report other disagreements.
    if (headline && rf.headlineConstituentKey !== headline.key && !/^water$/i.test(rf.headlineConstituentKey ?? ""))
      warn(label, `agent headline "${rf.headlineConstituentKey}" but "${headline.key}" needs less food (${Math.round(headlineG)} g)`);

    /* servings */
    const equivalents: EquivalentUnit[] = [];
    const servingRefs: Array<Reference | null> = [];
    for (const u of rf.servingUnits ?? []) {
      if (!isStr(u.singular) || !isStr(u.plural) || !isNum(u.gramsPerUnit) || u.gramsPerUnit <= 0 || !isStr(u.emoji)) {
        err(label, `bad serving unit ${JSON.stringify(u.singular)}`);
        continue;
      }
      if (u.gramsPerUnit > 5_000) warn(label, `serving "${u.singular}" is ${u.gramsPerUnit} g`);
      const sref = ref(u.source);
      // "1 kg" is a definition, not a measurement, so it needs no source.
      if (!sref && u.gramsPerUnit !== 1000) warn(label, `serving "${u.singular}" has no https source`);
      servingRefs.push(sref);
      if (headline) {
        equivalents.push({
          singular: u.singular,
          plural: u.plural,
          mgPerUnit: (headline.mgPer100g * u.gramsPerUnit) / 100,
          emoji: u.emoji,
          ...(isStr(u.quip) ? { quip: u.quip } : {}),
        });
      }
    }
    if (equivalents.length === 0) err(label, "no usable serving units");

    if (errors.length > before || !headline) {
      dropped.push({ name: rf.name ?? rf.slug ?? "?", file, why: "failed validation (see errors)" });
      continue;
    }

    // Safety: only foods where the lethal serving is genuinely out of reach make it in.
    if (headlineG < LARGE_G) {
      dropped.push({
        name: rf.name!,
        file,
        why: `lethal serving is only ${Math.round(headlineG).toLocaleString("en")} g (${headline.label}), under the ${LARGE_G} g floor`,
      });
      continue;
    }
    // Human screen: a person's estimated lethal dose is the one cross-species value that matters for safety. If it
    // puts the food within reach, a rat-based "you'd never manage it" would be misleading, so the food is left out.
    const humanHit = [...humanGrams.values()].find((h) => h.grams < LARGE_G);
    if (humanHit) {
      dropped.push({
        name: rf.name!,
        file,
        why: `a human lethal-dose estimate for ${humanHit.label.toLowerCase()} (${humanHit.mgPerKg} mg/kg of the compound) gives only ${Math.round(humanHit.grams).toLocaleString("en")} g, under the ${LARGE_G} g floor (the rat figure says ${Math.round(headlineG).toLocaleString("en")} g)`,
      });
      continue;
    }

    const attainability = headlineG >= ABSURD_G ? "absurd" : "large";
    if (rf.attainability !== attainability) warn(label, `agent said ${rf.attainability}, recomputed ${attainability}`);

    /* Prose: the agents wrote it around THEIR headline (usually water). If ours differs, or it still talks about
       water as the limit, it must be rewritten (research/REWRITE.md) before the food can ship. */
    const rewrite = rewrites.get(rf.slug!);
    const oldText = [rf.tagline, ...(rf.overview ?? []), rf.funFact, rf.realWorldCaveat, rf.confidenceNote].join(" ");
    const needsRewrite = rf.headlineConstituentKey !== headline.key || WATER_AS_LIMIT.test(oldText);
    if (needsRewrite && !rewrite) {
      const rawHeadline = (rf.constituents ?? []).find((c) => c.key === headline!.key);
      const doseMg = lethalDoseMg(headline.ld50, WEIGHT_KG);
      pending.push({
        file,
        input: {
          slug: rf.slug,
          name: rf.name,
          category: rf.category,
          form: rf.form,
          whyRewrite:
            rf.headlineConstituentKey !== headline.key
              ? `the old text treats "${rf.headlineConstituentKey}" as the limiting constituent`
              : "the old text still talks about water as a limit or runner-up",
          headline: {
            key: headline.key,
            label: headline.label,
            mgPer100g: headline.mgPer100g,
            compound: headline.ld50.compound,
            ld50MgPerKgOfConstituent: headline.ld50.mgPerKg,
            species: headline.ld50.species,
            lethalFoodMassFor70kg: formatFoodMass(headlineG),
            otherLd50ValuesSeen: rawHeadline?.ld50?.otherValuesSeen ?? [],
          },
          servingCountsFor70kg: equivalents.map((e) => ({
            unit: e.singular,
            pluralUnit: e.plural,
            count: formatCount(unitsInDose(doseMg, e)),
          })),
          otherConstituents: constituents
            .filter((c) => c.key !== headline!.key)
            .sort((a, b) => grams.get(a.key)! - grams.get(b.key)!)
            .map((c) => ({
              label: c.label,
              mgPer100g: c.mgPer100g,
              lethalFoodMassFor70kg: formatFoodMass(grams.get(c.key)!),
            })),
          facts: rf.facts,
          current: {
            tagline: rf.tagline,
            overview: rf.overview,
            funFact: rf.funFact,
            realWorldCaveat: rf.realWorldCaveat,
            confidenceNote: rf.confidenceNote,
            confidence: rf.confidence,
          },
        },
      });
      continue;
    }
    if (rewrite) {
      const bad =
        !isStr(rewrite.tagline) ||
        !Array.isArray(rewrite.overview) ||
        rewrite.overview.length < 1 ||
        !rewrite.overview.every(isStr) ||
        !isStr(rewrite.funFact) ||
        !isStr(rewrite.realWorldCaveat) ||
        !isStr(rewrite.confidenceNote);
      if (bad) {
        err(label, "rewrite is missing or malformed fields");
        continue;
      }
      if (rewrite.tagline!.length > 90) warn(label, `rewritten tagline is ${rewrite.tagline!.length} chars`);
      if (WATER_AS_LIMIT.test([rewrite.tagline, ...rewrite.overview!, rewrite.funFact, rewrite.realWorldCaveat, rewrite.confidenceNote].join(" ")))
        warn(label, "rewritten text still talks about water as a limit");
      rewritten++;
    }
    // Fact rows are shown as written, so drop any that name a "limiting constituent" (the agents chose water; the
    // page already shows the real headline, so these rows are both wrong and redundant).
    const facts = rf.facts!
      .filter((x) => {
        const framesLimit = /limiting|headline|runner.up|lower.bound/i.test(x.label!) || WATER_AS_LIMIT.test(`${x.label}: ${x.value}`);
        if (framesLimit) factsDropped.push(`${rf.name}: "${x.label}: ${x.value}"`);
        return !framesLimit;
      })
      .map((x) => ({ label: x.label!.trim(), value: x.value!.trim() }));
    if (facts.length < 2) {
      err(label, "fewer than 2 facts left after dropping limit-framing rows");
      continue;
    }

    const text = {
      tagline: rewrite?.tagline ?? rf.tagline!,
      overview: rewrite?.overview ?? rf.overview!,
      funFact: rewrite?.funFact ?? rf.funFact!,
      caveat: rewrite?.realWorldCaveat ?? rf.realWorldCaveat!,
      confidenceNote: rewrite?.confidenceNote ?? rf.confidenceNote!,
      confidence: (rewrite?.confidence ?? rf.confidence) as "high" | "medium" | "low",
    };

    /* aliases: unique across the whole food set */
    const aliases: string[] = [];
    for (const a of [rf.name!, ...(rf.aliases ?? [])]) {
      if (!isStr(a)) continue;
      const n = normalize(a);
      if (!n) continue;
      const owner = claimed.get(n);
      if (owner && owner !== rf.slug) {
        if (a !== rf.name) notes.push(`alias "${a}" on ${rf.slug} is already used by ${owner}; dropped`);
        else warn(label, `name collides with ${owner}`);
        continue;
      }
      claimed.set(n, rf.slug!);
      if (a !== rf.name) aliases.push(a.trim());
    }

    slugs.add(rf.slug!);
    foods.push({
      slug: rf.slug!,
      name: rf.name!.trim(),
      emoji: rf.emoji!,
      aliases,
      tagline: text.tagline.trim(),
      overview: text.overview.map((p) => p.trim()),
      facts,
      ld50: headline.ld50,
      equivalents,
      funFact: text.funFact.trim(),
      caveat: text.caveat.trim(),
      sources: [...new Set(headline.references.map((r) => r.name))],
      food: {
        category: rf.category!.trim(),
        form: rf.form!.trim(),
        constituents,
        headlineKey: headline.key,
        attainability,
        confidence: text.confidence,
        confidenceNote: text.confidenceNote.trim(),
        servingReferences: uniqueRefs(servingRefs),
      },
    });
  }
}

/* ---------- Foods waiting on a prose rewrite ---------- */

// `--inputs=treats,fruit` limits which rewrite-input files are touched, so a rewrite agent that is still reading
// its own input is never disturbed by a build run.
const onlyInputs = process.argv.find((a) => a.startsWith("--inputs="))?.slice("--inputs=".length).split(",");

for (const file of files) {
  const category = file.replace(/^foods-|\.json$/g, "");
  if (onlyInputs && !onlyInputs.includes(category)) continue;
  const out = path.join(RESEARCH, `rewrite-input-${category}.json`);
  const mine = pending.filter((p) => p.file === file).map((p) => p.input);
  if (mine.length) fs.writeFileSync(out, JSON.stringify({ category, foods: mine }, null, 2));
  else if (fs.existsSync(out)) fs.rmSync(out); // everything in this file has been rewritten
}

/* ---------- Write dataset ---------- */

foods.sort((a, b) => a.name.localeCompare(b.name));

const header = `/**
 * GENERATED by scripts/build-foods.ts from research/foods-*.json. Do not edit by hand:
 * fix the research file (or the script) and run \`npm run build:foods\`.
 */

import type { Substance } from "../../shared/types.ts";

export const FOODS: Substance[] = `;
fs.writeFileSync(OUT_DATA, `${header}${JSON.stringify(foods, null, 2)};\n`);

/* ---------- Cross-file consistency ---------- */

const inconsistent = [...ld50Seen.entries()].filter(([, v]) => v.size > 1);

/* ---------- QA report ---------- */

const lines: string[] = [];
lines.push(`# Food data QA (${new Date().toLocaleDateString("en-CA")})`, "");
lines.push(`- Files read: ${files.join(", ")}`);
lines.push(`- Foods written: **${foods.length}** (absurd: ${foods.filter((f) => f.food?.attainability === "absurd").length}, large: ${foods.filter((f) => f.food?.attainability === "large").length})`);
lines.push(`- Dropped by this script: ${dropped.length}`);
lines.push(`- Waiting on a prose rewrite (not shipped yet): ${pending.length}; rewritten and shipped: ${rewritten}`);
lines.push(`- Flagged by the agents: ${flagged.length}`);
lines.push(`- Errors: ${errors.length}, warnings: ${warnings.length}`);
lines.push(`- Water constituents skipped on purpose: ${waterSkipped} (see the comment in build-foods.ts)`, "");

const section = (title: string, items: string[]) => {
  lines.push(`## ${title}`, "");
  lines.push(...(items.length ? items.map((i) => `- ${i}`) : ["- none"]), "");
};
section("Errors", errors);
section("Warnings", warnings);
section("Dropped", dropped.map((d) => `${d.name} (${d.file}): ${d.why}`));
section(
  "Waiting on a prose rewrite",
  pending.map((p) => `${String(p.input.name)} (${p.file}): ${String(p.input.whyRewrite)}`),
);
section("Flagged by agents", flagged.map((f) => `${f.name} (${f.file}): ${f.reason}${f.details ? ` — ${f.details}` : ""}`));
section(
  "Same compound, different LD50 across files",
  inconsistent.map(([compound, v]) => `${compound}: ${[...v].join(" | ")}`),
);
section("Fact rows dropped for framing a constituent as the limit", factsDropped);
section("Alias notes", notes);
section("Agent-reported problems", agentProblems.map((p) => `(${p.file}) ${p.problem}`));

lines.push("## Headline constituents", "");
const byHeadline = new Map<string, string[]>();
for (const f of foods) {
  const h = f.food!.headlineKey;
  byHeadline.set(h, [...(byHeadline.get(h) ?? []), f.name]);
}
for (const [k, v] of [...byHeadline.entries()].sort((a, b) => b[1].length - a[1].length)) {
  lines.push(`- ${k} (${v.length}): ${v.join(", ")}`);
}
lines.push("");

lines.push("## Lethal serving per food (headline, 70 kg)", "");
lines.push("| Food | Headline | mg/kg | Food for LD50 | Confidence |", "| --- | --- | ---: | ---: | --- |");
for (const f of foods) {
  const h = f.food!.constituents.find((c) => c.key === f.food!.headlineKey)!;
  const g = ((h.ld50.mgPerKg * WEIGHT_KG) / h.mgPer100g) * 100;
  lines.push(`| ${f.name} | ${h.label} | ${h.ld50.mgPerKg} | ${(g / 1000).toFixed(1)} kg | ${f.food!.confidence} |`);
}
lines.push("");

fs.writeFileSync(OUT_QA, lines.join("\n"));

console.log(
  `Wrote ${foods.length} foods to ${path.relative(ROOT, OUT_DATA)}; dropped ${dropped.length}, flagged ${flagged.length}, ` +
    `errors ${errors.length}, warnings ${warnings.length}, inconsistent LD50s ${inconsistent.length}. Report: ${path.relative(ROOT, OUT_QA)}`,
);
if (errors.length) process.exitCode = 1;
