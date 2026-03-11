#!/usr/bin/env node
/**
 * From each dist/embed/*.html (full document), creates a paste-ready fragment:
 * - Wraps content in a scoped div so pasting into another page doesn't affect host styles
 * - Outputs to dist/embed/*-paste.html (and optionally prints copy instructions)
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distEmbed = join(__dirname, "..", "dist", "embed");
const WRAPPER_CLASS = "happiness-timeline-embed";

const embedEntries = [
  "classic",
  "nodes",
  "clinical-nodes",
  "sliders",
];

function extractFragment(fullHtml) {
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const styleContent = styleMatch ? styleMatch[1] : "";

  const rootMatch = fullHtml.match(/<div\s+id="root"\s*><\/div>/);
  const rootDiv = rootMatch ? rootMatch[0] : '<div id="root"></div>';

  // Script may be huge; match from first <script to last </script> (singlefile has one script)
  const scriptStart = fullHtml.indexOf("<script");
  const scriptEnd = fullHtml.lastIndexOf("</script>");
  const scriptTag =
    scriptStart !== -1 && scriptEnd !== -1
      ? fullHtml.slice(scriptStart, scriptEnd + "</script>".length)
      : "";

  return { styleContent, rootDiv, scriptTag };
}

function scopeCss(css) {
  return css
    .replace(/\bbody\s*\{/g, `.${WRAPPER_CLASS} {`)
    .replace(/\b#root\b/g, `.${WRAPPER_CLASS} #root`)
    .replace(/\bhtml\s*\{/g, `.${WRAPPER_CLASS} {`);
}

function makeFragment(fullHtml) {
  const { styleContent, rootDiv, scriptTag } = extractFragment(fullHtml);
  const scopedCss = scopeCss(styleContent);

  return `<!-- Copy everything below and paste into your survey site's HTML block. If the graph doesn't appear, the site may block scripts—host the full .html file and embed it in an iframe instead. -->
<div class="${WRAPPER_CLASS}">
<style>${scopedCss}</style>
${rootDiv}
${scriptTag}
</div>`;
}

for (const name of embedEntries) {
  const srcPath = join(distEmbed, `${name}.html`);
  try {
    const html = readFileSync(srcPath, "utf8");
    const fragment = makeFragment(html);
    const outPath = join(distEmbed, `${name}-paste.html`);
    writeFileSync(outPath, fragment, "utf8");
    console.log(`  ${name}-paste.html`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`  Skip ${name}: ${srcPath} not found (run build:embed first)`);
    } else {
      throw err;
    }
  }
}
console.log("Paste-ready fragments written to dist/embed/*-paste.html");
console.log("Open any *-paste.html file, copy all, and paste into your survey HTML block.");