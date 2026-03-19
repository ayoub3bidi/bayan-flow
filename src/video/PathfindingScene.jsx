/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame, interpolate, interpolateColors } from 'remotion';
import { GRID_STATE_COLORS } from '../constants/index.js';

/**
 * Renders pathfinding grid visualization with smooth color transitions.
 * Interpolates cell backgroundColor when state changes between steps.
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
  const frameInStep = frame - stepIndex * framesPerStep;

  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const step = steps[stepIndex] ?? steps[0];
  if (!step) return null;

  const { states } = step;
  const cellPx = gridSize <= 15 ? 32 : gridSize <= 25 ? 24 : 18;

  // Color transition progress over the step (first 40% for a snappy transition)
  const colorProgress = Math.min(
    1,
    interpolate(frameInStep, [0, framesPerStep * 0.4], [0, 1], {
      extrapolateRight: 'clamp',
    })
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
            const currentColor =
              GRID_STATE_COLORS[state] ?? GRID_STATE_COLORS.default;

            const prevState = prevStep?.states?.[rowIndex]?.[colIndex] ?? state;
            const prevColor =
              GRID_STATE_COLORS[prevState] ?? GRID_STATE_COLORS.default;

            const color =
              prevState !== state
                ? interpolateColors(
                    colorProgress,
                    [0, 1],
                    [prevColor, currentColor]
                  )
                : currentColor;

            return (
              <div
                key={`${stepIndex}-${rowIndex}-${colIndex}`}
                style={{
                  width: cellPx,
                  height: cellPx,
                  backgroundColor: color,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#6b7280',
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
