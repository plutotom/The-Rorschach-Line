import React, { useRef, useState, useCallback } from 'react';

const VerticalGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoord, setLastCoord] = useState(null);

  const updateDataAtPointer = useCallback((clientX, clientY, isFirstTouch) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // ViewBox is 0 0 800 1600
    const xSVG = ((clientX - rect.left) / rect.width) * 800;
    const ySVG = ((clientY - rect.top) / rect.height) * 1600;
    
    // Age maps to Y: 50 -> 0, 1550 -> 100
    let age = Math.round((ySVG - 50) / 15);
    
    // Happiness maps to X: 100 -> 0 (Left), 700 -> 100 (Right)
    let happiness = Math.round((xSVG - 100) / 6);
    
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
    const y = 50 + age * 15;
    const x = 100 + happiness * 6;
    return `${age === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = `${pathData} L 100 1550 L 100 50 Z`;

  return (
    <svg 
      ref={svgRef}
      className="svg-graph"
      viewBox="0 0 800 1600"
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
        cursor: 'crosshair',
        maxHeight: '1000px'
      }}
    >
      <defs>
        <linearGradient id="vHappinessGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4"/>
          <stop offset="50%" stopColor="#eab308" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.4"/>
        </linearGradient>
        <linearGradient id="vLineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Grid Lines X-axis (Happiness) */}
      {[0, 25, 50, 75, 100].map(h => {
        const x = 100 + h * 6;
        return (
          <g key={`h-${h}`}>
            <line 
              x1={x} y1="50" x2={x} y2="1550" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1" 
              strokeDasharray={h === 50 || h === 0 || h === 100 ? "none" : "4 4"} 
            />
            <text x={x} y="30" fill="#94a3b8" fontSize="18" fontWeight="500" textAnchor="middle">{h}</text>
          </g>
        )
      })}

      {/* Grid Lines Y-axis (Age) */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(age => {
        const y = 50 + age * 15;
        return (
          <g key={`v-${age}`}>
            <line 
              x1="100" y1={y} x2="700" y2={y} 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1" 
              strokeDasharray={age % 50 === 0 ? "none" : "10 10"}
            />
            <text x="70" y={y + 6} fill="#94a3b8" fontSize="18" fontWeight="500" textAnchor="end">{age}</text>
          </g>
        )
      })}

      {/* Labels */}
      <text x="400" y="20" fill="#f8fafc" fontSize="20" fontWeight="600" textAnchor="middle" letterSpacing="1">HAPPINESS</text>
      <text x="30" y="800" transform="rotate(-90 30 800)" fill="#f8fafc" fontSize="20" fontWeight="600" textAnchor="middle" letterSpacing="1">AGE</text>

      {/* Catch-all Area for events */}
      <rect x="0" y="0" width="800" height="1600" fill="transparent" />

      {/* Main Curve */}
      <path 
        d={areaPath} 
        fill="url(#vHappinessGradient)" 
        style={{ pointerEvents: 'none' }}
      />
      <path 
        d={pathData} 
        fill="none" 
        stroke="url(#vLineGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
};

export default VerticalGraph;
