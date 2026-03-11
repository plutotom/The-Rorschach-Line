#!/usr/bin/env node
/**
 * Builds each embed variant as a separate single-file HTML.
 * Run after main build so dist/ exists; each run uses emptyOutDir: false.
 */

import { execSync } from "child_process";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const distEmbed = join(root, "dist", "embed");

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

for (const name of embedEntries) {
  console.log(`Building embed: ${name}...`);
  execSync("npx vite build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, EMBED: name },
  });
}
console.log("Embed builds done. See dist/embed/*.html");
console.log("Creating paste-ready fragments...");
execSync("node scripts/make-paste-fragments.js", {
  cwd: root,
  stdio: "inherit",
});
console.log("Building script-tag embeds (IIFE .js for Qualtrics)...");
for (const name of embedEntries) {
  execSync("pnpm exec vite build --config vite.config.script.js", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, EMBED: name },
  });
}
console.log("Script embeds done. See dist/embed/*.js");
if (existsSync(distEmbed)) {
  copyFileSync(
    join(root, "embed", "script-tag-test.html"),
    join(distEmbed, "script-tag-test.html"),
  );
  console.log("Test page: dist/embed/script-tag-test.html (open via pnpm preview)");
}
