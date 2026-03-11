/**
 * Pushes data into Qualtrics Embedded Data when running inside a Qualtrics survey.
 * No-op when Qualtrics is not present (e.g. local test page).
 */

export const QUALTRICS_EMBEDDED_DATA_KEY = "RorschachLine";

/**
 * @param {string} key - Qualtrics Embedded Data field name (e.g. "RorschachLine")
 * @param {string} value - String value to store (e.g. JSON.stringify(data))
 * @returns {boolean} - true if Qualtrics was available and setEmbeddedData was called
 */
export function pushToQualtrics(key, value) {
  try {
    const Q = typeof window !== "undefined" && window.Qualtrics;
    const setEmbeddedData =
      Q && Q.SurveyEngine && typeof Q.SurveyEngine.setEmbeddedData === "function";
    if (setEmbeddedData) {
      Q.SurveyEngine.setEmbeddedData(key, value);
      return true;
    }
  } catch (_) {
    // Qualtrics not loaded or different context (e.g. iframe)
  }
  return false;
}
