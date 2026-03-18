/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame } from 'remotion';
import { GRID_STATE_COLORS } from '../constants/index.js';

/**
 * Renders pathfinding grid visualization for a single step (frame-based).
 * No Framer Motion; uses only CSS supported by @remotion/web-renderer.
 *
 * @param {Object} props
 * @param {Array<{ grid: number[][], states: string[][], description: string }>} props.steps
 * @param {number} props.framesPerStep
 * @param {number} props.gridSize - N for N×N grid
 */
function PathfindingSceneInner({ steps, framesPerStep, gridSize }) {
  const frame = useCurrentFrame();
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    steps.length - 1
  );
  const step = steps[stepIndex] ?? steps[0];
  if (!step) return null;

  const { states } = step;
  const cellPx = gridSize <= 15 ? 24 : gridSize <= 25 ? 18 : 14;

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellPx}px)`,
          gap: 0,
        }}
        role="grid"
      >
        {states.map((row, rowIndex) =>
          row.map((state, colIndex) => {
            const color = GRID_STATE_COLORS[state] ?? GRID_STATE_COLORS.default;
            return (
              <div
                key={`${stepIndex}-${rowIndex}-${colIndex}`}
                style={{
                  width: cellPx,
                  height: cellPx,
                  backgroundColor: color,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#d1d5db',
                  borderRadius: 2,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

const PathfindingScene = memo(PathfindingSceneInner);
export default PathfindingScene;
