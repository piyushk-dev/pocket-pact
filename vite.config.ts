import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: "apps/web",
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("./packages/shared", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  build: { outDir: "../../dist/web", emptyOutDir: true },
});
