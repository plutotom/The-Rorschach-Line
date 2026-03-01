import React, { useRef, useState, useCallback } from 'react';

const RadialGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoord, setLastCoord] = useState(null);

  const cx = 500;
  const cy = 500;
  const minR = 150;
  const maxR = 450;
  const rRange = maxR - minR; // 300

  const updateDataAtPointer = useCallback((clientX, clientY, isFirstTouch) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // ViewBox is 0 0 1000 1000
    const xSVG = ((clientX - rect.left) / rect.width) * 1000;
    const ySVG = ((clientY - rect.top) / rect.height) * 1000;
    
    const dx = xSVG - cx;
    const dy = ySVG - cy;
    
    // Angle in radians (-PI to PI) -> degrees
    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Offset so Top (negative Y) is 0 degrees and goes clockwise
    angleDeg += 90;
    if (angleDeg < 0) {
      angleDeg += 360;
    }
    
    let age = Math.round((angleDeg / 360) * 100);
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    let happiness = Math.round(((distance - minR) / rRange) * 100);
    
    age = Math.max(0, Math.min(100, age));
    happiness = Math.max(0, Math.min(100, happiness));

    setData(prev => {
      const newData = [...prev];
      newData[age] = happiness;

      if (!isFirstTouch && lastCoord !== null) {
        const [lastAge, lastHappiness] = lastCoord;
        
        // Prevent drawing interpolations across the 100 -> 0 gap
        if (Math.abs(lastAge - age) < 50) {
          const startAge = Math.min(lastAge, age);
          const endAge = Math.max(lastAge, age);
          
          for (let i = startAge + 1; i < endAge; i++) {
            const ratio = (i - lastAge) / (age - lastAge);
            newData[i] = Math.round(lastHappiness + ratio * (happiness - lastHappiness));
          }
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

  const getCoordinates = (age, happiness) => {
    const angle = (age / 100) * 2 * Math.PI - Math.PI / 2;
    const radius = minR + (happiness / 100) * rRange;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    };
  };

  const pathData = data.map((happiness, age) => {
    const {x, y} = getCoordinates(age, happiness);
    return `${age === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Close the area path by drawing an inner circle backwards
  let areaPath = `${pathData} L ${getCoordinates(100, 0).x} ${getCoordinates(100, 0).y}`;
  for (let age = 100; age >= 0; age--) {
    const {x, y} = getCoordinates(age, 0); // 0 happiness radius
    areaPath += ` L ${x} ${y}`;
  }
  areaPath += ' Z';

  return (
    <svg 
      ref={svgRef}
      className="svg-graph"
      viewBox="0 0 1000 1000"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '800px',
        display: 'block',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'crosshair',
        margin: '0 auto'
      }}
    >
      <defs>
        <radialGradient id="rHappinessGradient" cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor="#f43f5e" stopOpacity="0.5"/>
          <stop offset="60%" stopColor="#eab308" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.5"/>
        </radialGradient>
      </defs>

      {/* Grid Circles (Happiness) */}
      {[0, 25, 50, 75, 100].map(h => {
        const r = minR + (h / 100) * rRange;
        return (
          <g key={`r-${h}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray={h === 0 || h === 50 || h === 100 ? "none" : "8 8"} />
            <text x={cx} y={cy - r - 8} fill="#94a3b8" fontSize="16" fontWeight="500" textAnchor="middle">{h}</text>
          </g>
        )
      })}

      {/* Radial Lines (Age Tracks) */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(age => {
        const p1 = getCoordinates(age, 0);
        const p2 = getCoordinates(age, 100);
        const labelPos = getCoordinates(age, 108); // pushed out a bit for label
        return (
          <g key={`a-${age}`}>
            <line 
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="2" 
            />
            {age !== 0 && ( /* Skip 0 so it doesn't overlap 100 at the top */
              <text x={labelPos.x} y={labelPos.y + 6} fill="#94a3b8" fontSize="18" fontWeight="600" textAnchor="middle">{age}</text>
            )}
          </g>
        )
      })}

      <text x={cx} y={40} fill="#f8fafc" fontSize="24" fontWeight="600" textAnchor="middle" letterSpacing="1">AGE & HAPPINESS (Radial)</text>
      
      {/* Catch-all Area for events */}
      <circle cx={cx} cy={cy} r="500" fill="transparent" />

      {/* Inner zero-circle marker fill */}
      <circle cx={cx} cy={cy} r={minR} fill="rgba(15, 23, 42, 0.8)" />

      {/* Main Curve Area */}
      <path 
        d={areaPath} 
        fill="url(#rHappinessGradient)" 
        style={{ pointerEvents: 'none' }}
      />
      {/* Main Curve Line */}
      <path 
        d={pathData} 
        fill="none" 
        stroke="#60a5fa" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
};

export default RadialGraph;
