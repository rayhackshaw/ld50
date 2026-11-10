# LD50

> How much is too much?

A search bar, and a joke with some real numbers behind it. Type in something you might eat or drink and the page opens
out into a write-up that starts with the answer:

> It would take about **28.6 kg** of banana to kill you, or roughly **242 medium bananas**.

LD50 means "lethal dose, 50%": the dose that killed half the animals in a toxicity study. It's measured in rats and
mice, so everything here is comedy with a side of trivia. It is not safety advice.

## What you get

The landing page is only the search bar, with a few example chips and a "Surprise me" button. Search for anything on the
list and the hero slides up and the result takes over the page.

Every result opens with the answer in red: how much of the thing it would take, and roughly how many of it. That's the
only red on the site. Underneath, in order:

1. **The basics.** What it is, in a couple of paragraphs.
2. **The LD50.** The number itself, the animal and route it was measured in, and a six-step toxicity meter
   (Hodge & Sterner, from "extremely toxic" down to "relatively harmless").
3. **In human terms.** The lethal dose scaled to a body weight, then turned into things you can picture. A weight
   slider drives it, so the numbers and the little equivalents move as you drag. It starts at 75 kg and only
   remembers your weight once you've moved it.
4. **What else is in there** (foods). Everything in the food that has a published LD50, and which one limits you.
5. **A fun fact**, and a **Worth knowing** note on why the figure shouldn't be taken literally.

The footer links to the sources for the figures, and to the National Poisons Centre (0800 764 766) for anyone who
needs it.

## What's on the list

99 things: 91 whole foods and 8 ingredients, with about 400 aliases between them, so `coffee`, `bicarb` and `kumara`
all land somewhere sensible. Search forgives small typos, and results are shareable links (`/?q=banana`).

## Where the numbers come from

**Ingredients** (water, table salt, sugar, caffeine, baking soda, vitamin C, MSG, citric acid) have an LD50 of their
own, rat and oral. Each was checked on 2026-11-11 against the Hazardous Substances Data Bank records on PubChem, and
each page links its record. Two are soft:

- **Water.** 90,000 mg/kg comes from a supplier safety data sheet that says "greater than 90 mL/kg". It's a limit, not
  a measured median.
- **Citric acid.** Rat reports run from 3,000 to 12,000 mg/kg. We use the lowest, as the foods do.

**Foods** have no LD50 of their own, so each one borrows the LD50 of something inside it. Banana borrows potassium's,
and the page works out how much banana delivers that much potassium for your weight:

```
lethal dose of the constituent  = its LD50 (mg/kg) x body weight
lethal amount of food           = that dose / how much of the constituent is in 100 g of the food
headline                        = whichever constituent needs the least food to get there
```

What a food contains comes from USDA FoodData Central, with NZ FOODfiles for some animal foods, and every figure
carries a link to where it was read. There are a few house rules:

- **Only servings you'd never manage make the list.** At least 5 kg is "absurd" and 2 to 5 kg is "large". Anything lower is
  dropped, because a food you could plausibly overdo isn't a joke any more. A human lethal-dose figure is checked too:
  bacon, ham and olives were cut because, on human data for sodium chloride, a lethal serving falls under 2 kg.
- **Water is never the headline.** It would limit nearly every moist food and make every page the same joke, and
  water poisoning is about drinking fast, not about mass inside a solid food.
- **Rat, oral, lowest credible value** is preferred. Compounds are converted to the element or ion that foods are
  measured in (potassium chloride is 52.4% potassium, and so on).
- **Stand-ins are said out loud.** Sugars borrow glucose or sucrose, and potassium and sodium borrow KCl and NaCl.
  The pages say so.

## Caveats

- LD50s come from rats and mice. People aren't rats, and "lethal dose" is not the same as "dose that makes you
  unwell".
- Food composition is mostly US data. A New Zealand product may differ, and each page shows how confident the data is.

## Under the hood

React and TypeScript on the front, a small Hono API behind it, and the whole dataset bundled in, so there's no
database. It's set up to run on Cloudflare Workers.