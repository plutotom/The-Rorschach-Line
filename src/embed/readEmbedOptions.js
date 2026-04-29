/**
 * Options for script-tag and HTML embeds. Host pages can set either:
 *
 * 1) A global object before the embed script runs:
 *    <script>window.RorschachLineEmbed = { xAxisLabel: "Time", yAxisLabel: "Mood" };</script>
 *    <script src="...clinical-nodes.js"></script>
 *
 * 2) Data attributes on the mount container (#rorschach-root or your chosen root):
 *    <div id="rorschach-root" data-axis-x-label="Time" data-axis-y-label="Mood"></div>
 *
 * Aliases on the global: xLabel / yLabel (same as xAxisLabel / yAxisLabel).
 * Optional: title — overrides the embed header title when non-empty.
 */

function trimNonEmpty(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

/**
 * @param {HTMLElement | null | undefined} rootElement - Mount node (e.g. #rorschach-root)
 * @returns {{ title?: string, xAxisLabel?: string, yAxisLabel?: string }}
 */
export function readEmbedOptions(rootElement) {
  const w =
    typeof window !== "undefined" &&
    window.RorschachLineEmbed &&
    typeof window.RorschachLineEmbed === "object"
      ? window.RorschachLineEmbed
      : {};
  const d = rootElement?.dataset ?? {};

  const title =
    trimNonEmpty(w.title) ??
    trimNonEmpty(w.embedTitle) ??
    trimNonEmpty(d.embedTitle);

  const xAxisLabel =
    trimNonEmpty(w.xAxisLabel) ??
    trimNonEmpty(w.xLabel) ??
    trimNonEmpty(d.axisXLabel);

  const yAxisLabel =
    trimNonEmpty(w.yAxisLabel) ??
    trimNonEmpty(w.yLabel) ??
    trimNonEmpty(d.axisYLabel);

  return { title, xAxisLabel, yAxisLabel };
}
