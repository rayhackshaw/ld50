import { useState } from "react";
import type { Suggestion } from "../../shared/types.ts";

const LOADING_LINES = [
  "Consulting the toxicologists…",
  "Weighing a suspiciously large number of rats…",
  "Calculating how much is too much…",
  "Asking a very patient chemist…",
];

export function Loading() {
  // Picked once per mount, so the line doesn't flicker on re-render.
  const [line] = useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);
  return (
    <section className="status" role="status">
      <p className="loading-line">{line}</p>
      <div className="loader" aria-hidden="true" />
    </section>
  );
}

interface NotFoundProps {
  query: string;
  suggestions: Suggestion[];
  onPick: (name: string) => void;
}

export function NotFound({ query, suggestions, onPick }: NotFoundProps) {
  return (
    <section className="status">
      <h2>
        No LD50 on file for <em>“{query}”.</em>
      </h2>
      <p>Either it isn't poisonous, or nobody has been brave enough to test it. Our database is small, and growing.</p>
      {suggestions.length > 0 && (
        <>
          <p className="lead-in">Try one of these instead</p>
          <div className="chips">
            {suggestions.map((s) => (
              <button key={s.slug} type="button" className="chip" onClick={() => onPick(s.name)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="status" role="alert">
      <h2>
        Something broke <em>on our end.</em>
      </h2>
      <p>Not the lethal-dose kind, thankfully. ({message})</p>
      <button type="button" className="btn" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}
