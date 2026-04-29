import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import cssText from "../index.css?inline";
import EmbedShell from "./EmbedShell";
import DecadeSlidersGraph from "../DecadeSlidersGraph";
import { readEmbedOptions } from "./readEmbedOptions";

const style = document.createElement("style");
style.textContent = cssText;
document.head.appendChild(style);

let container = document.getElementById("rorschach-root");
if (!container) {
  container = document.createElement("div");
  container.id = "rorschach-root";
  document.currentScript.parentNode.insertBefore(container, document.currentScript);
}

const opts = readEmbedOptions(container);

createRoot(container).render(
  <StrictMode>
    <EmbedShell
      title={opts.title ?? "Happiness Timeline (Decade Sliders)"}
      axisXLabel={opts.xAxisLabel}
      axisYLabel={opts.yAxisLabel}
      Graph={DecadeSlidersGraph}
    />
  </StrictMode>,
);
