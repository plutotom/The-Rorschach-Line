import React, { useRef, useState, useEffect } from 'react';
import { getInterpolatedData } from './math';

const DecadeSlidersGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [sliderValues, setSliderValues] = useState([
    50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50
  ]);
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    const nodes = sliderValues.map((y, i) => ({ x: i * 10, y }));
    const interpolated = getInterpolatedData(nodes);
    setData(interpolated);
  }, [sliderValues, setData]);

  const pointerToYVal = (clientY) => {
    if (!svgRef.current) return 50;
    const rect = svgRef.current.getBoundingClientRect();
    const ySVG = ((clientY - rect.top) / rect.height) * 600 - 20;
    
    let happiness = Math.round((500 - ySVG) / 5);
    return Math.max(0, Math.min(100, happiness));
  };

  const handlePointerDown = (e, index) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingIndex(index);
    
    const val = pointerToYVal(e.clientY);
    setSliderValues(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === null) return;
    const val = pointerToYVal(e.clientY);
    
    setSliderValues(prev => {
      const next = [...prev];
      next[draggingIndex] = val;
      return next;
    });
  };

  const handlePointerUp = (e) => {
    if (draggingIndex !== null) {
      e.target.releasePointerCapture(e.pointerId);
      setDraggingIndex(null);
    }
  };

  const pathData = data.map((happiness, age) => {
    const x = age * 10;
    const y = 500 - happiness * 5;
    return `${age === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const getLedColor = (val, yPos) => {
    // yPos is 0 to 100 (0 is bottom, 100 is top)
    if (yPos > 85) return '#ef4444'; // Red
    if (yPos > 65) return '#f97316'; // Orange
    if (yPos > 40) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <svg 
      ref={svgRef}
      className="svg-graph synth-style"
      viewBox="-80 -20 1100 600"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        userSelect: 'none',
        touchAction: 'none',
        backgroundColor: '#18181b',
        borderRadius: '8px',
        border: '4px solid #09090b',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.05)',
        fontFamily: '"SF Pro Rounded", "Arial Rounded MT Bold", sans-serif'
      }}
    >
      <defs>
        {/* Hardware Surface Texture Simulation */}
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.05 0" />
        </filter>

        {/* Fader Drop Shadow */}
        <filter id="faderShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#000" floodOpacity="0.8"/>
          <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.5"/>
        </filter>

        {/* Groove Inner Shadow */}
        <filter id="grooveInner" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="2"/>
          <feGaussianBlur stdDeviation="2" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood floodColor="black" floodOpacity="0.9" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>

        {/* Glowing LED line */}
        <filter id="neonTube" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Fader Gradient - Metallic */}
        <linearGradient id="faderMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52525b"/>
          <stop offset="20%" stopColor="#71717a"/>
          <stop offset="50%" stopColor="#3f3f46"/>
          <stop offset="100%" stopColor="#27272a"/>
        </linearGradient>

        <linearGradient id="faderHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
          <stop offset="10%" stopColor="rgba(255,255,255,0.1)"/>
          <stop offset="100%" stopColor="transparent"/>
        </linearGradient>
      </defs>

      {/* Surface Base */}
      <rect x="-80" y="-20" width="1100" height="600" fill="#27272a" />
      <rect x="-80" y="-20" width="1100" height="600" style={{ mixBlendMode: 'overlay' }} filter="url(#noise)" />

      {/* Hardware Decals Lines */}
      <rect x="-40" y="20" width="1040" height="520" fill="none" stroke="#3f3f46" strokeWidth="2" rx="4" />
      <rect x="-35" y="25" width="1030" height="510" fill="none" stroke="#18181b" strokeWidth="1" rx="2" />

      {/* Grid Lines Y-axis (Silkscreen printed lines) */}
      {[0, 25, 50, 75, 100].map(h => {
        const y = 500 - h * 5;
        return (
          <g key={`h-${h}`}>
            <line 
              x1="0" y1={y} x2="1000" y2={y} 
              stroke="#3f3f46" 
              strokeWidth="2" 
              strokeDasharray={h === 50 ? "none" : "8 8"} 
            />
            <text x="-15" y={y + 5} fill="#71717a" fontSize="13" fontWeight="800" textAnchor="end">{h}</text>
          </g>
        )
      })}

      {/* Background Labels */}
      <text x="-55" y="250" transform="rotate(-90 -55 250)" fill="#71717a" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="4">MASTER OUT</text>
      <text x="500" y="575" fill="#71717a" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="4">CHANNELS (AGE)</text>

      {/* Segmented LED Volume Meters Behind Sliders */}
      {sliderValues.map((val, i) => {
        const x = i * 10 * 10;
        
        // Render 20 segments per track
        const segments = Array.from({ length: 20 });
        return (
          <g key={`meter-${i}`}>
            {segments.map((_, segIdx) => {
              const segVal = (segIdx + 1) * 5; // 5 to 100
              const isActive = val >= segVal;
              const y = 500 - segVal * 5;
              const color = getLedColor(val, segVal);
              
              return (
                <rect 
                  key={`seg-${segIdx}`}
                  x={x - 8}
                  y={y}
                  width="16"
                  height="18"
                  rx="2"
                  fill={isActive ? color : '#18181b'}
                  opacity={isActive ? 0.8 : 0.3}
                  filter={isActive ? 'url(#neonTube)' : 'none'}
                  style={{ transition: 'all 0.1s ease' }}
                />
              )
            })}
          </g>
        )
      })}

      {/* The Smooth Plasma Trace Line */}
      <path 
        d={pathData} 
        fill="none" 
        stroke="#fff" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#neonTube)"
        style={{ pointerEvents: 'none', transition: 'd 0.05s linear', opacity: 0.9 }}
      />
      {/* Core of the plasma line */}
      <path 
        d={pathData} 
        fill="none" 
        stroke="#fff" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ pointerEvents: 'none', transition: 'd 0.05s linear' }}
      />

      {/* Physical Hardware Sliders */}
      {sliderValues.map((val, i) => {
        const age = i * 10;
        const x = age * 10;
        const y = 500 - val * 5;
        const isDragging = draggingIndex === i;

        return (
          <g key={`slider-${i}`} transform={`translate(${x}, 0)`}>
            
            {/* Deep recessed mounting plate for fader track */}
            <rect 
              x="-18" y="-10" 
              width="36" height="520" 
              rx="4"
              fill="#18181b" 
              stroke="#3f3f46"
              strokeWidth="1"
            />
            
            {/* Dark Groove Track */}
            <rect 
              x="-6" y="0" width="12" height="500" rx="6"
              fill="#09090b" 
              filter="url(#grooveInner)"
            />
            {/* Dust cover flaps in track (visual detail) */}
            <line x1="-5" y1="0" x2="-5" y2="500" stroke="#27272a" strokeWidth="1" />
            <line x1="5" y1="0" x2="5" y2="500" stroke="#27272a" strokeWidth="1" />
            
            <text x="0" y="530" fill={isDragging ? "#eab308" : "#a1a1aa"} fontSize="14" fontWeight="800" textAnchor="middle">CH {i+1}</text>
            <text x="0" y="545" fill="#52525b" fontSize="11" fontWeight="700" textAnchor="middle">{age}</text>

            {/* Hit area for the entire track */}
            <rect 
              x="-25" y="0" width="50" height="500" 
              fill="transparent" 
              cursor="ns-resize"
              onPointerDown={(e) => handlePointerDown(e, i)}
            />

            {/* 3D Hardware Fader Knob */}
            <g transform={`translate(0, ${y})`} style={{ pointerEvents: 'none', transition: isDragging ? 'none' : 'transform 0.05s ease' }}>
              
              {/* Main Knob Body with Drop Shadow */}
              <rect 
                x="-22" y="-16" width="44" height="32" rx="4"
                fill="url(#faderMetal)"
                filter="url(#faderShadow)"
              />
              
              {/* Highlight to create 3D top bevel */}
              <rect 
                x="-22" y="-16" width="44" height="16" rx="4"
                fill="url(#faderHighlight)"
              />

              {/* Bottom Bevel Shadow */}
              <rect 
                x="-22" y="14" width="44" height="2" rx="1"
                fill="rgba(0,0,0,0.6)"
              />
              
              {/* Grip Lines */}
              <line x1="-14" y1="-8" x2="14" y2="-8" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              <line x1="-14" y1="-4" x2="14" y2="-4" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              <line x1="-14" y1="4" x2="14" y2="4" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              <line x1="-14" y1="8" x2="14" y2="8" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              
              {/* Center Indent Indicator Line */}
              <rect x="-18" y="-1" width="36" height="2" fill={isDragging ? "#ef4444" : "#fff"} />
              
              {/* Active state LED indicator on the fader itself */}
              {isDragging && (
                <circle cx="15" cy="-10" r="2" fill="#ef4444" filter="url(#neonTube)" />
              )}
            </g>
          </g>
        )
      })}
    </svg>
  );
};

export default DecadeSlidersGraph;
