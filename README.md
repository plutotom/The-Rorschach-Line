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
| `pnpm run build:embed` | App + all embed variants + paste-ready fragments → `dist/index.html` and `dist/embed/*.html`, `dist/embed/*-paste.html` |
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

### Embed variants

- `classic` — Classic Paint
- `nodes` — Control Nodes
- `clinical-nodes` — Clinical Nodes
- `sliders` — Decade Sliders
- `mobile-pan`, `mobile-tooltip`, `mobile-snap`, `mobile-orient`, `mobile-haptic` — mobile interaction variants

## Tech

- React 19 + Vite 7
- [vite-plugin-singlefile](https://github.com/nickvdyck/vite-plugin-singlefile) for self-contained HTML builds
