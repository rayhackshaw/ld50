# LD50 food research spec

You are one of several research agents compiling data for **LD50**, a comedy/trivia website. A visitor searches for a
food ("banana") and sees: what it is, an "LD50", and what that works out to in familiar units ("about 480 bananas").

Foods don't have an LD50 of their own. We **derive** one from a constituent that has a published LD50. For a banana
the headline is potassium: how much potassium is in a banana, how much potassium is the (rat-derived) lethal dose for a
70 kg person, therefore how many bananas that is. Keep this tone: **accurate numbers, funny framing, no medical advice**.

Read `C:\Users\RayHackshaw\dev\ld50\server\data\substances.ts` for the writing voice (NZ English spelling, dry, short).
It also shows how the existing ingredient entries look. Do NOT edit any file in the project except your one output file.

## Method, per food

1. Take the food in the form named in your assignment (e.g. "raw", "cooked"). Edible portion only (no seeds, stones, skin
   unless normally eaten).
2. Find the **2 to 5 constituents** most likely to be the limiting one, i.e. the one giving the smallest lethal mass of
   food. Always consider: water, sodium (as NaCl), potassium (as KCl), sugars (sucrose/glucose/fructose), caffeine and
   theobromine, vitamin C, oxalate, and anything food-specific (e.g. coumarin in cassia cinnamon, capsaicin in chilli).
3. A constituent is only allowed in if BOTH hold:
   - **Amount in the food** comes from USDA FoodData Central (fdc.nal.usda.gov) or the NZ Food Composition Database
     (or another authoritative database), with the URL you actually opened.
   - **An oral LD50** exists in rat (use mouse only if no rat value exists, and say so) from PubChem, HSDB, an
     SDS from a major supplier (Sigma-Aldrich/Merck, Fisher, Cayman, etc.), ECHA, or a peer-reviewed source, with the URL.
4. **Convert onto the same basis.** LD50s are for a *compound* (e.g. potassium chloride) but food data is for the
   *element or ion* (potassium). Convert the LD50 to mg of the constituent per kg body weight and show the conversion
   (e.g. K is 39.098/74.551 = 52.4% of KCl by mass). If sources disagree, record every value you saw and use the
   **lowest credible rat oral value** as the working number (conservative).
5. **Compute in code, not by hand** (a one-line `node -e` is fine):
   `lethalFoodGramsAt70kg = mgPerKgConstituent * 70 / mgPer100g * 100`.
6. Headline constituent = the one with the smallest `lethalFoodGramsAt70kg`.
7. For liquids, treat 1 ml as about 1 g unless you know the density (honey 1.42, milk 1.03, etc.) and say which you used.
   Everything is **per 100 g**.

## Hard rules

- **Never invent or "recall" a number.** If you can't find and open a source for a figure, drop that constituent
  (or set the field to null and explain in `problems`). A smaller correct dataset beats a bigger guessed one.
- Every number needs a URL you actually fetched this session. No made-up URLs.
- Skip alcoholic drinks and any medicine/supplement.
- **Attainability filter** (this matters, it's a safety issue). The site must never imply "you'd need X" when X is a
  realistic quantity. Using the headline constituent's `lethalFoodGramsAt70kg`:
  - `absurd`: 5,000 g or more.  `large`: 2,000 to 4,999 g.  `plausible`: under 2,000 g.
  - Only `absurd` and `large` foods go in `foods`. `plausible` ones go in `flagged` (name + reason + the numbers).
  - ALSO put in `flagged`, regardless of the maths, any food with a well-documented real acute toxicity at ordinary
    amounts, such as undercooked/raw kidney beans, bitter almonds, apple seeds, nutmeg, raw cassava, green potatoes,
    star fruit, ackee, large amounts of liquorice. Give the mechanism in one line.
- Don't describe any way of using food to harm someone. Stay in "you'd never manage it" territory.
- If an item on your list is unsuitable, swap in a similar common item and note the swap in `problems`.

## Output

Write ONE file, valid JSON, to the path in your assignment. Validate it before finishing, e.g.
`node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log('ok')" <file>`.

```jsonc
{
  "meta": { "category": "fruit", "compiledAt": "2026-11-10", "count": 20 },
  "foods": [
    {
      "slug": "banana",                 // kebab-case, unique
      "name": "Banana",
      "emoji": "🍌",
      "aliases": ["bananas", "cavendish"],
      "category": "fruit",
      "form": "raw, peeled",
      "tagline": "One line, witty, max 90 characters.",
      "overview": ["Paragraph 1 (facts first, max ~60 words).", "Paragraph 2 (the joke, still true)."],
      "facts": [{ "label": "Typical serving", "value": "1 medium banana (118 g)" }],   // 3 or 4
      "funFact": "One true, checkable fun fact.",
      "constituents": [
        {
          "key": "potassium",
          "label": "Potassium",
          "mgPer100g": 358,
          "compositionSource": { "name": "USDA FoodData Central", "url": "https://...", "id": "1105314" },
          "ld50": {
            "compound": "Potassium chloride",
            "mgPerKgCompound": 2600,
            "species": "Rat",
            "route": "Oral",
            "constituentFraction": 0.5244,
            "mgPerKgConstituent": 1363.4,
            "conversionNote": "K = 39.098 / 74.551 = 52.4% of KCl by mass",
            "otherValuesSeen": [{ "mgPerKg": 3020, "species": "Rat", "url": "https://..." }],
            "sources": [{ "name": "PubChem", "url": "https://..." }]
          },
          "lethalFoodGramsAt70kg": 26600,
          "notes": "Anything unusual about this constituent's data."
        }
      ],
      "headlineConstituentKey": "potassium",
      "servingUnits": [
        { "singular": "medium banana (118 g)", "plural": "medium bananas (118 g)", "gramsPerUnit": 118, "emoji": "🍌",
          "source": { "name": "USDA FoodData Central", "url": "https://..." }, "quip": "optional" }
      ],                                // 2 or 3 relatable units, always with a gram weight
      "attainability": "absurd",        // "absurd" | "large"
      "confidence": "high",             // "high" | "medium" | "low"
      "confidenceNote": "Why, in one line (e.g. LD50 sources disagree by 2x).",
      "realWorldCaveat": "1 or 2 sentences on why the lab number misleads for this food (gut limits, vomiting, kidneys, absorption)."
    }
  ],
  "flagged": [
    { "name": "Raw kidney beans", "reason": "real acute toxicity at ordinary amounts", "details": "lectin (phytohaemagglutinin) ..." }
  ],
  "problems": ["Plain-English notes on anything missing, swapped, or uncertain."]
}
```

## Your final reply

Under 200 words: how many foods landed in `foods`, how many in `flagged` (names only), the biggest `problems`, and
the output path. Do not paste the JSON.
