import { Hono } from "hono";
import { createApi } from "../server/app.ts";
import { createStaticProvider } from "../server/static-provider.ts";

/**
 * Cloudflare Worker entry. It only ever sees `/api/*`: wrangler.jsonc sets `run_worker_first: ["/api/*"]`, so
 * everything else (the React app, fonts, the SPA fallback) is served straight from the static assets.
 *
 * The dataset is bundled into the Worker, so there are no bindings and no secrets to configure.
 */
const app = new Hono();
app.route("/", createApi(createStaticProvider()));

export default app;
