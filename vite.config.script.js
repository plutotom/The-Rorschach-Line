import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const embed = process.env.EMBED;
if (!embed) {
  throw new Error("vite.config.script.js requires EMBED=<name> (e.g. EMBED=classic)");
}

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/embed",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "src/embed", `${embed}-script.jsx`),
      output: {
        format: "iife",
        entryFileNames: `${embed}.js`,
        inlineDynamicImports: true,
      },
    },
    minify: true,
    sourcemap: false,
  },
});
