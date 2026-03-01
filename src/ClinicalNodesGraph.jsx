import React, { useRef, useState, useEffect } from 'react';
import { getInterpolatedData } from './math';

const ClinicalNodesGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([
    { id: 1, x: 0, y: 50 },
    { id: 2, x: 50, y: 50 },
    { id: 3, x: 100, y: 50 }
  ]);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [hoverNodeId, setHoverNodeId] = useState(null);

  useEffect(() => {
    const interpolated = getInterpolatedData(nodes);
    setData(interpolated);
  }, [nodes, setData]);

  const pointerToSVGCoords = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const xSVG = ((clientX - rect.left) / rect.width) * 1100 - 80;
    const ySVG = ((clientY - rect.top) / rect.height) * 600 - 20;
    
    let age = Math.round(xSVG / 10);
    let happiness = Math.round((500 - ySVG) / 5);
    
    age = Math.max(0, Math.min(100, age));
    happiness = Math.max(0, Math.min(100, happiness));
    return { age, happiness };
  };

  const handlePointerDown = (e, nodeId) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingNodeId(nodeId);
  };

  const handlePointerMove = (e) => {
    if (!draggingNodeId) return;
    const { age, happiness } = pointerToSVGCoords(e.clientX, e.clientY);
    
    setNodes(prev => prev.map(node => {
      if (node.id === draggingNodeId) {
        const sorted = [...prev].sort((a,b) => a.x - b.x);
        const currentIndex = sorted.findIndex(n => n.id === node.id);
        const minX = currentIndex > 0 ? sorted[currentIndex - 1].x + 1 : 0;
        const maxX = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1].x - 1 : 100;
        
        let boundedAge = Math.max(minX, Math.min(maxX, age));
        if (currentIndex === 0) boundedAge = 0;
        if (currentIndex === sorted.length - 1) boundedAge = 100;

        return { ...node, x: boundedAge, y: happiness };
      }
      return node;
    }));
  };

  const handlePointerUp = (e) => {
    if (draggingNodeId) {
      e.target.releasePointerCapture(e.pointerId);
      setDraggingNodeId(null);
    }
  };

  const handleBackgroundClick = (e) => {
    if (draggingNodeId) return;
    const { age, happiness } = pointerToSVGCoords(e.clientX, e.clientY);
    
    const isTooClose = nodes.some(n => Math.abs(n.x - age) < 3);
    if (!isTooClose && age > 0 && age < 100) {
      const newNode = { id: Date.now(), x: age, y: happiness };
      setNodes(prev => [...prev, newNode].sort((a,b) => a.x - b.x));
    }
  };

  const handleNodeDoubleClick = (e, nodeId) => {
    e.stopPropagation();
    setNodes(prev => {
      if (prev.length <= 2) return prev;
      const filtered = prev.filter(n => n.id !== nodeId);
      if (!filtered.some(n => n.x === 0)) filtered.push({ id: Date.now(), x: 0, y: 50 });
      if (!filtered.some(n => n.x === 100)) filtered.push({ id: Date.now()+1, x: 100, y: 50 });
      return filtered.sort((a,b) => a.x - b.x);
    });
  };

  const pathData = data.map((happiness, age) => {
    const x = age * 10;
    const y = 500 - happiness * 5;
    return `${age === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const activeNode = nodes.find(n => n.id === draggingNodeId);
  const colorPrimary = "#1e293b"; // Dark slate
  const colorSecondary = "#94a3b8"; // Light slate
  const colorGrid = "#e2e8f0"; // Very light slate
  const colorGridMinor = "#f8fafc"; // Off-white slate

  return (
    <svg 
      ref={svgRef}
      className="svg-graph clinical-style"
      viewBox="-80 -20 1100 600"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleBackgroundClick}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'crosshair',
        backgroundColor: '#ffffff',
        borderRadius: '1.5rem',
        border: `1px solid ${colorGrid}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <defs>
        {/* Graph Paper Pattern Minor */}
        <pattern id="clinicalMinorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colorGridMinor} strokeWidth="1"/>
        </pattern>
        {/* Graph Paper Pattern Major */}
        <pattern id="clinicalMajorGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#clinicalMinorGrid)" />
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke={colorGrid} strokeWidth="1"/>
        </pattern>
      </defs>

      {/* Grid Background */}
      <rect x="0" y="0" width="1000" height="500" fill="url(#clinicalMajorGrid)" />

      {/* Axis Lines - Clean */}
      <line x1="0" y1="500" x2="1000" y2="500" stroke={colorPrimary} strokeWidth="1" />
      <line x1="0" y1="0" x2="0" y2="500" stroke={colorPrimary} strokeWidth="1" />

      {/* Y-Axis Labels */}
      {[0, 25, 50, 75, 100].map(h => {
        const y = 500 - h * 5;
        return (
          <g key={`y-${h}`}>
            <line x1="-5" y1={y} x2="0" y2={y} stroke={colorPrimary} strokeWidth="1" />
            <text x="-12" y={y + 4} fill={colorSecondary} fontSize="12" textAnchor="end">
              {h}
            </text>
          </g>
        )
      })}

      {/* X-Axis Labels */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(age => {
        const x = age * 10;
        return (
          <g key={`x-${age}`}>
            <line x1={x} y1="500" x2={x} y2="505" stroke={colorPrimary} strokeWidth="1" />
            <text x={x} y="525" fill={colorSecondary} fontSize="12" textAnchor="middle">
              {age}
            </text>
          </g>
        )
      })}

      {/* Axis Titles */}
      <text x="-50" y="250" transform="rotate(-90 -50 250)" fill={colorSecondary} fontSize="13" fontWeight="500" textAnchor="middle" letterSpacing="1">Happiness</text>
      <text x="500" y="555" fill={colorSecondary} fontSize="13" fontWeight="500" textAnchor="middle" letterSpacing="1">Age</text>

      {/* Active crosshairs (Simple dotted lines, no fancy boxes) */}
      {activeNode && (
        <g opacity="0.6">
          <line x1="0" y1={500 - activeNode.y * 5} x2="1000" y2={500 - activeNode.y * 5} stroke={colorSecondary} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={activeNode.x * 10} y1="0" x2={activeNode.x * 10} y2="500" stroke={colorSecondary} strokeWidth="1" strokeDasharray="3 3" />
        </g>
      )}

      {/* Resulting Smoothed Line - Graphed Output */}
      <path 
        d={pathData} 
        fill="none" 
        stroke={colorPrimary} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />

      {/* Interactive Control Nodes - Minimalist Circles */}
      {nodes.map(node => {
        const x = node.x * 10;
        const y = 500 - node.y * 5;
        const isDragging = draggingNodeId === node.id;
        const isHover = hoverNodeId === node.id || isDragging;
        
        return (
          <g key={node.id} transform={`translate(${x}, ${y})`}>
            {/* Invisible larger hit area */}
            <circle 
              r="25" 
              fill="transparent" 
              cursor="grab"
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              onPointerEnter={() => setHoverNodeId(node.id)}
              onPointerLeave={() => setHoverNodeId(null)}
              onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
            />
            
            {/* Minimal Node Design */}
            <circle 
              r={isDragging || isHover ? "6" : "5"} 
              fill={isDragging ? colorPrimary : "#ffffff"} 
              stroke={colorPrimary} 
              strokeWidth={isDragging ? "2" : "1.5"} 
              style={{ pointerEvents: 'none', transition: 'all 0.1s ease' }}
            />
          </g>
        )
      })}
    </svg>
  );
};

export default ClinicalNodesGraph;
