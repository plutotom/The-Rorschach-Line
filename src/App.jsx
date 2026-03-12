import React, { useState, useCallback } from "react";
import InteractiveGraph from "./InteractiveGraph";
import ControlPointsGraph from "./ControlPointsGraph";
import ClinicalNodesGraph from "./ClinicalNodesGraph";
import DecadeSlidersGraph from "./DecadeSlidersGraph";

import { exportToCSV } from "./exportCSV";
import "./index.css";

const EXPECTED_LENGTH = 101;

function parseAndApplyLineData(str, setData) {
  const trimmed = str.trim();
  if (!trimmed) {
    return { ok: false, message: "Nothing to load." };
  }
  let arr;
  try {
    arr = JSON.parse(trimmed);
  } catch {
    return { ok: false, message: "Invalid JSON." };
  }
  if (!Array.isArray(arr)) {
    return { ok: false, message: "Input must be a JSON array." };
  }
  const clamped = arr.map((v) => Math.min(100, Math.max(0, Number(v))));
  if (clamped.some((n) => Number.isNaN(n))) {
    return { ok: false, message: "Array must contain only numbers." };
  }
  let normalized;
  let message;
  if (clamped.length === EXPECTED_LENGTH) {
    normalized = clamped;
    message = "Loaded 101 values.";
  } else if (clamped.length < EXPECTED_LENGTH) {
    const pad = 50;
    normalized = [...clamped, ...Array.from({ length: EXPECTED_LENGTH - clamped.length }, () => pad)];
    message = `Pasted ${clamped.length} values; padded to ${EXPECTED_LENGTH}.`;
  } else {
    normalized = clamped.slice(0, EXPECTED_LENGTH);
    message = `Pasted ${clamped.length} values; truncated to ${EXPECTED_LENGTH}.`;
  }
  setData(normalized);
  return { ok: true, message };
}

function App() {
  const [data, setData] = useState(Array.from({ length: 101 }, () => 50));
  const [viewMode, setViewMode] = useState("classic"); // 'classic', 'nodes', 'sliders'
  const [pasteInput, setPasteInput] = useState("");
  const [pasteFeedback, setPasteFeedback] = useState(null); // { message, ok }

  const handleLoadPaste = useCallback(() => {
    const result = parseAndApplyLineData(pasteInput, setData);
    setPasteFeedback({ message: result.message, ok: result.ok });
    if (result.ok) setPasteInput("");
  }, [pasteInput]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPasteInput(text);
      setPasteFeedback(null);
    } catch {
      setPasteFeedback({ message: "Could not read clipboard.", ok: false });
    }
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Happiness Timeline</h1>
        <p>
          Chart your perceived happiness across your lifetime. Choose your
          preferred interaction method to map your personal peaks and valleys.
        </p>

        <div className="view-toggles">
          <button
            className={`toggle-btn ${viewMode === "classic" ? "active" : ""}`}
            onClick={() => setViewMode("classic")}
          >
            Classic Paint
          </button>
          <button
            className={`toggle-btn ${viewMode === "nodes" ? "active" : ""}`}
            onClick={() => setViewMode("nodes")}
          >
            Control Nodes
          </button>
          <button
            className={`toggle-btn ${viewMode === "clinical-nodes" ? "active" : ""}`}
            onClick={() => setViewMode("clinical-nodes")}
          >
            Clinical Nodes
          </button>
          <button
            className={`toggle-btn ${viewMode === "sliders" ? "active" : ""}`}
            onClick={() => setViewMode("sliders")}
          >
            Decade Sliders
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="graph-container">
          {viewMode === "classic" && (
            <InteractiveGraph data={data} setData={setData} />
          )}
          {viewMode === "nodes" && (
            <ControlPointsGraph data={data} setData={setData} />
          )}
          {viewMode === "clinical-nodes" && (
            <ClinicalNodesGraph data={data} setData={setData} />
          )}
          {viewMode === "sliders" && (
            <DecadeSlidersGraph data={data} setData={setData} />
          )}
        </div>

        <div className="controls">
          <button
            className="reset-btn"
            onClick={() => setData(Array.from({ length: 101 }, () => 50))}
          >
            Reset Graph
          </button>
          <button className="export-btn" onClick={() => exportToCSV(data)}>
            Download Data (CSV)
          </button>
        </div>

        <section className="paste-line-section" aria-label="Load pasted line data">
          <label className="paste-line-label" htmlFor="paste-line-input">
            Load pasted line
          </label>
          <textarea
            id="paste-line-input"
            className="paste-line-textarea"
            placeholder="Paste Rorschach line JSON (101 values)..."
            value={pasteInput}
            onChange={(e) => {
              setPasteInput(e.target.value);
              setPasteFeedback(null);
            }}
            rows={3}
          />
          <div className="paste-line-actions">
            <button type="button" className="reset-btn paste-line-btn" onClick={handleLoadPaste}>
              Load
            </button>
            <button type="button" className="reset-btn paste-line-btn" onClick={handlePasteFromClipboard}>
              Paste from clipboard
            </button>
          </div>
          {pasteFeedback && (
            <p className={`paste-line-message ${pasteFeedback.ok ? "paste-line-message-ok" : "paste-line-message-error"}`}>
              {pasteFeedback.message}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
