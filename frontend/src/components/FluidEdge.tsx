// src/components/FluidEdge.tsx
import React from 'react';
import { getBezierPath, Position } from 'reactflow';

// 1. Declare strict structural types for incoming relationship data
export interface FluidEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: {
    relationshipType?: 'parent' | 'spouse' | 'sibling';
  };
}

export default function FluidEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: FluidEdgeProps) {
  
  // 2. Compute the smooth, natural Bezier path layout curve strings
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 3. Resolve style presets context based on the genealogy map rules
  const relationType = data?.relationshipType ?? 'parent';
  
  const styleConfig = {
    parent: { 
      stroke: '#a8a29e', // Stone
      strokeDasharray: '4,4', 
      className: 'animate-[dash_20s_linear_infinite]' 
    },
    spouse: { 
      stroke: '#f9a8d4', // Pink
      strokeDasharray: '6,3', 
      className: '' 
    },
    sibling: { 
      stroke: '#93c5fd', // Blue
      strokeDasharray: '2,6', 
      className: 'animate-[dash_30s_linear_infinite]' 
    },
  }[relationType];

  return (
    <g className="react-flow__edge">
      {/* 🧬 The Underlying Vector Path Vector Line */}
      <path
        id={id}
        d={edgePath}
        className={`fill-none transition-all duration-300 ${styleConfig.className}`}
        style={{
          stroke: styleConfig.stroke,
          strokeDasharray: styleConfig.strokeDasharray,
          strokeWidth: 2,
        }}
      />

      {/* 💞 Mid-line Marriage Heart Indicator (Spouse Context Only) */}
      {relationType === 'spouse' && (
        <text dy={-4}>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            className="text-[11px] fill-rose-400 font-sans select-none animate-pulse"
          >
            ♥
          </textPath>
        </text>
      )}
    </g>
  );
}