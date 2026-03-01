import React, { useRef, useState, useCallback } from 'react';

const InteractiveGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoord, setLastCoord] = useState(null);

  const updateDataAtPointer = useCallback((clientX, clientY, isFirstTouch) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // ViewBox is -80 -20 1100 600
    // Internal coordinate mapping:
    const xSVG = ((clientX - rect.left) / rect.width) * 1100 - 80;
    const ySVG = ((clientY - rect.top) / rect.height) * 600 - 20;
    
    let age = Math.round(xSVG / 10);
    // happiness is inverted (0 is bottom, 100 is top)
    let happiness = Math.round((500 - ySVG) / 5);
    
    age = Math.max(0, Math.min(100, age));
    happiness = Math.max(0, Math.min(100, happiness));

    setData(prev => {
      const newData = [...prev];
      newData[age] = happiness;

      if (!isFirstTouch && lastCoord !== null) {
        const [lastAge, lastHappiness] = lastCoord;
        const startAge = Math.min(lastAge, age);
        const endAge = Math.max(lastAge, age);
        
        for (let i = startAge + 1; i < endAge; i++) {
          const ratio = (i - lastAge) / (age - lastAge);
          newData[i] = Math.round(lastHappiness + ratio * (happiness - lastHappiness));
        }
      }
      return newData;
    });

    setLastCoord([age, happiness]);
  }, [lastCoord, setData]);

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    updateDataAtPointer(e.clientX, e.clientY, true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    updateDataAtPointer(e.clientX, e.clientY, false);
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
    setLastCoord(null);
  };

  const pathData = data.map((happiness, age) => {
    const x = age * 10;
    const y = 500 - happiness * 5;
    return `${age === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg 
      ref={svgRef}
      className="svg-graph"
      viewBox="-80 -20 1100 600"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'crosshair'
      }}
    >
      <defs>
      </defs>

      {/* Grid Lines Y-axis (Happiness) */}
      {[0, 25, 50, 75, 100].map(h => {
        const y = 500 - h * 5;
        return (
          <g key={`h-${h}`}>
            <line 
              x1="0" y1={y} x2="1000" y2={y} 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1" 
              strokeDasharray={h === 50 || h === 0 || h === 100 ? "none" : "4 4"} 
            />
            <text x="-15" y={y + 5} fill="#94a3b8" fontSize="14" fontWeight="500" textAnchor="end">{h}</text>
          </g>
        )
      })}

      {/* Grid Lines X-axis (Age) */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(age => {
        const x = age * 10;
        return (
          <g key={`v-${age}`}>
            <line 
              x1={x} y1="0" x2={x} y2="500" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1" 
              strokeDasharray={age % 50 === 0 ? "none" : "4 4"}
            />
            <text x={x} y="525" fill="#94a3b8" fontSize="14" fontWeight="500" textAnchor="middle">{age}</text>
          </g>
        )
      })}

      {/* Labels */}
      <text x="-40" y="250" transform="rotate(-90 -40 250)" fill="#f8fafc" fontSize="16" fontWeight="600" textAnchor="middle" letterSpacing="1">HAPPINESS</text>
      <text x="500" y="565" fill="#f8fafc" fontSize="16" fontWeight="600" textAnchor="middle" letterSpacing="1">AGE</text>

      {/* Catch-all Area for events */}
      <rect x="0" y="0" width="1000" height="500" fill="transparent" />

      {/* Main Curve */}
      <path 
        d={pathData} 
        fill="none" 
        stroke="#475569" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
};

export default InteractiveGraph;
