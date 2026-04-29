# Happiness Timeline

React app: draw a “happiness” line over ages 0–100 (101 values). Four interaction UIs; single-file Vite builds for the main app and per-variant embeds.

## Development

Uses **pnpm**.

```bash
pnpm install
pnpm run dev      # main app (index.html)
pnpm run lint
pnpm run preview  # serve dist/ after a build
```

## Builds

| Command | What you get |
|--------|----------------|
| `pnpm run build` | Main app → `dist/index.html` (single file, via vite-plugin-singlefile) |
| `pnpm run build:embed` | Runs main build, then each embed HTML, paste fragments, and Qualtrics IIFE scripts → `dist/embed/*` |
| `EMBED=<name> pnpm run build` | One standalone embed HTML only, e.g. `EMBED=classic` → `dist/embed/<name>.html` (does not wipe `dist/` when `EMBED` is set) |

Embed names for `EMBED=`: `classic`, `nodes`, `clinical-nodes`, `sliders`.

## Embedding (short)

1. `pnpm run build:embed`
2. **Paste:** copy all of `dist/embed/<name>-paste.html` into the host HTML block (scoped wrapper). If scripts are blocked, host `dist/embed/<name>.html` and use an **iframe** instead.
3. **Script + Qualtrics:** only **`classic`**, **`clinical-nodes`**, and **`sliders`** produce `dist/embed/<name>.js` (IIFE). Mount target: `#rorschach-root` (created if missing). **`nodes`** has HTML/paste builds only—no script bundle in this repo.

Qualtrics: add Embedded Data field **`RorschachLine`**. Optional OnPageSubmit:  
`Qualtrics.SurveyEngine.setEmbeddedData('RorschachLine', JSON.stringify(window.RorschachLine.getData()));`  
Stored value: JSON array of **101** numbers (0–100). Debug: set `window.RorschachLineDebug = true` before load; console helpers include `window.RorschachLine.testPush()`.

## Stack

- React 19, Vite 7, [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- [vite-plugin-singlefile](https://github.com/nickvdyck/vite-plugin-singlefile) for self-contained HTML

---

## Reference (AI / deep context)

Use this when editing builds, embeds, or Qualtrics integration.

**Package / repo:** `package.json` name is `line-personality`; repo folder may differ.

**Entry points**

- Main app: `index.html` → `src/main.jsx` → `src/App.jsx`
- Per-embed HTML: `embed/<name>.html` → `src/embed/<name>.jsx` (via Vite `rollupOptions.input` when `EMBED` is set)
- Script-tag IIFE: `vite.config.script.js` + `src/embed/<name>-script.jsx` (only `classic`, `clinical-nodes`, `sliders`)

**Scripts**

- `scripts/build-embeds.js` — loops `EMBED` for four HTML embeds, runs `scripts/make-paste-fragments.js`, then builds the three `*-script.jsx` bundles with `vite.config.script.js`, copies `embed/script-tag-test.html` to `dist/embed/`.

**Embed variant map**

| `EMBED` / slug | UI | `*.html` + paste | `*.js` (Qualtrics) |
|----------------|----|-------------------|---------------------|
| `classic` | Classic paint | yes | yes |
| `nodes` | Control nodes | yes | no |
| `clinical-nodes` | Clinical nodes | yes | yes |
| `sliders` | Decade sliders | yes | yes |

**Data model:** `App.jsx` and graphs use `length === 101`, indices = ages 0–100, values clamped 0–100. CSV export: `src/exportCSV.js`. Paste JSON load: `App.jsx` (`parseAndApplyLineData`).

**Qualtrics bridge:** `src/embed/qualtricsBridge.js` (used from `EmbedShell.jsx`)—debounced `setEmbeddedData('RorschachLine', ...)`, tries `window` / `parent` / `top`, exposes `window.RorschachLine` (`getData`, `testPush`, etc.) on script builds.

**Host customization:** `src/embed/readEmbedOptions.js` — optional `window.RorschachLineEmbed` (e.g. `title`, `xAxisLabel`, `yAxisLabel`) or `data-*` on the mount root; see file header for exact keys.

**Styles / paste wrapper:** `scripts/make-paste-fragments.js` wraps output in class `happiness-timeline-embed`.
