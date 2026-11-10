import type { Substance } from "../../shared/types.ts";

/**
 * Seed dataset. Hand-written, everyday things only.
 *
 * The LD50s below were checked on 2026-11-11 against the Hazardous Substances Data Bank (HSDB) records on
 * PubChem, which quote Sax's Dangerous Properties of Industrial Materials and the EU's IUCLID datasets. Each
 * entry's `references` links the record. Two are not clean measurements: water is a "greater than" figure from a
 * supplier safety data sheet, and citric acid has rat reports from 3,000 to 12,000 mg/kg (we use the lowest, as
 * the foods do).
 *
 * Why no painkillers, alcohol, etc? For those, "LD50 scaled to a human" is a
 * dangerously misleading number: real-world harm starts far below it. This is a
 * comedy site, so we keep to things where the joke is "you'd never manage it".
 *
 * `mgPerUnit` is deliberately approximate. Rough is fine; keep units relatable.
 */
export const SUBSTANCES: Substance[] = [
  {
    slug: "water",
    name: "Water",
    emoji: "💧",
    aliases: ["h2o", "drinking water", "dihydrogen monoxide", "agua"],
    tagline: "Essential for life. Also, technically, a threat to it.",
    overview: [
      "Water is a clear, odourless liquid that makes up roughly 60% of an adult human body. Everyone has strong opinions on how much of it you should drink. Almost nobody has opinions on how much is too much.",
      "Drink enough, fast enough, and the sodium in your blood gets diluted (hyponatraemia) and your cells start to swell. Marathon runners and the occasional ill-advised drinking contest have demonstrated this the hard way.",
    ],
    facts: [
      { label: "Formula", value: "H₂O" },
      { label: "Share of an adult body", value: "~60%" },
      { label: "Typical daily intake", value: "About 2 L, from all sources" },
      { label: "Where to find it", value: "Out of the tap, mostly" },
    ],
    ld50: { mgPerKg: 90_000, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "glass of water (250 ml)", plural: "glasses of water (250 ml)", mgPerUnit: 250_000, emoji: "🥛" },
      { singular: "600 ml bottle", plural: "600 ml bottles", mgPerUnit: 600_000, emoji: "🧴", quip: "Hydration influencers hate this one weird trick." },
      { singular: "full electric kettle (1.7 L)", plural: "full electric kettles (1.7 L)", mgPerUnit: 1_700_000, emoji: "🫖" },
    ],
    funFact: "You are about 60% the thing on this page. Statistically, you are mostly a very elaborate bag of the LD50 you're reading about.",
    caveat: "How fast you drink matters more than the total. Water intoxication has hit people at far lower volumes than this when they gulped it quickly.",
    sources: ["ScienceLab water safety data sheet (2015): rat, oral, > 90 mL/kg. A lower bound, not a measured median."],
    references: [{ name: "ScienceLab water safety data sheet, 2015 (rat oral LD50 > 90 mL/kg, a lower bound)", url: "https://web.archive.org/web/20150301225811/http://www.sciencelab.com/msds.php?msdsId=9927321" }],
  },
  {
    slug: "table-salt",
    name: "Table salt",
    emoji: "🧂",
    aliases: ["salt", "sodium chloride", "nacl"],
    tagline: "Makes chips taste like chips. Please don't test the upper limit.",
    overview: [
      "Table salt is sodium chloride, the crystalline reason your hot chips are acceptable. Your body genuinely needs sodium for nerves and muscles, which is why it's in everything from bread to the sea.",
      "The World Health Organization suggests adults stay under about 5 g of salt a day. The LD50 is dozens of times that, which sounds comforting until you remember how salty it would taste.",
    ],
    facts: [
      { label: "Formula", value: "NaCl" },
      { label: "Recommended max (WHO)", value: "About 5 g per day" },
      { label: "Found in", value: "Everything. Everything." },
      { label: "Taste", value: "Salty (shocking)" },
    ],
    ld50: { mgPerKg: 3_000, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "takeaway salt sachet (~1 g)", plural: "takeaway salt sachets (~1 g)", mgPerUnit: 1_000, emoji: "🧂" },
      { singular: "teaspoon (~6 g)", plural: "teaspoons (~6 g)", mgPerUnit: 6_000, emoji: "🥄" },
      { singular: "1 kg bag of salt", plural: "1 kg bags of salt", mgPerUnit: 1_000_000, emoji: "🛍️" },
    ],
    funFact: "The word “salary” is traditionally traced back to salt, though historians argue about how literal that was.",
    caveat: "Rats and humans don't handle sodium identically, and people with heart or kidney conditions have much less wiggle room.",
    sources: ["HSDB, quoting Sax's Dangerous Properties of Industrial Materials (11th ed., 2004): rat, oral, 3,000 mg/kg"],
    references: [{ name: "HSDB via PubChem: sodium chloride, rat oral LD50 3,000 mg/kg", url: "https://pubchem.ncbi.nlm.nih.gov/compound/5234#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "sugar",
    name: "Sugar",
    emoji: "🍬",
    aliases: ["sucrose", "table sugar", "white sugar"],
    tagline: "Sweet, loved, and very hard to overdose on in one sitting.",
    overview: [
      "Sugar is sucrose, a molecule made of glucose and fructose holding hands. Plants make it, humans love it, and dentists have built whole careers around the relationship.",
      "Its LD50 is roughly ten times higher than salt's. In practice, you would be defeated by nausea, a sugar crash, and your own good sense long before toxicology got a look in.",
    ],
    facts: [
      { label: "Formula", value: "C₁₂H₂₂O₁₁" },
      { label: "Made from", value: "Sugar cane or sugar beet" },
      { label: "Sweetness", value: "The reference everything else is measured against" },
      { label: "Dentist opinion", value: "Unfavourable" },
    ],
    ld50: { mgPerKg: 29_700, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "teaspoon (~4 g)", plural: "teaspoons (~4 g)", mgPerUnit: 4_000, emoji: "🥄" },
      { singular: "can of fizzy drink (~35 g sugar)", plural: "cans of fizzy drink (~35 g sugar)", mgPerUnit: 35_000, emoji: "🥤" },
      { singular: "1 kg bag of sugar", plural: "1 kg bags of sugar", mgPerUnit: 1_000_000, emoji: "🛍️" },
    ],
    funFact: "Sugar's LD50 is about ten times higher than salt's. Your dentist is still not impressed.",
    caveat: "Nobody is claiming sugar is good for you. This is only about how much it takes to be acutely lethal, which is “a ridiculous amount”.",
    sources: ["HSDB, quoting Sax's Dangerous Properties of Industrial Materials (6th ed., 1984): rat, oral, 29,700 mg/kg"],
    references: [{ name: "HSDB via PubChem: sucrose, rat oral LD50 29,700 mg/kg", url: "https://pubchem.ncbi.nlm.nih.gov/compound/5988#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "caffeine",
    name: "Caffeine",
    emoji: "☕",
    aliases: ["coffee", "espresso", "energy drink", "java", "flat white"],
    tagline: "The world's favourite psychoactive. Handle with a mug, not a scoop.",
    overview: [
      "Caffeine is a bitter alkaloid that plants make to discourage bugs, and humans use to discourage Mondays. It's the most widely consumed psychoactive substance on the planet.",
      "It blocks adenosine, the molecule that makes you feel sleepy, so you don't feel tired even when you very much are. The tiredness doesn't go anywhere. It just waits.",
    ],
    facts: [
      { label: "Formula", value: "C₈H₁₀N₄O₂" },
      { label: "Found in", value: "Coffee, tea, cacao, kola nuts, energy drinks" },
      { label: "Half-life in adults", value: "Around 5 hours" },
      { label: "Withdrawal symptom", value: "Being unbearable before 10 am" },
    ],
    ld50: { mgPerKg: 192, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "cup of brewed coffee (~95 mg)", plural: "cups of brewed coffee (~95 mg)", mgPerUnit: 95, emoji: "☕", quip: "That's a lot of trips to the café." },
      { singular: "can of energy drink (250 ml, ~80 mg)", plural: "cans of energy drink (250 ml, ~80 mg)", mgPerUnit: 80, emoji: "🥫" },
      { singular: "espresso shot (~65 mg)", plural: "espresso shots (~65 mg)", mgPerUnit: 65, emoji: "🫘" },
    ],
    funFact: "You would die of old age waiting in the queue for that many flat whites long before the caffeine got a vote.",
    caveat: "That comfort only applies to actual drinks. Regulators have warned that pure caffeine powder is a different story, and a teaspoon of it can be dangerous. Stick to the coffee.",
    sources: ["HSDB, quoting Sax's Dangerous Properties of Industrial Materials (11th ed., 2004): rat, oral, 192 mg/kg"],
    references: [{ name: "HSDB via PubChem: caffeine, rat oral LD50 192 mg/kg", url: "https://pubchem.ncbi.nlm.nih.gov/compound/2519#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "baking-soda",
    name: "Baking soda",
    emoji: "🧁",
    aliases: ["sodium bicarbonate", "bicarb", "bicarb soda", "bicarbonate of soda", "nahco3"],
    tagline: "Rises cakes, deodorises fridges, powers every school volcano.",
    overview: [
      "Baking soda (bicarb soda to a lot of us) is sodium bicarbonate, a mild base that fizzes when it meets an acid. That fizz is what puts the rise in pancakes and the eruption in the science-fair volcano.",
      "It's also an antacid, a fridge deodoriser, a toothpaste ingredient and a very optimistic stain remover. Versatile, cheap, and not something to eat by the cupful.",
    ],
    facts: [
      { label: "Formula", value: "NaHCO₃" },
      { label: "Behaves like", value: "A mild base" },
      { label: "Reacts with acid to make", value: "Carbon dioxide (the fizz)" },
      { label: "Famous for", value: "Papier-mâché volcanoes" },
    ],
    ld50: { mgPerKg: 4_220, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "teaspoon (~4.6 g)", plural: "teaspoons (~4.6 g)", mgPerUnit: 4_600, emoji: "🥄" },
      { singular: "500 g box", plural: "500 g boxes", mgPerUnit: 500_000, emoji: "📦" },
    ],
    funFact: "Combine it with vinegar and you get a bubbling mess of carbon dioxide, water and sodium acetate. That's the volcano.",
    caveat: "Large amounts upset your body's sodium and acid–base balance. The problem is basically the sodium, not the soda.",
    sources: ["HSDB, quoting Sax's Dangerous Properties of Industrial Materials (11th ed., 2004): rat, oral, 4,220 mg/kg"],
    references: [{ name: "HSDB via PubChem: sodium bicarbonate, rat oral LD50 4,220 mg/kg", url: "https://pubchem.ncbi.nlm.nih.gov/compound/516892#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "vitamin-c",
    name: "Vitamin C",
    emoji: "🍊",
    aliases: ["ascorbic acid", "ascorbate", "vit c"],
    tagline: "Keeps scurvy away. Does less for colds than your nan insists.",
    overview: [
      "Vitamin C (ascorbic acid) is an essential nutrient your body can't make itself, which is exactly why 18th-century sailors who went without fruit got scurvy and lost their teeth.",
      "It's the hero of orange juice marketing and the supplement aisle, though large studies keep finding it does less for ordinary colds than tradition insists.",
    ],
    facts: [
      { label: "Formula", value: "C₆H₈O₆" },
      { label: "Cures", value: "Scurvy (reliably)" },
      { label: "Prevents colds", value: "Underwhelmingly" },
      { label: "Found in", value: "Citrus, kiwifruit, capsicum, supplements" },
    ],
    ld50: { mgPerKg: 11_900, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "orange (~70 mg)", plural: "oranges (~70 mg)", mgPerUnit: 70, emoji: "🍊", quip: "That's an orchard. A whole orchard." },
      { singular: "1,000 mg effervescent tablet", plural: "1,000 mg effervescent tablets", mgPerUnit: 1_000, emoji: "💊" },
    ],
    funFact: "Humans, guinea pigs and some fruit bats are among the few mammals that can't make their own vitamin C. Evolution lost the recipe and nobody noticed for millions of years.",
    caveat: "Long before anything dramatic, megadoses of vitamin C reliably cause stomach upset and the runs. Your gut taps out long before the maths does.",
    sources: ["HSDB, quoting Sax's Dangerous Properties of Industrial Materials (11th ed., 2004): rat, oral, 11,900 mg/kg. OECD SIDS lists > 5,000 mg/kg."],
    references: [{ name: "HSDB via PubChem: L-ascorbic acid, rat oral LD50 11,900 mg/kg (OECD SIDS lists > 5,000 mg/kg)", url: "https://pubchem.ncbi.nlm.nih.gov/compound/54670067#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "msg",
    name: "MSG",
    emoji: "🍜",
    aliases: ["monosodium glutamate", "ajinomoto", "umami", "e621", "vetsin"],
    tagline: "Unfairly cancelled since 1968. Tastes like “more”.",
    overview: [
      "MSG is monosodium glutamate, the sodium salt of glutamate, the amino acid responsible for umami, the savoury “more-ishness” in soy sauce, ramen broth and a good parmesan.",
      "Its reputation took a beating from a 1968 letter about “Chinese restaurant syndrome”. Controlled studies since haven't been able to reliably reproduce it, and food regulators generally consider it safe in normal amounts.",
    ],
    facts: [
      { label: "Formula", value: "C₅H₈NNaO₄" },
      { label: "Flavour", value: "Umami (savoury)" },
      { label: "Discovered", value: "Japan, 1908" },
      { label: "Also occurs naturally in", value: "Tomatoes, parmesan, breast milk" },
    ],
    ld50: { mgPerKg: 15_800, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "teaspoon (~5 g)", plural: "teaspoons (~5 g)", mgPerUnit: 5_000, emoji: "🥄" },
      { singular: "500 g packet", plural: "500 g packets", mgPerUnit: 500_000, emoji: "📦" },
    ],
    funFact: "Glutamate, MSG's active ingredient, is naturally abundant in tomatoes and parmesan. Your pizza has been “loaded with MSG” all along.",
    caveat: "Published figures for MSG vary by study, but all of them are comfortably in “you'd regret the soup long before it mattered” territory.",
    sources: ["HSDB, quoting the EU IUCLID dataset: rat, oral, 15,800 mg/kg (female), 17,300 mg/kg (male)"],
    references: [{ name: "HSDB via PubChem: monosodium glutamate, rat oral LD50 15,800 mg/kg (female; 17,300 in males)", url: "https://pubchem.ncbi.nlm.nih.gov/compound/23689119#section=Non-Human-Toxicity-Values" }],
  },
  {
    slug: "citric-acid",
    name: "Citric acid",
    emoji: "🍋",
    aliases: ["lemon", "lemon juice", "sour", "sour lollies", "e330"],
    tagline: "The reason sour lollies hurt your tongue and you do it anyway.",
    overview: [
      "Citric acid is the tart stuff in lemons, limes and oranges. It's also manufactured on an industrial scale for fizzy drinks, cleaning products and the sour coating on lollies.",
      "Your body makes and uses citrate constantly as part of how cells produce energy (the Krebs cycle, which you definitely remember from school). It just doesn't expect to receive it by the bucket.",
    ],
    facts: [
      { label: "Formula", value: "C₆H₈O₇" },
      { label: "Taste", value: "Sour (the good kind)" },
      { label: "Found in", value: "Lemons, limes, sour lollies, descaler" },
      { label: "Role in your cells", value: "Part of the Krebs cycle" },
    ],
    ld50: { mgPerKg: 3_000, species: "Rat", route: "Oral" },
    equivalents: [
      { singular: "lemon's worth of juice (~2 g)", plural: "lemons' worth of juice (~2 g)", mgPerUnit: 2_000, emoji: "🍋" },
      { singular: "teaspoon of powder (~5 g)", plural: "teaspoons of powder (~5 g)", mgPerUnit: 5_000, emoji: "🥄" },
    ],
    funFact: "The sandpaper feeling on your tongue after sour lollies is the acid coating (usually citric and malic acid) working very hard on you.",
    caveat: "Citric acid is far more irritating than lethal. Well before the LD50, your mouth and stomach lodge formal complaints.",
    sources: ["HSDB, quoting the EU IUCLID dataset: rat, oral, 3,000 mg/kg. The same record lists 11,700 and 12,000 from separate experiments, and HSDB also lists 6,730."],
    references: [{ name: "HSDB via PubChem: citric acid, rat oral LD50 3,000 mg/kg (lowest of 3,000 to 12,000 reported)", url: "https://pubchem.ncbi.nlm.nih.gov/compound/311#section=Non-Human-Toxicity-Values" }],
  },
];
