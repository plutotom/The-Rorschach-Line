import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

const embedEntries = [
  "classic",
  "nodes",
  "clinical-nodes",
  "sliders",
  "mobile-pan",
  "mobile-tooltip",
  "mobile-snap",
  "mobile-orient",
  "mobile-haptic",
];

// Single-file plugin only works with one input. Use EMBED=<name> to build one embed (e.g. EMBED=classic pnpm build).
export default defineConfig(({ mode }) => {
  const embed = process.env.EMBED;
  const isEmbedBuild = embed && embedEntries.includes(embed);

  return {
    plugins: [react(), viteSingleFile()],
    build: {
      emptyOutDir: !isEmbedBuild,
      rollupOptions: {
        input: isEmbedBuild
          ? resolve(__dirname, "embed", `${embed}.html`)
          : resolve(__dirname, "index.html"),
      },
    },
  };
});
