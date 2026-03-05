import React, { useState } from "react";

/**
 * Minimal wrapper for embedding a single graph variant on a survey site.
 * Holds data/setData and renders one graph + optional reset. No view toggles.
 */
export default function EmbedShell({ title }) {
  const [data, setData] = useState(() => Array.from({ length: 101 }, () => 50));

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
