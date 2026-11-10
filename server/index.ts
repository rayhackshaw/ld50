import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApi } from "./app.ts";
import { createStaticProvider } from "./static-provider.ts";

const port = Number(process.env.PORT ?? 8787);
const serveClient = process.argv.includes("--static");

const app = new Hono();
app.route("/", createApi(createStaticProvider()));

if (serveClient) {
  // Production: one process serves both the API and the built React app.
  // Run `npm run build` first. Paths are relative to the project root.
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`LD50 API listening on http://localhost:${info.port}${serveClient ? " (also serving ./dist)" : ""}`);
});
