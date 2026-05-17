/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import {
  GRAPH_EDGE_STATES,
  GRAPH_EDGE_STATE_COLORS,
  GRAPH_NODE_STATES,
  GRAPH_NODE_STATE_COLORS,
} from '../constants/index.js';
import { getVideoExportTheme } from './videoExportTheme.js';

const VIEW_PAD = 8;
const VIEW_INNER = 100 - 2 * VIEW_PAD;

function edgeKey(edge) {
  return edge.id ?? `${edge.from}->${edge.to}`;
}

function GraphAlgorithmSceneInner({
  steps,
  framesPerStep,
  exportTheme = 'dark',
}) {
  const frame = useCurrentFrame();
  const { graphEdgeStroke, graphNodeRing, captionBg, captionBorder, descText } =
    getVideoExportTheme(exportTheme);
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const frameInStep = frame - stepIndex * framesPerStep;
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const step = steps[stepIndex] ?? steps[0];
  if (!step?.nodes?.length) return null;

  const {
    nodes,
    edges,
    nodeStates = {},
    edgeStates = {},
    directed = true,
    weighted = false,
    graphArtifacts = {},
  } = step;
  const nodeCount = nodes.length;
  const nodeRadius = Math.max(2.8, Math.min(5.5, 6.2 - nodeCount * 0.12));
  const colorProgress = Math.min(
    1,
    interpolate(frameInStep, [0, framesPerStep * 0.4], [0, 1], {
      extrapolateRight: 'clamp',
    })
  );
  const posById = new Map(
    nodes.map(n => [
      n.id,
      {
        cx: VIEW_PAD + n.x * VIEW_INNER,
        cy: VIEW_PAD + n.y * VIEW_INNER,
      },
    ])
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 24,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {graphArtifacts.badges?.length ? (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '88%',
          }}
        >
          {graphArtifacts.badges.map(badge => (
            <div
              key={badge.id}
              style={{
                padding: '10px 16px',
                borderRadius: 9999,
                background: captionBg,
                border: `2px solid ${captionBorder}`,
                color: descText,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 21,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {badge.text}
            </div>
          ))}
        </div>
      ) : null}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
        role="img"
      >
        <defs>
          <marker
            id="video-graph-arrowhead"
            markerWidth="5"
            markerHeight="5"
            refX="4"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 5 2.5 L 0 5 z" fill={graphEdgeStroke} />
          </marker>
        </defs>
        {edges.map((edge, index) => {
          const a = posById.get(edge.from);
          const b = posById.get(edge.to);
          if (!a || !b) return null;
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const length = Math.hypot(dx, dy) || 1;
          const state = edgeStates[edgeKey(edge)] ?? GRAPH_EDGE_STATES.DEFAULT;
          const stroke =
            GRAPH_EDGE_STATE_COLORS[state] ??
            GRAPH_EDGE_STATE_COLORS[GRAPH_EDGE_STATES.DEFAULT];
          const x1 = a.cx + (dx / length) * nodeRadius;
          const y1 = a.cy + (dy / length) * nodeRadius;
          const x2 = b.cx - (dx / length) * (nodeRadius + 1.2);
          const y2 = b.cy - (dy / length) * (nodeRadius + 1.2);
          const mx = (a.cx + b.cx) / 2;
          const my = (a.cy + b.cy) / 2;

          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={state === GRAPH_EDGE_STATES.ACTIVE ? 0.9 : 0.5}
                strokeLinecap="round"
                markerEnd={directed ? 'url(#video-graph-arrowhead)' : undefined}
              />
              {weighted && edge.weight != null ? (
                <text
                  x={mx}
                  y={my - 1.4}
                  textAnchor="middle"
                  fill="#111827"
                  style={{
                    fontSize: 3.1,
                    fontWeight: 800,
                    paintOrder: 'stroke',
                    stroke: '#f8fafc',
                    strokeWidth: 0.8,
                  }}
                >
                  {edge.weight}
                </text>
              ) : null}
            </g>
          );
        })}
        {nodes.map(node => {
          const p = posById.get(node.id);
          if (!p) return null;
          const state = nodeStates[node.id] ?? GRAPH_NODE_STATES.DEFAULT;
          const currentColor =
            GRAPH_NODE_STATE_COLORS[state] ??
            GRAPH_NODE_STATE_COLORS[GRAPH_NODE_STATES.DEFAULT];
          const prevState = prevStep?.nodeStates?.[node.id] ?? state;
          const prevColor =
            GRAPH_NODE_STATE_COLORS[prevState] ??
            GRAPH_NODE_STATE_COLORS[GRAPH_NODE_STATES.DEFAULT];
          const fill =
            prevState !== state
              ? interpolateColors(
                  colorProgress,
                  [0, 1],
                  [prevColor, currentColor]
                )
              : currentColor;
          return (
            <g key={node.id}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={nodeRadius}
                fill={fill}
                stroke={graphNodeRing}
                strokeWidth={0.35}
              />
              <text
                x={p.cx}
                y={p.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#111827"
                style={{
                  fontSize: nodeRadius * 1.35,
                  fontWeight: 700,
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {node.label ?? node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(GraphAlgorithmSceneInner);
