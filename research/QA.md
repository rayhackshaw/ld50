# Food data QA (2026-11-10)

- Files read: foods-animal.json, foods-fruit.json, foods-pantry.json, foods-treats.json, foods-vegetable.json
- Foods written: **91** (absurd: 86, large: 5)
- Dropped by this script: 3
- Waiting on a prose rewrite (not shipped yet): 0; rewritten and shipped: 69
- Flagged by the agents: 9
- Errors: 0, warnings: 0
- Water constituents skipped on purpose: 89 (see the comment in build-foods.ts)

## Errors

- none

## Warnings

- none

## Dropped

- Bacon (foods-animal.json): a human lethal-dose estimate for sodium (as nacl) (1000 mg/kg of the compound) gives only 1,162 g, under the 2000 g floor (the rat figure says 3,486 g)
- Ham (sliced, cured) (foods-animal.json): a human lethal-dose estimate for sodium (as nacl) (1000 mg/kg of the compound) gives only 1,836 g, under the 2000 g floor (the rat figure says 5,508 g)
- Olives (foods-fruit.json): a human lethal-dose estimate for sodium (1000 mg/kg of the compound) gives only 1,770 g, under the 2000 g floor (the rat figure says 5,309 g)

## Waiting on a prose rewrite

- none

## Flagged by agents

