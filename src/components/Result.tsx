import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { EquivalentUnit, Reference, Substance } from "../../shared/types.ts";
import {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  TIER_COUNT,
  bodyWeightPercent,
  constituentRanking,
  foodGramsForDose,
  formatCount,
  formatFoodMass,
  formatLd50,
  formatMass,
  formatPercent,
  headlineConstituent,
  lethalDoseMg,
  plainLabel,
  toxicityTier,
  unitsInDose,
} from "../../shared/ld50.ts";

interface Props {
  substance: Substance;
  /** What the user typed, shown when we only matched fuzzily. */
  query: string;
  exact: boolean;
  weightKg: number;
  onWeightChange: (kg: number) => void;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ease all weight-derived amounts together, while the slider and its accessible output remain exact. */
function useAnimatedWeight(weightKg: number): number {
  const [display, setDisplay] = useState(weightKg);
  const current = useRef(weightKg);

  useEffect(() => {
    if (reducedMotion()) {
      current.current = weightKg;
      setDisplay(weightKg);
      return;
    }

    const start = current.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 260, 1);
      const eased = 1 - (1 - progress) ** 3;
      current.current = start + (weightKg - start) * eased;
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [weightKg]);

  return display;
}

/** Flags `[data-reveal]` blocks with `data-in` as they scroll into view; the CSS does the rest. */
function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const els = root.current?.querySelectorAll("[data-reveal]") ?? [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root]);
}

/** True once the element has been on screen. */
function useSeen(ref: RefObject<HTMLElement | null>): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return seen;
}

/** Counts up to `target` once `active` flips on. */
function useCountUp(target: number, active: boolean, duration = 1600): number {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      setValue(target * (1 - (1 - progress) ** 4));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

/**
 * Moves the floating emoji from its slot in the masthead to a badge under the sticky bar as the slot
 * scrolls away. Position, size and the `--p` progress are written straight to the element, so scrolling
 * never triggers a React render.
 */
function useFollower(slot: RefObject<HTMLElement | null>, node: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const s = slot.current;
      const n = node.current;
      if (!s || !n) return;

      const r = s.getBoundingClientRect();
      const bar = document.querySelector(".hero")?.getBoundingClientRect().height ?? 72;
      const size = r.width * 0.41; // the emoji's box, matching the old in-masthead size
      const dock = 30; // emoji size once docked, in px
      const edge = 16 + dock; // distance of the badge's centre from the right and the bar

      const p = Math.min(Math.max((bar + 12 - r.top) / (r.height * 0.9), 0), 1);
      const lerp = (a: number, b: number) => a + (b - a) * p;
      const x = lerp(r.left + r.width / 2, document.documentElement.clientWidth - edge);
      const y = lerp(r.top + r.height / 2, bar + edge - 4);
      const scale = lerp(1, dock / size);

      n.style.width = n.style.height = `${size}px`;
      n.style.fontSize = `${size}px`;
      n.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) scale(${scale})`;
      n.style.setProperty("--p", String(p));
      if (p > 0.98) n.setAttribute("data-docked", "");
      else n.removeAttribute("data-docked");
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    if (slot.current) ro.observe(slot.current);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [slot, node]);
}

/** Turns the mouse cursor into the emoji of whatever was looked up (drawn to a canvas, used as a CSS cursor). */
function useEmojiCursor(emoji: string) {
  useEffect(() => {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `${size * 0.78}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + 1);

    const root = document.documentElement;
    root.style.setProperty("--emoji-cursor", `url("${canvas.toDataURL("image/png")}") ${size / 2} ${size / 2}, auto`);
    return () => {
      root.style.removeProperty("--emoji-cursor");
    };
  }, [emoji]);
}

const RULER_TICKS = Array.from({ length: (MAX_WEIGHT_KG - MIN_WEIGHT_KG) / 5 + 1 }, (_, i) => MIN_WEIGHT_KG + i * 5);
const RULER_LABELS = [MIN_WEIGHT_KG, 50, 100, 150, MAX_WEIGHT_KG];
const weightPercent = (kg: number) => ((kg - MIN_WEIGHT_KG) / (MAX_WEIGHT_KG - MIN_WEIGHT_KG)) * 100;

