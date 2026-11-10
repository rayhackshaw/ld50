# LD50

> How much is too much?

A one-page-ish web app that is mostly a joke and a little bit informative. You get a search bar. Type in something
you might consume and the page opens out into a write-up: what it is, its **LD50**, and what that lethal dose works
out to in real-world units (e.g. *141 cups of coffee*).

LD50 = "lethal dose, 50%": the dose that killed half the animals in a toxicity study. It's measured in rats and mice,
so treat everything here as comedy with a side of trivia, not safety advice.

## Run it

Needs Node **22.18+** (developed on 26). The server runs TypeScript directly via Node's built-in type stripping,
so there is no server build step.

```bash
npm install
npm run dev        # API on :8787 + Vite on :5173  ->  open http://127.0.0.1:5173
```

| Script          | What it does                                                           |
| --------------- | ---------------------------------------------------------------------- |
| `npm run dev`   | API (`node --watch`) and Vite dev server together, `/api` proxied      |
| `npm run check` | Typecheck client and server (`tsc`)                                    |
| `npm run build` | Typecheck, then build the client to `dist/`                            |
| `npm start`     | One process serving the API **and** the built client (`PORT`, def 8787) |
| `npm run build:foods` | Rebuilds the food dataset from `research/` and writes `research/QA.md` (see below) |

## How it's laid out

```
shared/            Types + the LD50 maths, imported by BOTH client and server
  types.ts           Substance (ingredient or food), Constituent, Reference, API response shapes
  ld50.ts            dose = mg/kg x body weight, unit equivalents, food-mass maths, formatting, toxicity tiers
server/            Hono API (no build step)
  app.ts             Routes. Pure Hono, so it could also run on Cloudflare Workers
  index.ts           Node entrypoint; with --static also serves ./dist
  provider.ts        SubstanceProvider interface: the seam for swapping data sources
  static-provider.ts Provider backed by the dataset below
  search.ts          Normalising, ranking, typo tolerance
  data/substances.ts       Hand-written ingredients (edit this to add things)
  data/foods.generated.ts  GENERATED whole foods. Never edit by hand (see "Foods")
  data/index.ts            Merges the two; foods win name clashes ("coffee" -> brewed coffee, not caffeine)
scripts/
  build-foods.ts     Turns research/ into foods.generated.ts and a QA report
research/            What the research agents produced, plus the specs they worked to
  SPEC.md            How to research a food
  REWRITE.md         How to rewrite a food's prose once its headline is known
  foods-*.json       Raw research, one file per category
  rewritten-*.json   Prose redone around the headline we actually use
  QA.md              Generated report: errors, warnings, drops, flags, headline distribution
src/               React client
  App.tsx            State machine: idle -> loading -> found | missing | error; URL = ?q=
  components/        SearchBar (autocomplete), Result (the full-page write-up), Status
  styles.css         Caution-tape look; the hero collapses up when results arrive
```

### API

| Route                      | Returns                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| `GET /api/lookup?q=`       | `{ substance, exact }`, or 404 `{ error, query, suggestions }` when nothing matches |
| `GET /api/suggest?q=`      | `{ suggestions: [{ slug, name, emoji }] }` for the autocomplete                  |
| `GET /api/substances/:slug`| `{ substance }`                                                                  |
| `GET /api/random`          | `{ suggestion }` (the "Surprise me" button)                                      |
| `GET /api/health`          | `{ ok: true }`                                                                   |

Search handles aliases (`coffee` finds Brewed coffee, `bicarb` finds Baking soda, `caffeine` finds Caffeine) and small
typos (`cafeine`; one edit for queries up to 9 letters, two above that, with closer matches ranked first). A name's
bracketed qualifier is optional, so `sweet potato` finds "Sweet potato (kumara)". Results are shareable: `/?q=banana`.

## Adding a substance

Add an entry to `server/data/substances.ts`. The important fields:

- `ld50.mgPerKg` plus `species` and `route`
- `equivalents`: relatable units, each with `mgPerUnit` (milligrams of the substance in one unit). The page
  does the maths for whatever body weight the visitor picks.
- `aliases`: alternate search terms
- `caveat`: the honest "don't take this literally" note for that substance

Under `npm run dev` the API restarts itself when you save.

## Foods

Foods such as banana, rice or cheddar have no LD50 of their own, so each one **borrows** the LD50 of something inside
it that does have a published figure. Searching "banana" gives potassium; the page shows how much banana would deliver
the lethal dose of potassium for the chosen body weight.

