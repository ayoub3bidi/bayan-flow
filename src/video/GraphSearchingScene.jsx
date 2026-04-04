/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame, interpolate, interpolateColors } from 'remotion';
import {
  GRAPH_NODE_STATES,
  GRAPH_NODE_STATE_COLORS,
} from '../constants/index.js';

const VIEW_PAD = 8;
const VIEW_INNER = 100 - 2 * VIEW_PAD;

/**
 * @param {Object} props
 * @param {Array<{ nodes: Array, edges: Array, nodeStates: Record<string,string>, description?: string }>} props.steps
 * @param {number} props.framesPerStep
 */
function GraphSearchingSceneInner({ steps, framesPerStep }) {
  const frame = useCurrentFrame();
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const frameInStep = frame - stepIndex * framesPerStep;

  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const step = steps[stepIndex] ?? steps[0];
  if (!step?.nodes?.length) return null;

  const { nodes, edges, nodeStates } = step;
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
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: 'min(90vw, 720px)', height: 'min(90vw, 720px)' }}
        role="img"
      >
        {edges.map((e, i) => {
          const a = posById.get(e.from);
          const b = posById.get(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}-${i}`}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="#9ca3af"
              strokeWidth={0.45}
              strokeLinecap="round"
            />
          );
        })}
        {nodes.map(n => {
          const p = posById.get(n.id);
          if (!p) return null;
          const state = nodeStates[n.id] ?? GRAPH_NODE_STATES.DEFAULT;
          const currentColor =
            GRAPH_NODE_STATE_COLORS[state] ??
            GRAPH_NODE_STATE_COLORS[GRAPH_NODE_STATES.DEFAULT];

          const prevState = prevStep?.nodeStates?.[n.id] ?? state;
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

          const label = n.label ?? n.id;
          return (
            <g key={n.id}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={nodeRadius}
                fill={fill}
                stroke="#374151"
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
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(GraphSearchingSceneInner);
