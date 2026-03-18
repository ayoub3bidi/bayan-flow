/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame } from 'remotion';
import { STATE_COLORS } from '../constants/index.js';

/**
 * Renders sorting visualization for a single step (frame-based).
 * No Framer Motion; uses only CSS supported by @remotion/web-renderer.
 *
 * @param {Object} props
 * @param {Array<{ array: number[], states: string[], description: string }>} props.steps
 * @param {number} props.framesPerStep
 */
function SortingSceneInner({ steps, framesPerStep }) {
  const frame = useCurrentFrame();
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    steps.length - 1
  );
  const step = steps[stepIndex] ?? steps[0];
  if (!step) return null;

  const { array, states } = step;
  const n = array.length;
  const barSize = n <= 20 ? 60 : n <= 35 ? 45 : 30;
  const minSize = 25;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        padding: 24,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {array.map((value, i) => {
        const state = states[i] ?? 'default';
        const color = STATE_COLORS[state] ?? STATE_COLORS.default;
        return (
          <div
            key={`${stepIndex}-${i}-${value}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              marginLeft: 8,
              marginRight: 8,
            }}
          >
            <div
              style={{
                backgroundColor: color,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: color,
                borderRadius: 8,
                width: Math.max(barSize, minSize),
                height: Math.max(barSize, minSize),
                minWidth: minSize,
                minHeight: minSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
              }}
            >
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SortingScene = memo(SortingSceneInner);
export default SortingScene;
