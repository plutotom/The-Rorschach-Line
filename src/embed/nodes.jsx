import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import EmbedShell from "./EmbedShell";
import ControlPointsGraph from "../ControlPointsGraph";
import { readEmbedOptions } from "./readEmbedOptions";

const root = document.getElementById("root");
const opts = readEmbedOptions(root);

createRoot(root).render(
  <StrictMode>
    <EmbedShell
      title={opts.title ?? "Happiness Timeline (Control Nodes)"}
      axisXLabel={opts.xAxisLabel}
      axisYLabel={opts.yAxisLabel}
      Graph={ControlPointsGraph}
    />
  </StrictMode>,
);
