/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlgorithmVideo from './AlgorithmVideo.jsx';

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children }) => <div>{children}</div>,
  useCurrentFrame: () => 0,
  useVideoConfig: () => ({ width: 1280, height: 720 }),
}));

vi.mock('./ComplexityScene.jsx', () => ({
  default: () => null,
}));

vi.mock('../registry/videoSceneRegistry.jsx', () => ({
  VIDEO_SCENE_RENDERERS: {
    sorting: undefined,
    pathfinding: () => null,
  },
  VIDEO_TITLE_FALLBACK: {
    sorting: 'SortingFallback',
    pathfinding: 'PathFallback',
  },
}));

vi.mock('../registry/categoryConfig.js', () => ({
  CATEGORY_CONFIG: {
    sorting: { complexityDataset: 'sorting' },
    pathfinding: { complexityDataset: 'pathfinding' },
  },
}));

vi.mock('../registry/complexityDatasetRegistry.js', () => ({
  DEFAULT_COMPLEXITY_DATASET: 'sorting',
}));

describe('AlgorithmVideo registry edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders layout when main scene renderer is missing for the category', () => {
    render(
      <AlgorithmVideo
        steps={[{ description: 'step' }]}
        algorithmType="sorting"
        algorithmName="My Title"
        algorithmKey="bubbleSort"
      />
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Step 1 / 1')).toBeInTheDocument();
  });
});
