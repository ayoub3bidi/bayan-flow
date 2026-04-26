/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame, interpolate, interpolateColors } from 'remotion';
import {
  TREE_NODE_STATES,
  TREE_NODE_STATE_COLORS,
} from '../constants/index.js';
import { getVideoExportTheme } from './videoExportTheme.js';

const VIEW_PAD = 8;
const VIEW_INNER = 100 - 2 * VIEW_PAD;

/**
 * Remotion SVG tree traversal scene (normalized coordinates on nodes).
 *
 * @param {Object} props
 * @param {Array<{ nodes: Array, edges: Array, nodeStates: Record<string,string>, queueOrder?: string[] }>} props.steps
 * @param {number} props.framesPerStep
 * @param {'light'|'dark'} [props.exportTheme]
 */
function TreeTraversalSceneInner({
  steps,
  framesPerStep,
  exportTheme = 'dark',
}) {
  const frame = useCurrentFrame();
  const {
    graphEdgeStroke,
    graphNodeRing,
    captionBg,
    captionBorder,
    captionShadow,
    descText,
  } = getVideoExportTheme(exportTheme);
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const frameInStep = frame - stepIndex * framesPerStep;

  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const step = steps[stepIndex] ?? steps[0];
  if (!step?.nodes?.length) return null;

  const { nodes, edges, nodeStates, queueOrder = [] } = step;
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
  const labelById = Object.fromEntries(nodes.map(n => [n.id, n.label ?? n.id]));
  const queueLabels = queueOrder.map(id => labelById[id] ?? id);

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
      {queueLabels.length > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '82%',
            padding: '10px 16px',
            borderRadius: 9999,
            background: captionBg,
            border: `2px solid ${captionBorder}`,
            boxShadow: captionShadow,
            color: descText,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 22,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {`Queue: ${queueLabels.join(', ')}`}
        </div>
      ) : null}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
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
              stroke={graphEdgeStroke}
              strokeWidth={0.45}
              strokeLinecap="round"
            />
          );
        })}
        {nodes.map(n => {
          const p = posById.get(n.id);
          if (!p) return null;
          const state = nodeStates[n.id] ?? TREE_NODE_STATES.DEFAULT;
          const currentColor =
            TREE_NODE_STATE_COLORS[state] ??
            TREE_NODE_STATE_COLORS[TREE_NODE_STATES.DEFAULT];

          const prevState = prevStep?.nodeStates?.[n.id] ?? state;
          const prevColor =
            TREE_NODE_STATE_COLORS[prevState] ??
            TREE_NODE_STATE_COLORS[TREE_NODE_STATES.DEFAULT];

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
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(TreeTraversalSceneInner);