- Beef liver (cooked, braised) (foods-animal.json): Real acute and cumulative toxicity from vitamin A (preformed retinol) at ordinary serving sizes, far below anything the lab LD50 maths suggests. — USDA SR Legacy 168626 (braised beef liver, https://fdc.nal.usda.gov/food-details/168626/nutrients): retinol 9428 µg (9.43 mg) per 100 g. A single 100 g serving is about 6.3x the 1.5 mg/day vitamin A figure the NHS gives as a daily ceiling for some groups, and the NHS advises not eating liver more than about once a week (https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-a/). USDA's record for NZ-imported boiled beef liver (174728) lists 21014 µg (21.0 mg) retinol per 100 g, about 14x that figure. Lab-style lethal masses for a 70 kg person, per 100 g composition: water 10712 g (water 58.81 g per 100 g, rat oral >90 mL/kg lower bound), sodium 104566 g (79 mg per 100 g), potassium 27117 g (352 mg per 100 g), copper 58540 g (14.283 mg per 100 g; copper(II) sulfate rat oral 300 mg/kg per PubChem https://pubchem.ncbi.nlm.nih.gov/compound/24462, Cu = 63.546/159.602 = 39.8% of CuSO4, giving 119.4 mg Cu/kg), vitamin A 1908146 g (retinol mouse oral LD50 2570 mg/kg per PubChem https://pubchem.ncbi.nlm.nih.gov/compound/445354; no rat oral value found). So every lab number says 'absurd' (the smallest is water at about 10.7 kg), but that is exactly why the lab number misleads here: the real problem is vitamin A building up at serving sizes of a few hundred grams a week, not an acute LD50.
- Apple seeds (foods-fruit.json): real acute toxicity at ordinary amounts (cyanogenic compound) — Seeds contain amygdalin, which releases hydrogen cyanide when the seed is crushed and digested. Whole swallowed seeds mostly pass through; the entry on this site is flesh only, with no seeds or core.
- Cherry stones/kernels (foods-fruit.json): real acute toxicity at ordinary amounts (cyanogenic compound) — The kernel inside cherry stones contains amygdalin, the same cyanide-releasing compound as apple seeds. The cherry entry is pitted flesh only.
- Peach stones/kernels (foods-fruit.json): real acute toxicity at ordinary amounts (cyanogenic compound) — The kernel inside a peach stone contains amygdalin, the same cyanide-releasing compound as apple seeds. The peach entry is flesh only, no stone.
- Soy sauce (shoyu) (foods-treats.json): plausible: headline sodium (as salt) gives about 1,504 g, under the 2,000 g cut-off — USDA FDC 174277 (SR Legacy). Sodium (as NaCl): 5,493 mg per 100 g, rat-derived 1,180.2 mg/kg, so 1,504 g; Potassium (as KCl): 435 mg per 100 g, rat-derived 1,363.6 mg/kg, so 21,943 g; Water: 71,150 mg per 100 g, rat-derived 90,000.0 mg/kg, so 8,855 g. Salt-dominated; sodium is the limiting constituent.
- Marmite / yeast extract spread (foods-treats.json): borderline: headline sodium (as salt) gives about 2,444 g, just over the 2,000 g "large" line, and it is very salty; flagged conservatively — USDA FDC 167717 (SR Legacy, "Yeast extract spread"; a generic entry, not necessarily Marmite). Sodium (as NaCl): 3,380 mg per 100 g, rat-derived 1,180.2 mg/kg, so 2,444 g; Potassium (as KCl): 2,100 mg per 100 g, rat-derived 1,363.6 mg/kg, so 4,545 g; Water: 40,900 mg per 100 g, rat-derived 90,000.0 mg/kg, so 15,403 g. A teaspoon is 6 g.
- Honey (foods-treats.json): borderline: the largest sugar (fructose) has no credible sourced rat LD50, so the headline cannot be trusted to stay above 2,000 g — USDA FDC 169640 (SR Legacy). Sugars (total, glucose LD50 as stand-in): 82,120 mg per 100 g, rat-derived 25,800.0 mg/kg, so 2,199 g; Glucose: 35,750 mg per 100 g, rat-derived 25,800.0 mg/kg, so 5,052 g; Water: 17,100 mg per 100 g, rat-derived 90,000.0 mg/kg, so 36,842 g; Potassium (as KCl): 52 mg per 100 g, rat-derived 1,363.6 mg/kg, so 183,562 g. Fructose is 40.94 g per 100 g but has no rat oral value in PubChem or the Fisher fructose SDSs. A figure of 4,000 mg/kg appears only in small-distributor SDS copies (e.g. https://www.drm-chem.com/wp-content/uploads/2023/03/fructose-SDS.pdf), which looks implausibly low next to sucrose at 29,700 mg/kg; if it were used, honey would come to about 684 g (plausible). Flagged rather than published.
- Black pepper (foods-treats.json): plausible: piperine gives about 1,644 g (under 2,000 g), and real pepper often has more piperine than the minimum used here — Piperine 2.5% of dry weight is the USP monograph minimum (https://doi.usp.org/USPNF/USPNF_M7084_01_01.html); with USDA FDC 170931 moisture of 12.46 g per 100 g that is 2,188.5 mg per 100 g as sold. Rat intragastric LD50 514 mg/kg (adult females, PubMed 6857729). Piperine: 2,188.5 mg per 100 g, rat-derived 514.0 mg/kg, so 1,644 g; Potassium (as KCl): 1,329 mg per 100 g, rat-derived 1,363.6 mg/kg, so 7,182 g; Sodium (as NaCl): 20 mg per 100 g, rat-derived 1,180.2 mg/kg, so 413,070 g. Higher real piperine content would lower the lethal mass further.
- Spinach (raw) (foods-vegetable.json): attainability: plausible (headline lethal mass under 2,000 g on the conservative oxalate calculation) — Headline = oxalate. Raw spinach has 970 mg oxalate/100 g on average (range 320 to 1,260; Noonan & Savage 1999, Table 1). Oxalic acid has a rat oral LD50 of 375 mg/kg (Fisher SDS, listed for both the dihydrate and the anhydrous acid). Taking 375 mg/kg as the dihydrate gives 261.8 mg oxalate/kg, so lethalFoodGramsAt70kg = 1889 g. On the anhydrous basis it would be 2646 g (would be 'large'); at the top of the oxalate range it's about 1454 g, at the bottom 5727 g. Next-lowest constituent is water at 6893 g. Real-world: only about 2 to 12% of dietary oxalate is absorbed, but the same review notes that 600 g of spinach in one sitting pushed urinary oxalate above the normal range. Not a lethal-dose joke for this site: excluded per the attainability rule. Full constituent table: [{"key":"water","mgPer100g":91400,"lethalFoodGramsAt70kg":6893},{"key":"potassium","mgPer100g":558,"lethalFoodGramsAt70kg":17104},{"key":"sodium","mgPer100g":79,"lethalFoodGramsAt70kg":104575},{"key":"vitamin-c","mgPer100g":28.1,"lethalFoodGramsAt70kg":2964413},{"key":"oxalate","mgPer100g":970,"lethalFoodGramsAt70kg":1889}].

## Same compound, different LD50 across files

- none

## Fact rows dropped for framing a constituent as the limit

- Brewed coffee: "Limiting constituent: Water (caffeine would need about 33.6 kg)"

## Alias notes

- none

## Agent-reported problems

- (foods-animal.json) Composition data: USDA values were read from the official SR Legacy bulk CSV download (FoodData_Central_sr_legacy_food_csv_2018-04.zip from https://fdc.nal.usda.gov/fdc-datasets/, records dated 2019-04-01) because the FoodData Central API's DEMO_KEY was rate-limited (HTTP 429). The 'url' on each USDA source is the FDC page for the same fdcId; I did not open those pages in a browser. The numbers are the same records.
- (foods-animal.json) NZ composition data (bacon, ham, prawns, tuna in brine, green-lipped mussels) were read from the NZ Food Composition Database Concise Tables 14th edition (2021) Excel file at https://www.foodcomposition.co.nz/downloads/concise-14-edition.xlsx (the online search page is JavaScript-only). NZ figures are rounded to 2 to 3 significant figures.
- (foods-animal.json) How I chose between USDA and NZ: USDA by default. NZ was used where USDA lacks the exact form (green-lipped mussels; tuna 'in brine, drained', where USDA only has 'in water') or where the NZ product is much saltier (bacon 2,370 vs USDA 1,684 mg Na/100 g; ham 1,500 vs 814; prawns 552 vs 111) so the more cautious, smaller-mass figure is used. Where the two agreed within about 15% (cheddar, butter, feta, sausage, milk, cream, ice cream) USDA was used and the NZ figure is mentioned in notes.
- (foods-animal.json) Green-lipped mussels: no swap was needed. NZ FOODfiles has 'Mussel, green, meat, boiled' (T1026), so the entry is for the actual species. USDA only has blue mussels.
- (foods-animal.json) WATER LD50 is a lower bound. The only source I could open that gives a rat oral value is an archived ScienceLab SDS (Wayback capture): 'LD50 Rat oral > 90 ml/kg'. PubChem has no oral value for water (only mouse intraperitoneal values, 25,000 and 190,000 mg/kg), Fisher's water SDS lists none, and ECHA/Sigma pages were blocked. So every water-based figure (12 of the 19 foods) is a floor on the lethal food mass, not a measured median. ScienceLab's site is defunct; the URL is the Wayback capture.
- (foods-animal.json) Potassium chloride: the only rat oral value I could open is 2600 mg/kg (Fisher SDS). PubChem lists no rat oral value, but does list a mouse oral value of 383 mg/kg (and guinea pig 2500). The mouse figure is NOT used (a rat value exists). For transparency: if it were used, potassium would become the limiting constituent for several meats, with the smallest potassium-based masses being bacon 3,340 g, pork-loin 3,446 g, salmon 3,662 g, beef-mince 4,029 g, still 'large' or 'absurd' but headline would change.
- (foods-animal.json) Sodium chloride: PubChem gives rat oral 3000 mg/kg and Fisher's SDS gives 3550 mg/kg; the lower 3000 is the working number. PubChem also quotes 1000 mg/kg for humans in one record, which is not a rat value and is not used.
- (foods-animal.json) Bacon is only just 'large' (about 3.5 kg, via sodium) and ham only just 'absurd' (about 5.5 kg). Humans react to big salt loads at lower doses than rats do, so the lab-derived mass is generous. Both pass the spec's thresholds so they are in `foods`, but you may want to downgrade or hide bacon if you want extra caution.
- (foods-animal.json) Calcium (as calcium chloride) was considered for the cheeses and milk but NOT included: PubChem lists only rabbit oral values for CaCl2, and the SDS pages I tried (Sigma, ECHA, guessed Fisher part numbers) were blocked or not found, so there is no sourced rat oral LD50 to use. If a rat value around 1,000 to 2,000 mg/kg exists it could make cheddar's limit lower than the sodium-based one. Not computed.
- (foods-animal.json) Lactose has no rat oral LD50 that I opened, so dairy sugars are left out. Ice cream uses total sugars with the sucrose LD50 (29,700 mg/kg, PubChem) as a stand-in; sucrose and water give nearly the same answer (9.8 vs 10.3 kg), so the choice barely matters.
- (foods-animal.json) Beef liver is in `flagged`, not `foods`, for real-world vitamin A toxicity (see details). I could not open a rat oral LD50 for vitamin A: PubChem's retinol record has a mouse oral value (2,570 mg/kg) only, used in the flagged details and labelled as mouse. Copper uses PubChem's copper(II) sulfate rat oral 300 mg/kg (the record does not say if that is anhydrous or pentahydrate; I assumed anhydrous, which is the more cautious reading).
- (foods-animal.json) Form notes: beef mince is USDA 85% lean / 15% fat pan-broiled patty (NZ mince is typically 10 to 20% fat). Lamb is USDA's record for imported NZ frozen leg, roasted, lean and fat. Pork loin is roasted, lean and fat. Chicken breast is roasted, meat only (no skin). Salmon is farmed Atlantic, dry-heat cooked. Cream is USDA 'heavy whipping' (about 36% fat) as the stand-in for pouring/heavy cream.
- (foods-animal.json) Liquids/units: milk grams per cup (244 g) and per litre (1,031 g) come from USDA's 976 g per US quart (0.9464 L), a density of about 1.03 g/mL. All masses are per 100 g, not per 100 mL. The dozen-egg unit is 12 x USDA's 50 g large egg.
- (foods-animal.json) I did not include extra constituents (selenium, iron, vitamin D, cholesterol, calcium, nitrite, mercury) as limiting candidates: either no sourced rat oral LD50, or their lethal masses are many times larger than water or sodium (for example, vitamin D in salmon at 13.1 µg/100 g). Nitrite in cured meats has no USDA/NZ composition value to use.
- (foods-animal.json) Fun facts: those with figures are from composition data above or Wikipedia (chicken population, sheep/dairy history, feta PDO, kuku/kutai, curing salt, cream whipping, yoghurt bacteria, tuna). Not independently checked against primary sources: cheddar's Somerset naming, salmon astaxanthin from feed, the 'snag'/Bunnings line. Eyeball them before publishing.
- (foods-fruit.json) USDA FoodData Central API (DEMO_KEY) rate-limited after about a dozen calls, so all composition values were read from the bulk SR Legacy CSV download (April 2018 release), whose URL is the compositionSource URL; each id is the fdcId, which can be looked up at fdc.nal.usda.gov/food-details/<id>/nutrients. Individual food-details pages were not opened. SR Legacy is not updated any more, so values are the last published SR figures.
- (foods-fruit.json) Water LD50 is ">90 mL/kg" (no LD50 reached; ChemIDplus via PubChem, Food Research 21:348, 1956), a lower bound, treated as 90,000 mg/kg (matching substances.ts) at 1 mL = 1 g. HSDB lists no rat oral value for water (mouse ip only). Because it is a ">" figure, every water-limited headline is a floor, not a measured LD50, so confidence is "medium" for those foods.
- (foods-fruit.json) Fructose dropped: neither HSDB nor ChemIDplus (via PubChem) lists an oral rat or mouse LD50 for fructose (only rabbit IV 15 g/kg), and no supplier SDS could be fetched (web search was unavailable and the Wayback copies were rate-limited). Fructose-rich fruits are modelled on glucose/sucrose only; none are limited by sugar anyway.
- (foods-fruit.json) Potassium chloride rat oral 2600 mg/kg is cited from ChemIDplus via PubChem (Marhold, Czechoslovakia) and also appears in the INCHEM poison information monograph PIM 430 (Saxena, 1989), which I opened (its URL was not recorded, so it is not listed as a source link). HSDB lists mouse oral 383 mg/kg and guinea pig 2500 mg/kg; mouse values were not used because a rat value exists. If 383 mg/kg were used, potassium-limited numbers would shrink about 7x but would still be far larger than the water limits.
- (foods-fruit.json) LD50 verification status: at the final check I re-confirmed the rat oral values for NaCl (3000), sucrose (29,700), glucose (25,800), ascorbic acid (11,900) and citric acid (3000 / 6730 / 11,700 / 12,000) against PubChem HSDB data, plus KCl mouse 383 / guinea pig 2500, and KCl rat 2600 via INCHEM PIM 430. I could NOT re-confirm the water figure (rat oral ">90 mL/kg"): PubChem serves the ChemIDplus acute-toxicity table through a script-loaded endpoint that would not return on recheck, so that value rests on a read earlier in the session. PubChem HSDB for water lists only mouse intraperitoneal values. Water drives 18 of the 20 headlines, so it is the first figure to re-verify.
- (foods-fruit.json) Fun facts and botanical notes: Nix v. Hedden (1893, tomato as a vegetable for customs) and the 1959 kiwifruit naming (nickname for New Zealanders, not the bird) were checked against Wikipedia this session. The others (bromelain, bloom on blueberries, achenes, Anacardiaceae, Rosaceae, cantaloupe/Cantalupo, grenade/pomegranate, avocados ripening off the tree, nectarines, the PNAS 2019 grape plasma paper, oleuropein) are general knowledge that I could not source-check because web search was unavailable. They carry no figures except the PNAS year, so are worth a quick look before publishing.
- (foods-fruit.json) Citric acid composition is not in USDA SR Legacy, so lemon and orange use Penniston et al. 2008 (J Endourol; Table 1, ion chromatography of squeezed juice, n=2 each: lemon 48.0 g/L, orange 9.10 g/L) as a proxy for the peeled flesh, with 1 mL = 1 g. Lemon is the only fruit where this makes citric acid the headline, so its confidence note flags the extra uncertainty.
- (foods-fruit.json) Orange, lemon, pomegranate and the olives have no sucrose/glucose/fructose split in SR Legacy, so sugars are not modelled for them. At 8 to 15 g of sugar per 100 g, sugar limits would be tens of kilos regardless.
- (foods-fruit.json) Trace minerals (iron, zinc, copper, manganese, magnesium, calcium, fluoride, selenium) and carotenoids were not assessed: no rat oral LD50 was looked up for them and at fruit-level amounts they are not plausible limiters. Fat in avocado and olives is shown as a fact only; no fat LD50 is used.
- (foods-fruit.json) Olives: used USDA "Olives, pickled, canned or bottled, green" (sodium 1,556 mg/100 g). Ripe canned (black) olives in SR Legacy have 735 mg sodium/100 g, which would give roughly twice the lethal mass. Brine strength varies a lot by brand, so the headline (about 5.3 kg) is close to the 5 kg "absurd" cut-off; even a much saltier jar would still be "large" and far past any real serving.
- (foods-fruit.json) No fixed LD50 has been sourced for persin (avocado), bromelain (pineapple) or other food-specific compounds; none are modelled.
- (foods-fruit.json) Emoji: no raspberry or pomegranate emoji exists, so raspberry uses the strawberry emoji (🍓) and pomegranate uses 🔴. Unit "10 olives (27 g)" is derived as 10 x USDA 2.7 g per olive; "half cup of arils" is USDA 87 g for 0.5 cup. Orange lists USDA "fruit (2-5/8 in dia)" at 131 g as the typical orange.
- (foods-fruit.json) Pears use the generic USDA "Pears, raw" entry; apple uses "Apples, raw, with skin"; grapes use "Grapes, red or green (European type, such as Thompson seedless), raw". Pomegranate USDA data is for the edible arils including their seeds.
- (foods-fruit.json) The tomato is in the fruit category per the brief; it is the wettest of the 20 (94.5% water). All 20 land in foods; none flagged as plausible by the maths. Flagged items are the three cyanogenic seed/stone cases (apple seeds, cherry and peach stones), which are not in the food entries themselves.
- (foods-pantry.json) USDA FoodData Central's public search API (DEMO_KEY) was rate-limited, so composition data was read from the JSON behind each FDC food page (https://fdc.nal.usda.gov/portal-data/external/<id>; the human page is /food-details/<id>/nutrients). Each constituent's compositionSource has both: 'url' (the page) and 'dataUrl' (the exact JSON fetched). All entries are SR Legacy (US national averages, last updated 2019 or earlier), not NZ FOODfiles products.
- (foods-pantry.json) No supplier SDS (Sigma-Aldrich, Fisher, Merck) could be opened: those sites timed out or returned 403. LD50s therefore come from NLM ChemIDplus (read via Wayback Machine snapshots, because the live page is only a JavaScript shell) and from PubChem/HSDB (read via the PUG-View API; the 'url' fields give the normal PubChem compound page). PubChem/HSDB agrees with ChemIDplus for NaCl, MgCl2, FeSO4, ZnCl2, CuSO4 and ascorbic acid, but has no rat oral value for KCl (only mouse 383 mg/kg and guinea pig 2500 mg/kg) or for water. So the KCl and water numbers rest on ChemIDplus alone.
- (foods-pantry.json) Water has no measured rat oral median: ChemIDplus reports > 90 mL/kg, treated here as 90,000 mg/kg with 1 mL = 1 g. That is a lower bound, so the water-limited foods (rice, pasta, oats, lentils, chickpeas, baked beans, tofu, quinoa, flour) have a true lethal mass that is higher than shown. It is also an unusual endpoint (water intoxication), and eating water-bound-in-food is not like drinking it. Headline for flour is water at about 53 kg because nothing else gets lower.
- (foods-pantry.json) Compound hydrate assumptions: magnesium chloride was taken as the anhydrous salt (ChemIDplus record name says so; Mg = 25.5%), ferrous sulfate as the anhydrous salt (Fe = 36.8%), and cupric sulfate as anhydrous (Cu = 39.8%). If those LD50s were actually measured on hydrates, the element doses would be roughly 36-55% lower, which would shave the lethal food mass but not change any attainability class (Mg is the headline only for chia and sesame; iron/copper are never the headline).
- (foods-pantry.json) Magnesium sulfate (the more 'famous' magnesium salt) has no rat oral LD50 in ChemIDplus or HSDB (only mouse LDLo 5000 mg/kg and subcutaneous values), so magnesium chloride was used instead. Zinc (zinc chloride 350 mg/kg), copper, selenium (sodium selenite 7 mg/kg) and iron appear only when they ranked in a food's lowest four; none is ever the headline.
- (foods-pantry.json) Swaps and choices within the assigned list: pasta used 'cooked, enriched, without added salt'; oats used 'regular and quick, unenriched, cooked with water, without salt' (generic, not specifically rolled); cornflakes used the only USDA SR entry, 'Ralston Corn Flakes' (fortified, so iron and vitamin C are high); peanuts used 'dry-roasted, with salt'; peanut butter used 'smooth, with salt'; baked beans used 'canned, plain or vegetarian' (USDA's sauce is not specifically tomato, and the other USDA baked-bean entries contain pork or franks); flour used 'all-purpose, unenriched' as the nearest to NZ plain flour; white bread used 'commercially prepared' (US recipe, higher in salt than some NZ loaves); tofu is the raw/as-sold firm entry set with calcium sulfate.
- (foods-pantry.json) Oxalate (sesame, almonds, chia, quinoa, etc.) was not considered: FDC SR Legacy has no oxalate values and I did not find an authoritative oxalate table to open. Phosphorus, manganese and B vitamins were not given an LD50 lookup because their candidate lethal masses were well above the shown constituents. Selenium and zinc are included only where they ranked in the lowest four.
- (foods-pantry.json) Every food lands in 'absurd' (5,000 g or more); the nearest to the line is rolled oats porridge at about 7.5 kg (water). Nothing on this list failed the attainability filter and nothing on it has a documented acute-toxicity problem at ordinary amounts when prepared as specified, so 'flagged' is empty. Real, non-LD50 hazards are noted in each food's realWorldCaveat instead: cooked rice left at room temperature (Bacillus cereus), raw flour (E. coli), dry chia swelling in the oesophagus, nut/peanut/sesame/soy allergy, popcorn choking, cashew shell oil, and the sweet-vs-bitter almond distinction. You may want to flag chia and white-flour on the site if you want a stricter reading of the spec.
- (foods-pantry.json) Serving-unit gram weights come from each FDC entry's food measures (SR Legacy household measures), except '1 kg' which is a definition. I did not use brand pack sizes because I could not source them. Fun facts are general-knowledge, deliberately contain no dates or numbers, and were not URL-checked; treat them as 'worth a skim'. The numbers inside some fun facts (e.g., peanut butter fat, tofu calcium) are the USDA values from this file.
- (foods-treats.json) USDA FoodData Central API (DEMO_KEY) was rate-limited (HTTP 429) and the FDC food-page URLs are a JavaScript app that returned 404 to a plain fetch, so all composition figures come from the official SR Legacy bulk CSV. compositionSource.url is that dataset download (https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip) and `id` is the FDC id inside it.
- (foods-treats.json) PubChem sources cite the PUG-View JSON URLs actually fetched (https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/<CID>/JSON), not the human-readable compound pages, which could not be fetched.
- (foods-treats.json) Fructose has no credible rat oral LD50 (PubChem: only a rabbit IV value; Fisher fructose SDSs: no LD50). A 4,000 mg/kg figure appears only in small-distributor SDS copies and looks wrong next to sucrose (29,700 mg/kg). So fructose is not used as a constituent, and wherever USDA gives only total sugars (cola, orange juice, milk chocolate, ketchup, jam) the total is treated as glucose (25,800 mg/kg, the lowest sourced sugar value) and labelled as a stand-in.
- (foods-treats.json) Water is the headline constituent for brewed coffee, black tea, green tea, cola, orange juice and hot sauce (about 6.3 to 7.2 kg). The only rat figure for water is a ">90 mL/kg" limit value from an SDS, not a true median, and I used 90,000 mg/kg to match the site's existing water entry. They clear the 5,000 g "absurd" cut-off by rule, but that is the same order of magnitude as litres of drink, and drinking too much water too fast is dangerous in its own right, so the realWorldCaveat on each says so plainly. Consider whether the site wants to show these at all.
- (foods-treats.json) Caffeine is not the limiting constituent in any drink (e.g. coffee about 33.6 kg vs water about 6.3 kg).
- (foods-treats.json) Jam: USDA has no strawberry jam entry, so the generic "Jams and preserves" (FDC 169641) was used and the food is named just "Jam" with strawberry jam as an alias.
- (foods-treats.json) Orange juice uses the USDA entry "chilled, includes from concentrate" (FDC 169100), a mix of juice types; the raw juice entry (FDC 169098) was not used.
- (foods-treats.json) Hot sauce uses the USDA TABASCO entry (FDC 174528). Capsaicin is not in USDA, its only PubChem oral LD50 values I saw are for mouse, and acetic acid in the sauce is not listed, so only water, sodium, potassium and vitamin C are modelled.
- (foods-treats.json) Cassia cinnamon: USDA does not say whether its ground cinnamon is cassia or Ceylon. Coumarin content (about 3,000 mg/kg average, up to 10,000 mg/kg maximum) is from the BfR FAQ, not a food composition table. The 3,000 mg/kg average is the working value (about 6,837 g); at the 10,000 mg/kg maximum it is about 2,051 g, still "large". Coumarin rat LD50 is 293 mg/kg (PubChem); mouse 196 and guinea pig 202 mg/kg also seen.
- (foods-treats.json) White vinegar: USDA does not list acetic acid, so the 5% strength comes from the Fisher SDS for vinegar (the same SDS gives the 3,310 mg/kg rat LD50). PubChem rat values are higher (3,530 and 4,665 mg/kg).
- (foods-treats.json) Olive oil: USDA reports undifferentiated 18:1 monounsaturated fat; in olive oil it is mostly oleic acid but bound in triglycerides, so the free oleic acid LD50 (74,000 mg/kg) is a stand-in.
- (foods-treats.json) Black pepper moved to flagged: piperine rat LD50 (514 mg/kg, adult female rats, PubMed 6857729) with the USP monograph minimum of 2.5% piperine on a dry basis gives about 1,644 g (plausible). Real pepper often contains more piperine, which would only lower this. I did not find a measured average piperine content in an openable source (ScienceDirect and ResearchGate are blocked), so the USP minimum was used.
- (foods-treats.json) Soy sauce and honey are also flagged. Soy sauce is plausible (sodium about 1,504 g). Honey is borderline because its biggest sugar, fructose, has no credible LD50; on the glucose stand-in it is about 2,199 g, and the unreliable 4,000 mg/kg fructose figure would drop it to about 684 g. Marmite (yeast extract spread, sodium about 2,444 g) is just inside "large" but is flagged conservatively as very salty; USDA's entry is generic yeast extract spread, not necessarily Marmite.
- (foods-treats.json) No oxalate data were found in USDA for these foods, so oxalate was not considered.
- (foods-treats.json) Sodium and potassium LD50s each rest on one primary source (NaCl from PubChem 3,000 mg/kg; KCl from a NIST SDS 2,600 mg/kg), so confidence for foods headlined by them is "medium" at best.
- (foods-treats.json) meta.count is 20, the number of foods researched; 16 are in `foods` and 4 are in `flagged`.
- (foods-vegetable.json) Source access: no web search worked and the USDA FDC API DEMO_KEY was rate-limited (HTTP 429, retry after ~90 min), so composition values were read from the official FoodData Central SR Legacy bulk CSV (April 2018 release, records dated 2019-04-01) at https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip. The compositionSource.url is that download; the individual food pages at fdc.nal.usda.gov/food-details/<id>/nutrients are a single-page app that I could not verify by fetch, and 'id' is the SR Legacy FDC ID.
- (foods-vegetable.json) Potato swap: SR Legacy has no 'boiled, flesh and skin' potato. I used 170438 'Potatoes, boiled, cooked in skin, flesh, without salt' (flesh only). The skin is a small share of the weight and is eaten, but it was not blended in because I would have had to invent a ratio.
- (foods-vegetable.json) Forms: sweet potato = baked in skin, flesh (168483); pumpkin = US pumpkin, boiled (168449), not NZ crown or butternut; beetroot = boiled, drained, no salt (169146); sweetcorn = boiled kernels, no salt (169999); peas = boiled, no salt (170420); capsicum = sweet red raw (170108); cucumber = with peel (168409); zucchini = includes skin (169291). Kumara (NZ) varieties differ from the US sweet potato.
- (foods-vegetable.json) Headline is water for 18 of 19 listed foods (lethal masses 6.6 to 10.8 kg). That is a direct consequence of using water's rat LD50, which is only a limit value ('> 90 mL/kg', Fisher/Ricca SDS), not a measured median. Every lethal mass derived from water is therefore a floor, and it's essentially 'the lab limit divided by the water fraction'. PubChem lists no rat oral value for water, only mouse intraperitoneal figures (not used).
- (foods-vegetable.json) Oxalic acid: Fisher lists 375 mg/kg (rat, oral) for BOTH the dihydrate (A219500) and the anhydrous acid (AC186432500). I took the dihydrate basis (oxalate = 69.8% by mass, 261.8 mg oxalate/kg) because it is the conservative one. On the anhydrous basis the oxalate dose is higher and raw spinach would land at about 2646 g (class 'large'), so spinach sits on a classification boundary: the lead may want to override the flag. I did not find a primary rat study for oxalic acid, only the SDS figure; PubChem has a LDLo (600 mg/kg, species unstated) and a dog LDLo (1,000 mg/kg).
- (foods-vegetable.json) Beetroot oxalate: the cited number (275 mg/100 g, range 121 to 450) is for RAW red beetroot (Noonan & Savage 1999, Table 1) and was applied to the boiled form as a conservative upper bound. The OHF food list (https://ohf.org/wp-content/uploads/2024/02/Oxalate-List-022724.pdf) gives 57 mg/100 g for boiled beets but cites no primary sources, so it is not used as the working figure. With 57 the headline would revert to water.
- (foods-vegetable.json) Other oxalate sensitivity check (OHF per-100 g figures, uncited, not used as data): at the working oxalate dose none would beat water: sweet potato (baked/boiled, OHF 126 mg/100 g): 14546 g; potato (boiled, OHF 23 mg/100 g): 79686 g; kale (raw, OHF 10 mg/100 g): 183278 g; carrot (raw, OHF 24 mg/100 g): 76366 g; celery (raw, OHF 25 mg/100 g): 73311 g. Oxalate was therefore not added to those foods.
- (foods-vegetable.json) Potassium: rat oral LD50 comes from one SDS (Fisher, 2,600 mg/kg). PubChem lists guinea pig 2,500 mg/kg and mouse 383 mg/kg oral for KCl; mouse is much lower but a rat value exists, so it's recorded under otherValuesSeen and not used.
- (foods-vegetable.json) Sodium: used PubChem's rat oral 3,000 mg/kg for NaCl; the Fisher SDS says 3,550 mg/kg. Lowest credible value used.
- (foods-vegetable.json) Sugars: 'Sugars, Total' mixes glucose, fructose and sucrose; no rat oral LD50 was found for fructose, so glucose (25,800 mg/kg; sucrose is 29,700) is used as a stand-in. The values never drive a headline.
- (foods-vegetable.json) Not evaluated (no composition figure from FDC and no time to source one): potato glycoalkaloids, nitrate (spinach, beetroot, lettuce), allicin and sulphur compounds (garlic, onion), cucurbitacins (cucumber, zucchini), beta-carotene (high LD50, never limiting), calcium, magnesium and iron (all far above water). Green or sprouted potatoes were excluded by the form given, not tested.
- (foods-vegetable.json) Meta: count is 19 (foods listed); spinach is the 20th assigned food and lives in 'flagged'. Serving units come from FDC portion weights; the 1 kg units are plain arithmetic and have no URL.
- (foods-vegetable.json) Confidence is 'medium' across the board on purpose: composition is high-quality USDA data, but the headline derives from a limit-value LD50 for water.

## Headline constituents

- potassium (47): Almonds, Avocado, Banana, Beef mince, Broccoli, Cabbage, Carrot, Cashews, Cauliflower, Celery, Chicken breast, Chickpeas, Cream (pouring/heavy), Cucumber, Garlic, Iceberg lettuce, Kale, Kiwifruit, Lamb leg, Lentils, Milk, Pasta, Peanut butter (smooth), Peanuts (dry roasted, salted), Plain white flour, Pomegranate, Popcorn (air-popped), Pork loin, Potato, Potato chips, Pumpkin, Quinoa, Raspberry, Rockmelon, Rolled oats (porridge), Salmon, Strawberry, Sunflower seeds, Sweet potato (kumara), Tofu (firm), Tomato, Walnuts, Watermelon, White button mushroom, White rice, Yoghurt (plain, whole milk), Zucchini (courgette)
- sodium (13): Baked beans, Butter (salted), Cheddar cheese, Cornflakes, Egg, Feta cheese, Green-lipped mussels, Hot sauce, Mayonnaise, Pork sausage, Prawns, Tuna (canned in brine), White bread
- sugars (10): Cola, Green peas, Jam, Milk chocolate, Onion, Orange juice, Red capsicum, Sweetcorn, Tomato ketchup, Vanilla ice cream
- glucose (5): Apple, Blueberry, Cherry, Grape, Pear
- sucrose (4): Mango, Maple syrup, Peach, Pineapple
- caffeine (3): Black tea, Brewed coffee, Green tea
- magnesium (2): Chia seeds, Sesame seeds
- citric-acid (2): Lemon, Orange
- oxalate (1): Beetroot
- coumarin (1): Cassia cinnamon
- theobromine (1): Dark chocolate
- oleic-acid (1): Olive oil
- acetic-acid (1): White vinegar

## Lethal serving per food (headline, 70 kg)

| Food | Headline | mg/kg | Food for LD50 | Confidence |
| --- | --- | ---: | ---: | --- |
| Almonds | Potassium | 1363.4 | 13.0 kg | medium |
| Apple | Glucose | 25800 | 74.3 kg | medium |
| Avocado | Potassium | 1363.4 | 19.7 kg | medium |
| Baked beans | Sodium | 1180.2 | 24.1 kg | medium |
| Banana | Potassium | 1363.4 | 26.7 kg | medium |
| Beef mince | Potassium (as KCl) | 1363.4 | 27.3 kg | medium |
| Beetroot | Oxalate | 261.82 | 6.7 kg | medium |
| Black tea | Caffeine | 192 | 67.2 kg | medium |
| Blueberry | Glucose | 25800 | 37.0 kg | medium |
| Brewed coffee | Caffeine | 192 | 33.6 kg | medium |
| Broccoli | Potassium | 1363.4 | 30.2 kg | medium |
| Butter (salted) | Sodium (as NaCl) | 1180.2 | 12.8 kg | high |
| Cabbage | Potassium | 1363.4 | 56.1 kg | medium |
| Carrot | Potassium | 1363.4 | 29.8 kg | medium |
| Cashews | Potassium | 1363.4 | 14.5 kg | medium |
| Cassia cinnamon | Coumarin | 293 | 6.8 kg | low |
| Cauliflower | Potassium | 1363.4 | 31.9 kg | medium |
| Celery | Potassium | 1363.4 | 36.7 kg | medium |
| Cheddar cheese | Sodium (as NaCl) | 1180.2 | 12.7 kg | high |
| Cherry | Glucose | 25800 | 27.4 kg | medium |
| Chia seeds | Magnesium | 714.84 | 14.9 kg | medium |
| Chicken breast | Potassium (as KCl) | 1363.4 | 37.3 kg | medium |
| Chickpeas | Potassium | 1363.4 | 32.8 kg | medium |
| Cola | Sugars (total, glucose LD50 as stand-in) | 25800 | 18.2 kg | low |
| Cornflakes | Sodium | 1180.2 | 14.5 kg | medium |
| Cream (pouring/heavy) | Potassium (as KCl) | 1363.4 | 100.5 kg | medium |
| Cucumber | Potassium | 1363.4 | 64.9 kg | medium |
| Dark chocolate | Theobromine | 950 | 8.3 kg | high |
| Egg | Sodium (as NaCl) | 1180.2 | 66.6 kg | medium |
| Feta cheese | Sodium (as NaCl) | 1180.2 | 7.3 kg | high |
| Garlic | Potassium | 1363.4 | 23.8 kg | medium |
| Grape | Glucose | 25800 | 25.1 kg | medium |
| Green peas | Sugars (total) | 25800 | 30.5 kg | medium |
| Green tea | Caffeine | 192 | 112.0 kg | medium |
| Green-lipped mussels | Sodium (as NaCl) | 1180.2 | 13.9 kg | medium |
| Hot sauce | Sodium (as NaCl) | 1180.2 | 13.1 kg | medium |
| Iceberg lettuce | Potassium | 1363.4 | 67.7 kg | medium |
| Jam | Sugars (total, glucose LD50 as stand-in) | 25800 | 3.7 kg | medium |
| Kale | Potassium | 1363.4 | 27.4 kg | medium |
| Kiwifruit | Potassium | 1363.4 | 30.6 kg | medium |
| Lamb leg | Potassium (as KCl) | 1363.4 | 57.1 kg | medium |
| Lemon | Citric acid | 3000 | 4.4 kg | low |
| Lentils | Potassium | 1363.4 | 25.9 kg | medium |
| Mango | Sucrose | 29700 | 29.8 kg | medium |
| Maple syrup | Sucrose | 29700 | 3.6 kg | high |
| Mayonnaise | Sodium (as NaCl) | 1180.2 | 13.0 kg | medium |
| Milk | Potassium (as KCl) | 1363.4 | 72.3 kg | medium |
| Milk chocolate | Sugars (total, glucose LD50 as stand-in) | 25800 | 3.5 kg | medium |
| Olive oil | Oleic acid (USDA 18:1 monounsaturated fat) | 74000 | 7.3 kg | medium |
| Onion | Sugars (total) | 25800 | 42.6 kg | medium |
| Orange | Citric acid | 3000 | 23.1 kg | low |
| Orange juice | Sugars (total, glucose LD50 as stand-in) | 25800 | 21.7 kg | low |
| Pasta | Potassium | 1363.4 | 216.9 kg | medium |
| Peach | Sucrose | 29700 | 43.7 kg | medium |
| Peanut butter (smooth) | Potassium | 1363.4 | 17.1 kg | medium |
| Peanuts (dry roasted, salted) | Potassium | 1363.4 | 15.1 kg | medium |
| Pear | Glucose | 25800 | 69.5 kg | medium |
| Pineapple | Sucrose | 29700 | 34.7 kg | medium |
| Plain white flour | Potassium | 1363.4 | 89.2 kg | medium |
| Pomegranate | Potassium | 1363.4 | 40.4 kg | medium |
| Popcorn (air-popped) | Potassium | 1363.4 | 29.0 kg | medium |
| Pork loin | Potassium (as KCl) | 1363.4 | 23.4 kg | medium |
| Pork sausage | Sodium (as NaCl) | 1180.2 | 10.1 kg | medium |
| Potato | Potassium | 1363.4 | 25.2 kg | medium |
| Potato chips | Potassium (as KCl) | 1363.7 | 8.0 kg | medium |
| Prawns | Sodium (as NaCl) | 1180.2 | 15.0 kg | low |
| Pumpkin | Potassium | 1363.4 | 41.5 kg | medium |
| Quinoa | Potassium | 1363.4 | 55.5 kg | medium |
| Raspberry | Potassium | 1363.4 | 63.2 kg | medium |
| Red capsicum | Sugars (total) | 25800 | 43.0 kg | medium |
| Rockmelon | Potassium | 1363.4 | 35.7 kg | medium |
| Rolled oats (porridge) | Potassium | 1363.4 | 136.3 kg | medium |
| Salmon | Potassium (as KCl) | 1363.4 | 24.9 kg | medium |
| Sesame seeds | Magnesium | 714.84 | 14.3 kg | medium |
| Strawberry | Potassium | 1363.4 | 62.4 kg | medium |
| Sunflower seeds | Potassium | 1363.4 | 14.8 kg | medium |
| Sweet potato (kumara) | Potassium | 1363.4 | 20.1 kg | medium |
| Sweetcorn | Sugars (total) | 25800 | 39.8 kg | medium |
| Tofu (firm) | Potassium | 1363.4 | 40.3 kg | medium |
| Tomato | Potassium | 1363.4 | 40.3 kg | medium |
| Tomato ketchup | Sugars (total, glucose LD50 as stand-in) | 25800 | 8.5 kg | medium |
| Tuna (canned in brine) | Sodium (as NaCl) | 1180.2 | 26.6 kg | medium |
| Vanilla ice cream | Total sugars (as sucrose) | 29700 | 9.8 kg | medium |
| Walnuts | Potassium | 1363.4 | 21.6 kg | medium |
| Watermelon | Potassium | 1363.4 | 85.2 kg | medium |
| White bread | Sodium | 1180.2 | 16.9 kg | medium |
| White button mushroom | Potassium | 1363.4 | 30.0 kg | medium |
| White rice | Potassium | 1363.4 | 272.7 kg | medium |
| White vinegar | Acetic acid | 3310 | 4.6 kg | medium |
| Yoghurt (plain, whole milk) | Potassium (as KCl) | 1363.4 | 61.6 kg | medium |
| Zucchini (courgette) | Potassium | 1363.4 | 36.6 kg | medium |
