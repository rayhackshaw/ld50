import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { Suggestion } from "../../shared/types.ts";
import { suggest } from "../api.ts";

interface Props {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: (query: string) => void;
  onSurprise: () => void;
  busy: boolean;
}

export function SearchBar({ text, onTextChange, onSubmit, onSurprise, busy }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<number | undefined>(undefined);
  const inflight = useRef<AbortController | null>(null);
  const id = useId();
  const listId = `${id}-list`;

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      inflight.current?.abort();
    },
    [],
  );

  function cancelPending() {
    window.clearTimeout(timer.current);
    inflight.current?.abort();
  }

  function handleChange(value: string) {
    onTextChange(value);
    setActive(-1);
    cancelPending();

    const q = value.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timer.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      inflight.current = ctrl;
      try {
        const next = await suggest(q, ctrl.signal);
        setSuggestions(next);
        setOpen(next.length > 0);
      } catch {
        // Aborted or offline. Suggestions are a nicety, so fail quietly.
      }
    }, 150);
  }

  function commit(query: string) {
    cancelPending();
    setOpen(false);
    setActive(-1);
    onSubmit(query);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const picked = open && active >= 0 ? suggestions[active] : undefined;
    commit(picked ? picked.name : text);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="search">
      <div className="field">
        <form role="search" onSubmit={handleSubmit}>
          <input
            id={`${id}-input`}
            type="text"
            aria-label="What are you about to consume?"
            value={text}
            placeholder="What are you about to eat?"
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setOpen(false)}
          />
          <button type="submit" className="go" aria-label="Look it up" disabled={busy || !text.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12h16M13 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        {open && (
          <ul id={listId} role="listbox" className="suggestions">
            {suggestions.map((s, i) => (
              <li
                key={s.slug}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown only keeps focus in the input (no blur, so the list stays open)...
                onMouseDown={(e) => e.preventDefault()}
                // ...and the selection itself is committed on click.
                onClick={() => commit(s.name)}
                onMouseEnter={() => setActive(i)}
              >
                <span aria-hidden="true">{s.emoji}</span> {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="surprise" onClick={onSurprise} disabled={busy} aria-label="Surprise me">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <g fill="currentColor" stroke="none">
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="16" cy="8" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="8" cy="16" r="1.4" />
            <circle cx="16" cy="16" r="1.4" />
          </g>
        </svg>
        <span className="surprise-label">Surprise me</span>
      </button>
    </div>
  );
}
