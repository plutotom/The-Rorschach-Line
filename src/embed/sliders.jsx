import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import EmbedShell from "./EmbedShell";
import DecadeSlidersGraph from "../DecadeSlidersGraph";
import { readEmbedOptions } from "./readEmbedOptions";

const root = document.getElementById("root");
const opts = readEmbedOptions(root);

createRoot(root).render(
  <StrictMode>
    <EmbedShell
      title={opts.title ?? "Happiness Timeline (Decade Sliders)"}
      axisXLabel={opts.xAxisLabel}
      axisYLabel={opts.yAxisLabel}
      Graph={DecadeSlidersGraph}
    />
  </StrictMode>,
);
