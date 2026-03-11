import React, { useRef, useState, useEffect } from "react";
import { getInterpolatedData } from "./math";

const ControlPointsGraph = ({ data, setData }) => {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([
    { id: 1, x: 0, y: 50 },
    { id: 2, x: 50, y: 50 },
    { id: 3, x: 100, y: 50 },
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

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === draggingNodeId) {
          const sorted = [...prev].sort((a, b) => a.x - b.x);
          const currentIndex = sorted.findIndex((n) => n.id === node.id);
          const minX = currentIndex > 0 ? sorted[currentIndex - 1].x + 1 : 0;
          const maxX =
            currentIndex < sorted.length - 1
              ? sorted[currentIndex + 1].x - 1
              : 100;

          let boundedAge = Math.max(minX, Math.min(maxX, age));
          if (currentIndex === 0) boundedAge = 0;
          if (currentIndex === sorted.length - 1) boundedAge = 100;

          return { ...node, x: boundedAge, y: happiness };
        }
        return node;
      }),
    );
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

    const isTooClose = nodes.some((n) => Math.abs(n.x - age) < 3);
    if (!isTooClose && age > 0 && age < 100) {
      const newNode = { id: Date.now(), x: age, y: happiness };
      setNodes((prev) => [...prev, newNode].sort((a, b) => a.x - b.x));
    }
  };

  const handleNodeDoubleClick = (e, nodeId) => {
    e.stopPropagation();
    setNodes((prev) => {
      if (prev.length <= 2) return prev;
      const filtered = prev.filter((n) => n.id !== nodeId);
      if (!filtered.some((n) => n.x === 0))
        filtered.push({ id: Date.now(), x: 0, y: 50 });
      if (!filtered.some((n) => n.x === 100))
        filtered.push({ id: Date.now() + 1, x: 100, y: 50 });
      return filtered.sort((a, b) => a.x - b.x);
    });
  };

  const pathData = data
    .map((happiness, age) => {
      const x = age * 10;
      const y = 500 - happiness * 5;
      return `${age === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const rawPathData = [...nodes]
    .sort((a, b) => a.x - b.x)
    .map((n, i) => {
      const x = n.x * 10;
      const y = 500 - n.y * 5;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const activeNode = nodes.find((n) => n.id === draggingNodeId);
  const colorPrimary = "#00ffcc";
  const colorSecondary = "rgba(0, 255, 204, 0.4)";
  const colorGrid = "rgba(0, 255, 204, 0.15)";
  const colorGridMinor = "rgba(0, 255, 204, 0.05)";

  return (
    <svg
      ref={svgRef}
      className="svg-graph blueprint-style"
      viewBox="-80 -20 1100 600"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleBackgroundClick}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        userSelect: "none",
        touchAction: "none",
        cursor: "crosshair",
        backgroundColor: "#0a0f18",
        borderRadius: "1.5rem",
        border: `1px solid ${colorGrid}`,
        boxShadow: "inset 0 0 50px rgba(0, 255, 204, 0.05)",
        fontFamily:
          'ui-monospace, "SF Mono", "Fira Code", "Roboto Mono", monospace',
      }}
    >
      <defs>
        {/* Graph Paper Pattern Minor */}
        <pattern
          id="minorGrid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke={colorGridMinor}
            strokeWidth="0.5"
          />
        </pattern>
        {/* Graph Paper Pattern Major */}
        <pattern
          id="majorGrid"
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <rect width="50" height="50" fill="url(#minorGrid)" />
          <path
            d="M 50 0 L 0 0 0 50"
            fill="none"
            stroke={colorGrid}
            strokeWidth="1"
          />
        </pattern>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur1" />
          <feGaussianBlur stdDeviation="10" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Blueprint Grid Background */}
      <rect x="0" y="0" width="1000" height="500" fill="url(#majorGrid)" />

      {/* Axis Lines - Heavy */}
      <line
        x1="0"
        y1="500"
        x2="1000"
        y2="500"
        stroke={colorPrimary}
        strokeWidth="2"
      />
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="500"
        stroke={colorPrimary}
        strokeWidth="2"
      />

      {/* Y-Axis Labels */}
      {[0, 25, 50, 75, 100].map((h) => {
        const y = 500 - h * 5;
        return (
          <g key={`y-${h}`}>
            <line
              x1="-10"
              y1={y}
              x2="0"
              y2={y}
              stroke={colorPrimary}
              strokeWidth="2"
            />
            <text
              x="-15"
              y={y + 4}
              fill={colorPrimary}
              fontSize="12"
              textAnchor="end"
              letterSpacing="1"
            >
              Y:{h.toString().padStart(3, "0")}
            </text>
          </g>
        );
      })}

      {/* X-Axis Labels */}
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((age) => {
        const x = age * 10;
        return (
          <g key={`x-${age}`}>
            <line
              x1={x}
              y1="500"
              x2={x}
              y2="510"
              stroke={colorPrimary}
              strokeWidth="2"
            />
            <text
              x={x}
              y="525"
              fill={colorPrimary}
              fontSize="12"
              textAnchor="middle"
              letterSpacing="1"
            >
              X:{age.toString().padStart(3, "0")}
            </text>
          </g>
        );
      })}

      {/* Axis Titles */}
      <text
        x="-55"
        y="250"
        transform="rotate(-90 -55 250)"
        fill={colorPrimary}
        fontSize="14"
        fontWeight="600"
        textAnchor="middle"
        letterSpacing="4"
      >
        AMPLITUDE
      </text>
      <text
        x="500"
        y="560"
        fill={colorPrimary}
        fontSize="14"
        fontWeight="600"
        textAnchor="middle"
        letterSpacing="4"
      >
        LIFESPAN_VECTOR
      </text>

      {/* Active crosshairs */}
      {activeNode && (
        <g opacity="0.8">
          {/* Target Box */}
          <rect
            x={activeNode.x * 10 - 50}
            y={500 - activeNode.y * 5 - 20}
            width="100"
            height="40"
            fill="#0a0f18"
            stroke={colorPrimary}
            strokeDasharray="2 2"
            opacity="0.9"
          />
          <text
            x={activeNode.x * 10}
            y={500 - activeNode.y * 5 + 4}
            fill={colorPrimary}
            fontSize="10"
            textAnchor="middle"
            letterSpacing="1"
          >
            [{activeNode.x.toString().padStart(3, "0")},{" "}
            {activeNode.y.toString().padStart(3, "0")}]
          </text>

          {/* Laser Guide Lines */}
          <line
            x1="0"
            y1={500 - activeNode.y * 5}
            x2="1000"
            y2={500 - activeNode.y * 5}
            stroke={colorPrimary}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={activeNode.x * 10}
            y1="0"
            x2={activeNode.x * 10}
            y2="500"
            stroke={colorPrimary}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </g>
      )}

      {/* Raw connect-the-dots line (Construction Line) */}
      <path
        d={rawPathData}
        fill="none"
        stroke={colorSecondary}
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray="2 6"
        style={{ pointerEvents: "none" }}
      />

      {/* Resulting Smoothed Line - Graphed Output */}
      <path
        d={pathData}
        fill="none"
        stroke={colorPrimary}
        strokeWidth="2"
        filter="url(#neonGlow)"
        style={{ pointerEvents: "none", transition: "d 0.05s linear" }}
      />

      {/* Interactive Control Nodes - Complex Reticles */}
      {nodes.map((node) => {
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

            {/* Reticle Design */}
            <g
              style={{
                pointerEvents: "none",
                transition: "all 0.15s ease-out",
              }}
              transform={
                isDragging
                  ? "scale(1.2) rotate(45)"
                  : isHover
                    ? "scale(1.1) rotate(0)"
                    : "scale(1) rotate(0)"
              }
              filter={
                isDragging
                  ? "url(#intenseGlow)"
                  : isHover
                    ? "url(#neonGlow)"
                    : "none"
              }
            >
              {/* Outer Ring */}
              <circle
                r={isDragging ? "12" : "8"}
                fill="#0a0f18"
                stroke={colorPrimary}
                strokeWidth={isDragging ? "2" : "1.5"}
              />
              {/* Inner dot */}
              <circle r="2" fill={colorPrimary} />

              {/* Crosshairs */}
              <line
                x1={isDragging ? "-18" : "-12"}
                y1="0"
                x2={isDragging ? "-6" : "-4"}
                y2="0"
                stroke={colorPrimary}
                strokeWidth="1.5"
              />
              <line
                x1={isDragging ? "18" : "12"}
                y1="0"
                x2={isDragging ? "6" : "4"}
                y2="0"
                stroke={colorPrimary}
                strokeWidth="1.5"
              />
              <line
                x1="0"
                y1={isDragging ? "-18" : "-12"}
                x2="0"
                y2={isDragging ? "-6" : "-4"}
                stroke={colorPrimary}
                strokeWidth="1.5"
              />
              <line
                x1="0"
                y1={isDragging ? "18" : "12"}
                x2="0"
                y2={isDragging ? "6" : "4"}
                stroke={colorPrimary}
                strokeWidth="1.5"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export default ControlPointsGraph;