export function Result({ substance: s, query, exact, weightKg, onWeightChange }: Props) {
  const root = useRef<HTMLElement>(null);
  const band = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const sliderId = useId();
  useReveal(root);
  useFollower(slot, follower);
  useEmojiCursor(s.emoji);

  const displayWeight = useAnimatedWeight(weightKg);
  const shownLd50 = useCountUp(s.ld50.mgPerKg, useSeen(band));
  const doseMg = lethalDoseMg(s.ld50, displayWeight);
  const tier = toxicityTier(s.ld50);
  const headline = headlineConstituent(s);
  const headlineName = headline ? plainLabel(headline.label) : "";
  const ranking = constituentRanking(s, displayWeight);
  const refs = uniqueReferences([...(headline?.references ?? []), ...(s.food?.servingReferences ?? [])]);

  // The headline answer: how much of the thing itself, plus the first everyday unit.
  const answer = headline ? formatFoodMass(foodGramsForDose(doseMg, headline)) : formatMass(doseMg);
  const leadUnit = s.equivalents[0];
  const leadCount = leadUnit ? unitsInDose(doseMg, leadUnit) : 0;
  // "pieces of dark chocolate (1 oz, 28.35 g)" → "pieces": the sentence already names the food.
  const leadLabel = (leadCount && Math.abs(leadCount - 1) < 0.05 ? leadUnit?.singular : leadUnit?.plural)
    ?.replace(/\s*\([^)]*\)\s*$/, "")
    .replace(new RegExp(`\\s+of\\s+${s.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "");
  const lead = leadLabel && leadCount >= 1 ? `${formatCount(leadCount)} ${leadLabel}` : "";

  const words = s.name.split(" ");
  const longest = Math.max(...words.map((w) => w.length));
  let charIndex = 0;

  // Bars in the constituent table sit on a log scale: the amounts span orders of magnitude.
  const grams = ranking.map((r) => r.grams).filter((g) => Number.isFinite(g) && g > 0);
  const minGrams = Math.min(...grams);
  const maxGrams = Math.max(...grams);
  const barWidth = (g: number) =>
    maxGrams > minGrams && g > 0 ? 6 + (94 * Math.log(g / minGrams)) / Math.log(maxGrams / minGrams) : 100;

  return (
    <article className="result" aria-labelledby="result-title" ref={root}>
      {/* The specimen's emoji: sits in the masthead, then shrinks into a badge that rides along as you scroll. */}
      <div
        className="follower"
        ref={follower}
        aria-hidden="true"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" })}
      >
        <span className="follower-pop">
          <span className="follower-emoji" data-hot={hot ? "" : undefined}>
            {s.emoji}
          </span>
        </span>
      </div>

      {!exact && <p className="notice">No exact match for “{query}”, so here's the closest thing we've got.</p>}

      {/* What is it? */}
      <header className="masthead">
        <p className="label kicker">Specimen file / {s.food ? "Food" : "Ingredient"}</p>
        <div className="masthead-row">
          <h1 id="result-title" style={{ "--len": Math.max(longest, 6) } as CSSProperties}>
            <span className="vh">{s.name}</span>
            <span aria-hidden="true">
              {words.map((word, w) => (
                <span key={w}>
                  {w > 0 && " "}
                  <span className="word">
                    {[...word].map((ch) => {
                      const c = charIndex++;
                      return (
                        <span key={c} className="ch" style={{ "--c": c } as CSSProperties}>
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                </span>
              ))}
            </span>
          </h1>
          {/* The slot never animates, so the floating emoji can measure it. */}
          <div
            className="specimen-slot"
            ref={slot}
            aria-hidden="true"
            onPointerEnter={() => setHot(true)}
            onPointerLeave={() => setHot(false)}
          >
            <div className="specimen">
              <svg className="ring" viewBox="0 0 200 200">
                <defs>
                  <path id="ring-path" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
                </defs>
                <text>
                  <textPath href="#ring-path" textLength="548" lengthAdjust="spacing">
                    SPECIMEN ✳ NOT A SERVING SUGGESTION ✳ LD50 ✳
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>
        <p className="sub">{s.tagline}</p>

        {/* The actual answer to the question, before anything else. */}
        <div className="verdict">
          <p className="label">The short answer</p>
          <p className="verdict-line">
            It would take about <strong>{answer}</strong> of {s.name.toLowerCase()} to kill you
            {lead && (
              <>
                , or roughly <strong>{lead}</strong>
              </>
            )}
            .
          </p>
          <p className="verdict-note">
            Assuming you weigh {Math.round(displayWeight)} kg and respond like the average lab{" "}
            {s.ld50.species.toLowerCase()}. Change the weight below.
          </p>
        </div>
      </header>

      <section className="sec" data-reveal aria-label={`About ${s.name}`}>
        <SectionHead title="The basics" />
        <div className="sec-body basics">
          <div className="prose">
            {s.overview.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="facts">
            {s.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The LD50 */}
      <section className="band" data-reveal aria-label="LD50" ref={band}>
        <header className="band-head">
          <span className="sec-no" />
          <h2 className="sec-title">The LD50</h2>
          {headline && <p className="label">Borrowed from {headlineName.toLowerCase()}</p>}
        </header>

        <p className="ld50-number" aria-label={`${formatLd50(s.ld50.mgPerKg)} milligrams per kilogram`}>
          <span aria-hidden="true">{formatLd50(shownLd50)}</span>
          <span className="unit" aria-hidden="true">
            mg / kg
          </span>
        </p>

        <div className="band-grid">
          <div>
            <p className="ld50-meta">
              {s.ld50.route} dose in {s.ld50.species.toLowerCase()}s. That's {formatPercent(bodyWeightPercent(s.ld50))}%
              of body weight{headline ? ` in ${headlineName.toLowerCase()}` : ""}.
            </p>
            {headline && (
              <p className="borrowed">
                {s.name} has no LD50 of its own, so we borrowed one from the {headlineName.toLowerCase()} inside it
                {s.ld50.compound ? (
                  <>
                    {" "}
                    (the published figure is for {s.ld50.compound.toLowerCase()}
                    {s.ld50.conversion ? `; ${s.ld50.conversion}` : ""})
                  </>
                ) : null}
                .
              </p>
            )}
          </div>

          <figure className="curve" aria-hidden="true">
            <svg viewBox="0 0 320 190">
              <path className="axis" d="M24 10 V166 H312" />
              <path className="guide" d="M24 88 H168 V166" />
              <path className="line" pathLength={1} d="M24 162 C 130 162, 206 14, 312 14" />
              <circle className="halo" cx="168" cy="88" r="5" />
              <circle className="dot" cx="168" cy="88" r="5" />
              <text x="18" y="91" textAnchor="end">
                50%
              </text>
              <text x="168" y="182" textAnchor="middle">
                LD50
              </text>
              <text x="312" y="182" textAnchor="end">
                DOSE →
              </text>
            </svg>
            <figcaption>Fig. 1: half the rats, at this dose</figcaption>
          </figure>
        </div>

        <div className="scale">
          <div className="meter" role="img" aria-label={`Toxicity: ${tier.label}`}>
            {Array.from({ length: TIER_COUNT }, (_, i) => (
              <i key={i} data-on={i + 1 === tier.level ? "" : undefined} />
            ))}
          </div>
          <div className="meter-labels">
            <span>Extremely toxic</span>
            <span>Relatively harmless</span>
          </div>
          <p className="tier">
            <strong>{headline ? `${headlineName} is ${tier.label.toLowerCase()}.` : `${tier.label}.`}</strong>{" "}
            {tier.blurb}
          </p>
          <p className="explainer">
            LD50 stands for “lethal dose, 50%”: the dose that killed half of the test animals. The smaller the number,
            the nastier the stuff.
          </p>
        </div>
      </section>

      {/* In human terms */}
      <section className="sec human" data-reveal aria-label="In human terms">
        <SectionHead title="In human terms" />
        <div className="sec-body">
          {headline ? (
            <>
              <p className="statement">
                For a {Math.round(displayWeight)} kg human, that's about <mark>{answer}</mark> of{" "}
                {s.name.toLowerCase()}.
              </p>
              <p className="food-mass">
                That's how much it takes to reach <strong>{formatMass(doseMg)}</strong> of{" "}
                {headlineName.toLowerCase()}, at {formatMass(headline.mgPer100g)} per 100 g.
              </p>
            </>
          ) : (
            <p className="statement">
              For a {Math.round(displayWeight)} kg human, that's about <mark>{formatMass(doseMg)}</mark>.
            </p>
          )}

          <div className="weight">
            <div className="weight-read">
              <label className="label" htmlFor={sliderId}>
                Your weight
              </label>
              <output htmlFor={sliderId}>
                {weightKg}
                <small>kg</small>
              </output>
            </div>
            <div className="weight-ctl">
              <input
                id={sliderId}
                type="range"
                min={MIN_WEIGHT_KG}
                max={MAX_WEIGHT_KG}
                step={1}
                value={weightKg}
                style={{ "--progress": `${weightPercent(weightKg)}%` } as CSSProperties}
                onChange={(e) => onWeightChange(Number(e.target.value))}
              />
              <div className="ruler" aria-hidden="true">
                {RULER_TICKS.map((kg) => (
                  <i
                    key={kg}
                    style={{ left: `${weightPercent(kg)}%` }}
                    data-major={kg % 50 === 0 || kg === MIN_WEIGHT_KG ? "" : undefined}
                    data-on={kg <= weightKg ? "" : undefined}
                  />
                ))}
                {RULER_LABELS.map((kg) => (
                  <span key={kg} style={{ left: `${weightPercent(kg)}%` }}>
                    {kg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="lead-in">In other words, you'd have to get through:</p>
          <div className="equivs">
            {s.equivalents.map((unit) => (
              <EquivalentCard key={unit.singular} unit={unit} count={unitsInDose(doseMg, unit)} />
            ))}
          </div>
        </div>
      </section>

      {/* Foods: every route we checked, cheapest first */}
      {s.food && ranking.length > 1 && (
        <section className="sec inside" data-reveal aria-label="What's inside">
          <SectionHead title="What else is in there" />
          <div className="sec-body">
            <p className="lead-in">
              We checked every ingredient we could find a published LD50 for. This is how much {s.name.toLowerCase()}{" "}
              each would take, for {Math.round(displayWeight)} kg of you.
            </p>
            <div className="table-wrap" role="region" aria-label="Constituents" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Ingredient</th>
                    <th scope="col" className="num">
                      Per 100 g
                    </th>
                    <th scope="col" className="num">
                      Food to reach its LD50
                    </th>
                    <td className="bar" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {ranking.map(({ constituent: c, grams: g }) => (
                    <tr key={c.key} data-headline={c.key === headline?.key ? "" : undefined}>
                      <th scope="row">{c.label}</th>
                      <td className="num">{formatMass(c.mgPer100g)}</td>
                      <td className="num">{formatFoodMass(g)}</td>
                      <td className="bar" aria-hidden="true">
                        <span style={{ width: `${barWidth(g)}%` }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="confidence" data-level={s.food.confidence}>
              <strong>Data confidence: {s.food.confidence}.</strong> {s.food.confidenceNote}
            </p>
          </div>
        </section>
      )}

      {s.funFact && (
        <section className="sec" data-reveal aria-label="Fun fact">
          <SectionHead title="Fun fact" />
          <div className="sec-body">
            <p className="funfact">{s.funFact}</p>
          </div>
        </section>
      )}

      {s.caveat && (
        <section className="sec" data-reveal data-tone="danger" aria-label="Worth knowing">
          <SectionHead title="Worth knowing" />
          <div className="sec-body">
            <p className="caveat">{s.caveat}</p>
          </div>
        </section>
      )}

      <p className="sources" data-reveal>
        Source:{" "}
        {refs.length > 0
          ? refs.map((r, i) => (
              <span key={r.url}>
                {i > 0 && "; "}
                <a href={r.url} target="_blank" rel="noreferrer noopener">
                  {r.name}
                </a>
              </span>
            ))
          : s.sources.join("; ")}
        . LD50 values come from animal studies and don't translate cleanly to people.
      </p>
    </article>
  );
}

/** Numbered by a CSS counter, so optional sections never leave a gap. */
function SectionHead({ title }: { title: string }) {
  return (
    <header className="sec-head">
      <span className="sec-no" />
      <h2 className="sec-title">{title}</h2>
    </header>
  );
}

function uniqueReferences(refs: Reference[]): Reference[] {
  return [...new Map(refs.map((r) => [r.url, r])).values()];
}

const PILE_CAP = 40;

function EquivalentCard({ unit, count }: { unit: EquivalentUnit; count: number }) {
  // Less than one of something reads better as a percentage: "21% of a 1 kg bag of salt".
  const partial = count < 1;
  const big = partial ? `${formatCount(count * 100)}%` : formatCount(count);
  const label = partial ? `of a ${unit.singular}` : Math.abs(count - 1) < 0.05 ? unit.singular : unit.plural;

  return (
    <div className="equiv">
      <p className="count">{big}</p>
      <p className="equiv-label">{label}</p>
      <Pile count={count} emoji={unit.emoji} />
      {unit.quip && <p className="quip">{unit.quip}</p>}
    </div>
  );
}

function Pile({ count, emoji }: { count: number; emoji: string }) {
  if (count < 1) {
    return (
      <div className="partial" aria-hidden="true">
        <span style={{ width: `${Math.max(count * 100, 2)}%` }} />
      </div>
    );
  }
  const total = Math.round(count);
  const shown = Math.min(total, PILE_CAP);
  const extra = total - shown;
  return (
    <div className="pile" aria-hidden="true">
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} style={{ "--n": i } as CSSProperties}>
          {emoji}
        </span>
      ))}
      {extra > 0 && <em>+{formatCount(extra)} more</em>}
    </div>
  );
}
