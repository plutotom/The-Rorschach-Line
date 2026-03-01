import React, { useState } from 'react';
import InteractiveGraph from './InteractiveGraph';
import ControlPointsGraph from './ControlPointsGraph';
import ClinicalNodesGraph from './ClinicalNodesGraph';
import DecadeSlidersGraph from './DecadeSlidersGraph';
import MobilePanGraph from './MobilePanGraph';
import MobileTooltipGraph from './MobileTooltipGraph';
import MobileSnapGraph from './MobileSnapGraph';
import MobileOrientGraph from './MobileOrientGraph';
import MobileHapticGraph from './MobileHapticGraph';
import { exportToCSV } from './exportCSV';
import './index.css';

function App() {
  const [data, setData] = useState(Array.from({ length: 101 }, () => 50));
  const [viewMode, setViewMode] = useState('classic'); // 'classic', 'nodes', 'sliders'

  return (
    <div className="app-container">
      <header className="header">
        <h1>Happiness Timeline</h1>
        <p>Chart your perceived happiness across your lifetime. Choose your preferred interaction method to map your personal peaks and valleys.</p>
        
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${viewMode === 'classic' ? 'active' : ''}`}
            onClick={() => setViewMode('classic')}
          >
            Classic Paint
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'nodes' ? 'active' : ''}`}
            onClick={() => setViewMode('nodes')}
          >
            Control Nodes
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'clinical-nodes' ? 'active' : ''}`}
            onClick={() => setViewMode('clinical-nodes')}
          >
            Clinical Nodes
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'sliders' ? 'active' : ''}`}
            onClick={() => setViewMode('sliders')}
          >
            Decade Sliders
          </button>
        </div>
        
        <div className="view-toggles" style={{ marginTop: '12px' }}>
          <button 
            className={`toggle-btn ${viewMode === 'mobile-pan' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile-pan')}
          >
            📱 Mobile Pan
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'mobile-tooltip' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile-tooltip')}
          >
            📱 Tooltip
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'mobile-snap' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile-snap')}
          >
            📱 Target Snap
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'mobile-orient' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile-orient')}
          >
            📱 Orient Check
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'mobile-haptic' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile-haptic')}
          >
            📱 Haptic
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="graph-container">
          {viewMode === 'classic' && <InteractiveGraph data={data} setData={setData} />}
          {viewMode === 'nodes' && <ControlPointsGraph data={data} setData={setData} />}
          {viewMode === 'clinical-nodes' && <ClinicalNodesGraph data={data} setData={setData} />}
          {viewMode === 'sliders' && <DecadeSlidersGraph data={data} setData={setData} />}
          {viewMode === 'mobile-pan' && <MobilePanGraph data={data} setData={setData} />}
          {viewMode === 'mobile-tooltip' && <MobileTooltipGraph data={data} setData={setData} />}
          {viewMode === 'mobile-snap' && <MobileSnapGraph data={data} setData={setData} />}
          {viewMode === 'mobile-orient' && <MobileOrientGraph data={data} setData={setData} />}
          {viewMode === 'mobile-haptic' && <MobileHapticGraph data={data} setData={setData} />}
        </div>
        
        <div className="controls">
          <button className="reset-btn" onClick={() => setData(Array.from({length: 101}, () => 50))}>
            Reset Graph
          </button>
          <button className="export-btn" onClick={() => exportToCSV(data)}>
            Download Data (CSV)
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
