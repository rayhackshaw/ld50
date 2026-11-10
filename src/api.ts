import type {
  LookupResponse,
  NotFoundResponse,
  RandomResponse,
  Substance,
  SuggestResponse,
  Suggestion,
} from "../shared/types.ts";

export type LookupResult =
  | { kind: "found"; substance: Substance; exact: boolean }
  | { kind: "missing"; query: string; suggestions: Suggestion[] };

export async function lookup(query: string, signal?: AbortSignal): Promise<LookupResult> {
  const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`, { signal });

  if (res.status === 404) {
    const body = (await res.json()) as NotFoundResponse;
    return { kind: "missing", query: body.query, suggestions: body.suggestions };
  }
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);

  const body = (await res.json()) as LookupResponse;
  return { kind: "found", substance: body.substance, exact: body.exact };
}

export async function suggest(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) throw new Error(`Suggest failed (${res.status})`);
  return ((await res.json()) as SuggestResponse).suggestions;
}

export async function randomSuggestion(): Promise<Suggestion> {
  const res = await fetch("/api/random");
  if (!res.ok) throw new Error(`Random failed (${res.status})`);
  return ((await res.json()) as RandomResponse).suggestion;
}
