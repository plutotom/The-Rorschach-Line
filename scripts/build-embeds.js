#!/usr/bin/env node
/**
 * Builds each embed variant as a separate single-file HTML.
 * Run after main build so dist/ exists; each run uses emptyOutDir: false.
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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
