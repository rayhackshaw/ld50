# LD50 prose rewrite spec

You are rewriting the **prose** for foods on **LD50**, a comedy/trivia site ("how much of this would it take to kill a
rat, scaled to a 70 kg human?"). Tone: **accurate numbers, funny framing, no medical advice**. NZ English spelling,
dry, short. Read `C:\Users\RayHackshaw\dev\ld50\server\data\substances.ts` (first ~60 lines) for the voice.

## Why this job exists

A first set of agents researched each food and wrote the copy around **water** as the "limiting" constituent
("water sets the limit: about 9.7 kg of chicken"). We have decided water must **not** be the headline:

- the rat figure for water is only a limit value (">90 mL/kg"), not a measured median;
- water poisoning is about how fast you drink, not how much you eat inside a solid food;
- it makes every page the same joke.

So the maths now ignores water and the headline is the next-smallest constituent (usually potassium, sometimes sodium,
sugars, magnesium or oxalate). The numbers on the page are already correct. **Your job is to make the words match
them.**

## What the page already shows (so don't repeat it, add colour)

For each food the page already displays, computed by code: the headline's borrowed LD50 and the compound/conversion
behind it, the lethal dose in mg, the lethal mass of food, serving-unit counts ("226 medium bananas"), a table of
the other constituents with the food mass each would take, the `confidenceNote` under that table, source links, and
the `realWorldCaveat` under "Before you try anything". Your text sits alongside all that.

## Input and output

- Input: the file named in your assignment (`research/rewrite-input-<category>.json`): `{ category, foods: [...] }`.
  Each food has `headline` (key, label, mg per 100 g, compound, LD50 per kg of the constituent, species,
  `lethalFoodMassFor70kg`, `otherLd50ValuesSeen`), `servingCountsFor70kg`, `otherConstituents` (with their lethal food
  masses), `facts`, and `current` (the old tagline, overview, funFact, realWorldCaveat, confidenceNote, confidence).
- Output: **one** file, `research/rewritten-<category>.json`, valid JSON:

```jsonc
{
  "category": "vegetable",
  "rewrites": [
    {
      "slug": "potato",
      "tagline": "max 90 characters, witty",
      "overview": [
        "Paragraph 1: facts first, what the food is and what's in it, max ~60 words.",
        "Paragraph 2: the joke, tying the HEADLINE constituent to the lethal mass and a serving count."
      ],
      "funFact": "One true, checkable fun fact.",
      "realWorldCaveat": "1 or 2 sentences on why the lab number misleads for THIS food and THIS constituent.",
      "confidenceNote": "One honest line about how solid the headline figure is.",
      "confidence": "medium"
    }
  ],
  "notes": ["anything the lead should know"]
}
```

Write a rewrite for **every** food in the input, using its exact `slug`. Validate before finishing:
`node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log('ok')" <file>`.
Do not modify any other file. You are on Windows PowerShell; use absolute paths.

## Rules

1. **Headline first.** Paragraph 2 names the headline constituent by `headline.label` and uses
   `headline.lethalFoodMassFor70kg` and one of the `servingCountsFor70kg` counts **exactly as given** (copy the
   strings; do not recompute or round differently).
2. **No new numbers about lethality.** The only lethal masses/counts you may quote are the ones in the input. You may
   quote composition numbers that appear in `facts`, `headline.mgPer100g`, `otherConstituents[].mgPer100g`, or in
   `current` text where they describe what the food contains (e.g. "65 g of water per 100 g"). Don't add other
   figures from memory. If you are unsure of a fact, leave it out.
3. **Water is colour, never the limit.** You may mention a food is mostly water ("two-thirds water") as a joke or a
   fact. Never say or imply that water sets the limit, is the limiting/headline constituent, is a "lower bound", or
   is the runner-up. Avoid the words limit, limiting, headline, lower bound, runner-up, second, sets and problem
   within the same sentence as the word "water": the build script flags those.
4. **The comparison is rat-derived, so say so lightly** (e.g. "at the rat-derived dose") at least once per food, in
   the overview or caveat.
5. **realWorldCaveat must be specific and true.** Why the lab number misleads for this food and this constituent:
   you'd stop eating long before (volume, fibre, fat, taste), vomiting, how kidneys or the gut handle the
   constituent, how a person's tolerance differs from a rat's, how food-bound amounts absorb more slowly than a
   neat dose. Keep any real food-safety hazard from the old caveat (raw flour, rice left at room temperature,
   allergies, choking, kidney disease and potassium, etc.). No medical advice, no "safe amount" claims.
6. **confidenceNote** is honest and short: where the amount in the food came from (USDA SR Legacy / NZ FOODfiles,
   as the old text says), that the LD50 is a single published rat oral figure (or a stand-in, e.g. glucose standing
   in for total sugars; sodium chloride standing in for sodium), and, if `otherLd50ValuesSeen` contains much lower
   values from other species (e.g. mouse, human), say so in a few words. Keep `confidence` at the old value unless
   the new headline is shakier (a stand-in compound, an unmatched food form): then use "low" or "medium".
7. **funFact**: keep the old one verbatim if it is still true and doesn't frame water as the limit. Otherwise write
   one true, checkable fact about the food (you may use web search/fetch to check it).
8. **Safety:** never describe a way of using food to harm someone, and never suggest anyone should try to reach
   these amounts. Stay in "you'd never manage it" territory.
9. Keep each tagline ≤ 90 characters, overview exactly two paragraphs.

## Your final reply

Under 150 words: how many foods you rewrote, any you think shouldn't ship (and why), and the output path. Do not
paste the JSON.
