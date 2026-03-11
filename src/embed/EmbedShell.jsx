import React, { useState, useRef, useEffect } from "react";
import { pushToQualtrics, QUALTRICS_EMBEDDED_DATA_KEY } from "./qualtricsBridge";

const QUALTRICS_PUSH_DEBOUNCE_MS = 500;

/**
 * Minimal wrapper for embedding a single graph variant on a survey site.
 * Holds data/setData and renders one graph + optional reset. No view toggles.
 * When running inside Qualtrics, pushes the current line data to Embedded Data
 * (key: RorschachLine) so the survey can capture what the user drew.
 */
// eslint-disable-next-line no-unused-vars -- Graph is used as <Graph /> in JSX
export default function EmbedShell({ title, Graph }) {
  const [data, setData] = useState(() => Array.from({ length: 101 }, () => 50));
  const pushTimeoutRef = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const push = () => {
      pushToQualtrics(QUALTRICS_EMBEDDED_DATA_KEY, JSON.stringify(dataRef.current));
    };
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    pushTimeoutRef.current = setTimeout(push, QUALTRICS_PUSH_DEBOUNCE_MS);
    return () => {
      if (pushTimeoutRef.current) {
        clearTimeout(pushTimeoutRef.current);
        pushTimeoutRef.current = null;
      }
    };
  }, [data]);

  // Final push on unmount (e.g. when user clicks Next) so last state is saved
  useEffect(() => {
    return () => {
      pushToQualtrics(QUALTRICS_EMBEDDED_DATA_KEY, JSON.stringify(dataRef.current));
    };
  }, []);

  // Expose for Qualtrics Add OnPageSubmit: Qualtrics.SurveyEngine.setEmbeddedData('RorschachLine', JSON.stringify(window.RorschachLine.getData()))
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.RorschachLine = { getData: () => dataRef.current };
    }
    return () => {
      if (typeof window !== "undefined" && window.RorschachLine) {
        delete window.RorschachLine;
      }
    };
  }, []);

  return (
    <div className="app-container embed-shell">
      {title && (
        <header className="header embed-header">
          <h2 className="embed-title">{title}</h2>
        </header>
      )}
      <main className="main-content">
        <div className="graph-container">
          <Graph data={data} setData={setData} />
        </div>
        <div className="controls">
          <button
            type="button"
            className="reset-btn"
            onClick={() => setData(Array.from({ length: 101 }, () => 50))}
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
