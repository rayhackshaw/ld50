import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = process.env.PORT ?? "8787";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    // In dev the API runs separately (`npm run dev:api`); Vite forwards /api to it.
    proxy: {
      "/api": `http://127.0.0.1:${apiPort}`,
    },
  },
});
