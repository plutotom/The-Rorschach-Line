/**
 * Pushes data into Qualtrics Embedded Data when running inside a Qualtrics survey.
 * No-op when Qualtrics is not present (e.g. local test page).
 *
 * Debug: set window.RorschachLineDebug = true before the script runs (e.g. in Qualtrics
 * Add OnLoad) or in the browser console to log whether Qualtrics was found and when
 * setEmbeddedData is called or skipped.
 */

export const QUALTRICS_EMBEDDED_DATA_KEY = "RorschachLine";

function isDebug() {
  try {
    return (
      (typeof window !== "undefined" && window.RorschachLineDebug) ||
      (window.parent && window.parent !== window && window.parent.RorschachLineDebug) ||
      (window.top && window.top.RorschachLineDebug)
    );
  } catch (_) {
    return false;
  }
}

/** @returns {{ Q: object, which: string } | null} */
function findQualtrics() {
  if (typeof window === "undefined") return null;
  const candidates = [
    { w: window, label: "window" },
    { w: window.parent, label: "window.parent" },
    { w: window.top, label: "window.top" },
  ];
  for (const { w, label } of candidates) {
    try {
      if (w && w.Qualtrics && w.Qualtrics.SurveyEngine && typeof w.Qualtrics.SurveyEngine.setEmbeddedData === "function") {
        return { Q: w.Qualtrics, which: label };
      }
    } catch (_) {
      // cross-origin or no access
    }
  }
  return null;
}

/**
 * @param {string} key - Qualtrics Embedded Data field name (e.g. "RorschachLine")
 * @param {string} value - String value to store (e.g. JSON.stringify(data))
 * @returns {boolean} - true if Qualtrics was available and setEmbeddedData was called
 */
export function pushToQualtrics(key, value) {
  const debug = isDebug();
  try {
    const found = findQualtrics();
    if (found) {
      found.Q.SurveyEngine.setEmbeddedData(key, value);
      if (debug) {
        console.log("[RorschachLine] setEmbeddedData ok via", found.which, "key:", key, "length:", value.length);
      }
      return true;
    }
    if (debug) {
      console.warn("[RorschachLine] Qualtrics not found on window, window.parent, or window.top. setEmbeddedData not called.");
    }
  } catch (e) {
    if (debug) {
      console.error("[RorschachLine] setEmbeddedData error:", e);
    }
  }
  return false;
}
