import { useEffect, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import type { Substance, Suggestion } from "../shared/types.ts";
import { DEFAULT_WEIGHT_KG, MAX_WEIGHT_KG, MIN_WEIGHT_KG } from "../shared/ld50.ts";
import { lookup, randomSuggestion } from "./api.ts";
import { SearchBar } from "./components/SearchBar.tsx";
import { Result } from "./components/Result.tsx";
import { ErrorState, Loading, NotFound } from "./components/Status.tsx";

type View =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; substance: Substance; exact: boolean }
  | { status: "missing"; suggestions: Suggestion[] }
  | { status: "error"; message: string };

const EXAMPLES = ["Banana", "Coffee", "Cheddar", "Salt"];
const TICKER = ["Banana", "Cheddar", "Coffee", "Dark chocolate", "Potato", "Table salt", "Cola", "Jam", "Chickpeas", "Water"];
const WEIGHT_KEY = "ld50:weightKg";

/** Feeds the cursor position to the background glow (CSS reads --mx / --my). */
function trackPointer(e: PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--mx", `${e.clientX}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY}px`);
}

/** The committed search lives in the URL (`/?q=caffeine`), so results are shareable and back/forward work. */
function readQuery(): string {
  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
}

function loadWeight(): number {
  try {
    const n = Number(window.localStorage.getItem(WEIGHT_KEY));
    if (Number.isFinite(n) && n >= MIN_WEIGHT_KG && n <= MAX_WEIGHT_KG) return n;
  } catch {
    // localStorage can be blocked; fall through to the default.
  }
  return DEFAULT_WEIGHT_KG;
}

export default function App() {
  const [query, setQuery] = useState(readQuery); // the committed search
  const [text, setText] = useState(readQuery); // what's in the box right now
  const [view, setView] = useState<View>({ status: query ? "loading" : "idle" });
  const [weightKg, setWeightKg] = useState(loadWeight);
  const [attempt, setAttempt] = useState(0); // bump to re-run the same query

  // Fetch whenever the committed query changes.
  useEffect(() => {
    if (!query) {
      setView({ status: "idle" });
      return;
    }
    const ctrl = new AbortController();
    setView({ status: "loading" });
    lookup(query, ctrl.signal)
      .then((res) => {
        setView(
          res.kind === "found"
            ? { status: "found", substance: res.substance, exact: res.exact }
            : { status: "missing", suggestions: res.suggestions },
        );
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setView({ status: "error", message: err instanceof Error ? err.message : "unknown error" });
      });
    return () => ctrl.abort();
  }, [query, attempt]);

  // Back/forward buttons.
  useEffect(() => {
    const onPop = () => {
      const q = readQuery();
      setQuery(q);
      setText(q);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Tab title.
  useEffect(() => {
    document.title =
      view.status === "found" ? `${view.substance.name} LD50: How much is too much?` : "LD50: How much is too much?";
  }, [view]);

  function submit(raw: string) {
    const q = raw.trim();
    if (!q) return;
    if (q !== query) window.history.pushState(null, "", `/?q=${encodeURIComponent(q)}`);
    setText(q);
    setQuery(q);
    setAttempt((n) => n + 1);
  }

  async function surprise() {
    try {
      submit((await randomSuggestion()).name);
    } catch (err) {
      setView({ status: "error", message: err instanceof Error ? err.message : "unknown error" });
    }
  }

  function goHome(e: MouseEvent) {
    e.preventDefault();
    if (query) window.history.pushState(null, "", "/");
    setQuery("");
    setText("");
  }

  function changeWeight(kg: number) {
    setWeightKg(kg);
    try {
      window.localStorage.setItem(WEIGHT_KEY, String(kg));
    } catch {
      // Not persisting is fine.
    }
  }

  const mode = view.status === "idle" ? "landing" : "results";

  return (
    <div className="app" data-mode={mode} onPointerMove={trackPointer}>
      <header className="hero">
        <p className="meta left" aria-hidden="true">
          Vol. 01 <b>/</b> The almanac of improbable overdoses
        </p>
        <p className="meta right" aria-hidden="true">
          Aotearoa NZ <b>/</b> MMXXVI
        </p>

        <a className="logo" href="/" onClick={goHome} aria-label="LD50 home">
          LD<span>50</span>
        </a>
        <p className="tagline">How much is too much?</p>

        <SearchBar
          text={text}
          onTextChange={setText}
          onSubmit={submit}
          onSurprise={surprise}
          busy={view.status === "loading"}
        />

        <p className="examples">
          Try{" "}
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => submit(ex)}>
              {ex}
            </button>
          ))}
        </p>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy}>
                {TICKER.map((word) => (
                  <span key={word}>
                    {word}
                    <i>✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="content">
        {view.status === "loading" && <Loading />}
        {view.status === "found" && (
          // Keyed so the entrance animation replays for every new result.
          <Result
            key={view.substance.slug}
            substance={view.substance}
            exact={view.exact}
            query={query}
            weightKg={weightKg}
            onWeightChange={changeWeight}
          />
        )}
        {view.status === "missing" && <NotFound query={query} suggestions={view.suggestions} onPick={submit} />}
        {view.status === "error" && <ErrorState message={view.message} onRetry={() => setAttempt((n) => n + 1)} />}
      </main>

      <footer className="footer">
        <p>
          For entertainment and idle curiosity only. Not medical or safety advice, and please don't try any of this at
          home.
        </p>
        <p>
          Swallowed something you shouldn't have? In New Zealand call the National Poisons Centre on{" "}
          <strong>0800 764 766</strong> (or 111 in an emergency).
        </p>
      </footer>
    </div>
  );
}
