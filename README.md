# Happiness Timeline

Chart your perceived happiness across your lifetime. Choose your preferred interaction method to map your personal peaks and valleys.

## Development

```bash
pnpm install
pnpm run dev
```

## Build

| Command | Output |
|--------|--------|
| `pnpm run build` | Single-file app → `dist/index.html` |
| `pnpm run build:embed` | App + all embed variants + paste-ready fragments + script-tag .js → `dist/index.html`, `dist/embed/*.html`, `dist/embed/*-paste.html`, `dist/embed/*.js` |
| `EMBED=<name> pnpm run build` | One embed only (e.g. `EMBED=sliders`) → `dist/embed/<name>.html` |

## Embedding on a survey site

Each view (Classic, Control Nodes, Clinical Nodes, Decade Sliders, and the mobile variants) can be exported as **standalone HTML** for embedding.

1. **Build embeds:**  
   `pnpm run build:embed`

2. **Copy-paste into an HTML block:**  
   Open any `dist/embed/<variant>-paste.html`, select all, copy, and paste into your survey’s HTML/custom content block. The fragment is scoped so it won’t affect the host page.  
   If the graph doesn’t appear, the site may be blocking scripts; host the full `.html` file and embed it in an iframe instead.

3. **Iframe (hosted file):**  
   Use the full-page files (e.g. `dist/embed/classic.html`) as the `src` of an iframe once they’re hosted.

4. **Script tag (e.g. Qualtrics):**  
   When the host blocks iframes, paste a placeholder div and the script URL. The script injects styles and mounts the graph into `#rorschach-root` (or creates it before the script). Host the `.js` files (e.g. from `dist/embed/`) and use:
   ```html
   <div id="rorschach-root"></div>
   <script src="https://your-host/embed/classic.js"></script>
   ```
   Replace `classic` with any variant name (`nodes`, `sliders`, etc.). Optional: omit the div and the script will create the container.

   **Capturing data in Qualtrics:**  
   The embed automatically writes the drawn line into Qualtrics Embedded Data when it detects the Qualtrics survey environment. To capture it:
   1. In **Survey flow**, add an **Embedded Data** element and set its field name to **`RorschachLine`** (no spaces). You can place it at the start of the block or before the question that contains the embed.
   2. Add your question (e.g. **Text / Graphic** or **Descriptive Text**) and paste the HTML above into the question’s HTML or rich-content area.
   3. As the respondent draws, the graph pushes the current data (debounced). When they click **Next**, the latest value is also pushed so Qualtrics records it. The stored value is a JSON string: an array of 101 numbers (happiness 0–100 for ages 0–100), e.g. `[50,50,52,...]`.
   4. **Optional (if data is missing):** In the question’s **Add OnPageSubmit** JavaScript, add:  
      `Qualtrics.SurveyEngine.setEmbeddedData('RorschachLine', JSON.stringify(window.RorschachLine.getData()));`  
      so the value is set right before the page submits.

### Embed variants

- `classic` — Classic Paint
- `nodes` — Control Nodes
- `clinical-nodes` — Clinical Nodes
- `sliders` — Decade Sliders
- `mobile-pan`, `mobile-tooltip`, `mobile-snap`, `mobile-orient`, `mobile-haptic` — mobile interaction variants

## Tech

- React 19 + Vite 7
- [vite-plugin-singlefile](https://github.com/nickvdyck/vite-plugin-singlefile) for self-contained HTML builds
