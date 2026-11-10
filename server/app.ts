import { Hono } from "hono";
import type { LookupResponse, NotFoundResponse, RandomResponse, SuggestResponse } from "../shared/types.ts";
import type { SubstanceProvider } from "./provider.ts";

const MAX_QUERY_LENGTH = 100;

function cleanQuery(raw: string | undefined): string {
  return (raw ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

/**
 * The JSON API. Pure Hono with no Node-specific code, so this same app can be
 * served by Node (server/index.ts) or dropped into a Cloudflare Worker later.
 */
export function createApi(provider: SubstanceProvider) {
  const api = new Hono();

  api.get("/api/health", (c) => c.json({ ok: true }));

  // Autocomplete as you type.
  api.get("/api/suggest", async (c) => {
    const q = cleanQuery(c.req.query("q"));
    const suggestions = q ? await provider.suggest(q) : [];
    return c.json<SuggestResponse>({ suggestions });
  });

  // The main event: "what's the LD50 of <q>?"
  api.get("/api/lookup", async (c) => {
    const q = cleanQuery(c.req.query("q"));
    if (!q) return c.json({ error: "missing_query" }, 400);

    const hit = await provider.lookup(q);
    if (!hit) {
      const suggestions = await provider.popular(5);
      return c.json<NotFoundResponse>({ error: "not_found", query: q, suggestions }, 404);
    }
    return c.json<LookupResponse>(hit);
  });

  api.get("/api/substances/:slug", async (c) => {
    const substance = await provider.getBySlug(c.req.param("slug"));
    if (!substance) return c.json({ error: "not_found" }, 404);
    return c.json({ substance });
  });

  // "Surprise me"
  api.get("/api/random", async (c) => {
    return c.json<RandomResponse>({ suggestion: await provider.random() });
  });

  // Unknown /api/* paths get JSON, not the SPA shell.
  api.all("/api/*", (c) => c.json({ error: "not_found" }, 404));

  api.onError((err, c) => {
    console.error(err);
    return c.json({ error: "internal_error" }, 500);
  });

  return api;
}
