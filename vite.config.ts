import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Expose the package version to the app (used in session export envelopes).
const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./package.json", import.meta.url)),
    "utf-8",
  ),
) as { version: string };

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production build is served from the /coaching-app4/ subfolder; dev stays at root.
  base: command === "build" ? "/coaching-app4/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // `@/…` → `src/…` (matches the tsconfig paths and shadcn aliases).
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
