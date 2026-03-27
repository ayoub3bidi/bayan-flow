/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { ALGORITHM_TYPES } from '../constants/index.js';
import ComplexityScene from './ComplexityScene.jsx';
import { COMPLEXITY_DURATION_FRAMES } from './constants.js';
import {
  VIDEO_SCENE_RENDERERS,
  VIDEO_TITLE_FALLBACK,
} from '../registry/videoSceneRegistry.jsx';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import { DEFAULT_COMPLEXITY_DATASET } from '../registry/complexityDatasetRegistry.js';

/**
 * Root Remotion composition: title bar, visualization (sorting or pathfinding), step counter, description.
 * Shows complexity analysis for the last 10 seconds.
 * Receives inputProps: steps, algorithmType, algorithmName, algorithmKey, framesPerStep, gridSize.
 */
function AlgorithmVideo({
  steps = [],
  algorithmType = ALGORITHM_TYPES.SORTING,
  algorithmName = '',
  algorithmKey = '',
  framesPerStep = 6,
  gridSize = 15,
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const mainDurationInFrames = steps.length * framesPerStep;
  const isComplexitySegment = steps.length > 0 && frame >= mainDurationInFrames;

  const complexityDataset =
    CATEGORY_CONFIG[algorithmType]?.complexityDataset ??
    DEFAULT_COMPLEXITY_DATASET;

  if (isComplexitySegment) {
    return (
      <ComplexityScene
        algorithmKey={algorithmKey}
        complexityDataset={complexityDataset}
        algorithmName={algorithmName}
      />
    );
  }

  if (!steps.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#1f2937',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
        }}
      >
        No steps to display
      </AbsoluteFill>
    );
  }

  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const step = steps[stepIndex] ?? steps[0];
  const description = step?.description ?? '';
  const renderMainScene = VIDEO_SCENE_RENDERERS[algorithmType];
  const titleFallback = VIDEO_TITLE_FALLBACK[algorithmType] ?? 'Algorithm';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111827',
        flexDirection: 'column',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '12px 24px',
          backgroundColor: '#1f2937',
          borderBottom: '2px solid #374151',
          color: '#f9fafb',
          fontSize: 20,
          fontWeight: 'bold',
        }}
      >
        {algorithmName || titleFallback}
      </div>

      {/* Visualization area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width,
          height: height - 80,
        }}
      >
        {renderMainScene
          ? renderMainScene({ steps, framesPerStep, gridSize })
          : null}
      </div>

      {/* Step counter + description */}
      <div
        style={{
          padding: '10px 24px',
          backgroundColor: '#1f2937',
          borderTop: '1px solid #374151',
          color: '#d1d5db',
          fontSize: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          Step {stepIndex + 1} / {steps.length}
        </span>
        {description ? (
          <span
            style={{
              maxWidth: width * 0.6,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

export default AlgorithmVideo;
