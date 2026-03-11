import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import cssText from "../index.css?inline";
import EmbedShell from "./EmbedShell";
import MobileOrientGraph from "../MobileOrientGraph";

const style = document.createElement("style");
style.textContent = cssText;
document.head.appendChild(style);

let container = document.getElementById("rorschach-root");
if (!container) {
  container = document.createElement("div");
  container.id = "rorschach-root";
  document.currentScript.parentNode.insertBefore(container, document.currentScript);
}

createRoot(container).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Orient Check)" Graph={MobileOrientGraph} />
  </StrictMode>,
);