```
mgPerKgConstituent    = published oral LD50 of a compound (rat) x the constituent's share of that compound
                        (KCl is 52.4% potassium, NaCl is 39.3% sodium, ...)
lethal food, grams    = mgPerKgConstituent x body weight / mg of constituent per 100 g x 100
headline constituent  = whichever constituent needs the least food to reach its LD50
```

The data pipeline:

1. Research agents filled in `research/foods-<category>.json` to the rules in `research/SPEC.md`. Every figure needs a
   fetched URL; nothing is typed from memory.
2. `npm run build:foods` **recomputes every number** rather than trusting the agents, validates the schema and URLs,
   applies the rules below, and writes `server/data/foods.generated.ts` and `research/QA.md`. Read the QA report after
   every run.
3. Where the headline changed from what the agent assumed, the prose is rewritten around the real headline
   (`research/REWRITE.md`). The build refuses to ship a food whose text was written for a different headline: it
   writes `research/rewrite-input-<category>.json` for those and waits for `research/rewritten-<category>.json`.
   `--inputs=fruit,treats` limits which input files a run touches.

Rules baked into the build:

- **Only silly lethal servings ship.** 5 kg or more is `absurd`, 2 to 5 kg is `large`. Anything under 2 kg, or with a
  real acute hazard at ordinary amounts, is dropped or goes to the agents' `flagged` list.
- **Water is never the headline.** It would limit nearly every moist food and make every page the same joke; the rat
  figure for water is a ">90 mL/kg" limit rather than a measured median; and water poisoning is about drinking fast,
  not about mass inside a solid food. Water can still be mentioned as colour.
- **Human screen.** A human lethal-dose figure is gathered per compound from *every* research record (not just the one
  that happened to quote it) and applied to every food that leans on that compound. If it would put the serving under
  2 kg, the food is dropped even though the page numbers are rat-based. This is how bacon, ham and olives went: the
  human sodium chloride LDLo (1,000 mg/kg) puts their lethal serving under 2 kg. Entries with an unclear species
  ("Human?/unspecified") are ignored, and other-species values (mouse etc.) are not used.
- **The "borrowed from" sentence is generated**, not copied from the agents' notes, so every page words the conversion
  the same way (e.g. potassium being 52.4% of potassium chloride). Sugars are flagged as a stand-in.
- **Rewrite gating also catches water-as-the-limit prose**, sentence by sentence, so old text that says water "gets there
  first" or "beats" the real headline cannot ship.
- **Rat, oral, lowest credible value** is preferred. Compounds are converted to the element or ion foods are measured in.
- **Foods win name clashes** against plain ingredients.

## Things to know before this goes public

1. **Verify the ingredient numbers.** The 8 hand-written ingredients' LD50 values are commonly cited safety-data-sheet
   figures (rat, oral) that were entered from memory. Check each against a current SDS / PubChem, and replace the
   generic `sources` strings with real links. The food data, by contrast, carries a URL for every figure.
2. **Food composition is mostly US data** (USDA SR Legacy averages), with NZ FOODfiles for some animal foods. A New
   Zealand product may differ. Each page shows a data-confidence line.
3. **The set is deliberately everyday and harmless-ish.** No alcohol, no medicines. Think hard before adding painkillers,
   alcohol, or anything people overdose on in real life. For those, "rat LD50 scaled to a human" is badly misleading,
   because real harm starts far below it.
4. **Sugars use glucose or sucrose as the LD50 stand-in**, and potassium and sodium use KCl and NaCl. The pages say so.
5. **The footer has a New Zealand poisons-centre number** (0800 764 766). Change it if the audience isn't NZ.
6. The example chips on the landing page and the "nothing found" suggestions are hard-coded (`EXAMPLES` in
   `src/App.tsx`, `POPULAR_SLUGS` in `server/data/index.ts`).

## Ideas for next

- **A provider for arbitrary searches** (so you can look up *anything*). Implement `SubstanceProvider` in
  `server/provider.ts` backed by an LLM that returns a `Substance`-shaped JSON blob, and keep the maths in
  `shared/ld50.ts` deterministic. Cache results so each thing is only generated once. Add a refusal path for
  anything that isn't food, drink or a household item.
- Local flavour in `equivalents` (pineapple lumps, flat whites, L&P bottles).
- Share cards / OG images per result.
- A "weight" toggle between kg and stone/lb.
- Deploy: `npm run build && npm start` works on any Node host. The Hono app in `server/app.ts` is runtime-agnostic if
  you'd rather use Cloudflare Workers + static assets.
