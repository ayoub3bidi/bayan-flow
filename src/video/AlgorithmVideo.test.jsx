/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlgorithmVideo from './AlgorithmVideo.jsx';

const useCurrentFrame = vi.fn();
const sortingRenderer = vi.fn(() => (
  <div data-testid="sorting-scene">Sorting scene</div>
));
const pathfindingRenderer = vi.fn(() => (
  <div data-testid="pathfinding-scene">Pathfinding scene</div>
));
const complexityScene = vi.fn(() => (
  <div data-testid="complexity-scene">Complexity</div>
));

vi.mock('@remotion/media', () => ({
  Audio: () => null,
}));

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children }) => <div>{children}</div>,
  useCurrentFrame: () => useCurrentFrame(),
  useVideoConfig: () => ({ width: 1280, height: 720 }),
  staticFile: p => p,
  Sequence: ({ children }) => <>{children}</>,
}));

vi.mock('./ComplexityScene.jsx', () => ({
  default: props => complexityScene(props),
}));

vi.mock('../registry/videoSceneRegistry.jsx', () => ({
  VIDEO_SCENE_RENDERERS: {
    sorting: props => sortingRenderer(props),
    searching: props => sortingRenderer(props),
    pathfinding: props => pathfindingRenderer(props),
  },
  VIDEO_TITLE_FALLBACK: {
    sorting: 'Sorting',
    pathfinding: 'Pathfinding',
    searching: 'Searching',
  },
}));

vi.mock('../registry/categoryConfig.js', () => ({
  CATEGORY_CONFIG: {
    sorting: { complexityDataset: 'sorting' },
    pathfinding: { complexityDataset: 'pathfinding' },
    searching: { complexityDataset: 'searching' },
  },
}));

vi.mock('../registry/complexityDatasetRegistry.js', () => ({
  DEFAULT_COMPLEXITY_DATASET: 'sorting',
}));

describe('AlgorithmVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrentFrame.mockReturnValue(0);
  });

  it('renders the empty state when there are no steps', () => {
    render(<AlgorithmVideo steps={[]} />);
    expect(screen.getByText('No steps to display')).toBeInTheDocument();
  });

  it('uses title fallback when algorithmName is empty', () => {
    render(
      <AlgorithmVideo
        steps={[{ description: 'x' }]}
        algorithmType="sorting"
        algorithmName=""
        algorithmKey="bubbleSort"
      />
    );
    expect(screen.getByText('Sorting')).toBeInTheDocument();
  });

  it('renders the registered main scene for the active category', () => {
    render(
      <AlgorithmVideo
        steps={[{ description: 'visit' }]}
        algorithmType="pathfinding"
        algorithmKey="bfs"
        gridSize={25}
      />
    );

    expect(pathfindingRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [{ description: 'visit' }],
        framesPerStep: 6,
        gridSize: 25,
        exportTheme: 'dark',
      })
    );
    expect(screen.getByTestId('pathfinding-scene')).toBeInTheDocument();
    expect(screen.getByText('Pathfinding')).toBeInTheDocument();
    expect(screen.getByText('Pathfinding scene')).toBeInTheDocument();
  });

  it('renders array scene for searching category', () => {
    render(
      <AlgorithmVideo
        steps={[{ description: 'check', array: [1, 2], states: [] }]}
        algorithmType="searching"
        algorithmKey="binarySearch"
      />
    );

    expect(sortingRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [{ description: 'check', array: [1, 2], states: [] }],
        framesPerStep: 6,
        exportTheme: 'dark',
      })
    );
    expect(screen.getByText('Searching')).toBeInTheDocument();
    expect(screen.getByText('Sorting scene')).toBeInTheDocument();
  });

  it('routes to ComplexityScene with the category dataset after the main segment', () => {
    useCurrentFrame.mockReturnValue(6);

    render(
      <AlgorithmVideo
        steps={[{ description: 'visit' }]}
        algorithmType="pathfinding"
        algorithmKey="bfs"
        algorithmName="Breadth First Search"
      />
    );

    expect(complexityScene).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithmKey: 'bfs',
        complexityDataset: 'pathfinding',
        algorithmName: 'Breadth First Search',
        exportTheme: 'dark',
      })
    );
    expect(screen.getByTestId('complexity-scene')).toBeInTheDocument();
  });

  it('routes searching exports to searching complexity dataset', () => {
    useCurrentFrame.mockReturnValue(6);

    render(
      <AlgorithmVideo
        steps={[{ description: 's' }]}
        algorithmType="searching"
        algorithmKey="binarySearch"
        algorithmName="Binary Search"
      />
    );

    expect(complexityScene).toHaveBeenCalledWith(
      expect.objectContaining({
        algorithmKey: 'binarySearch',
        complexityDataset: 'searching',
        algorithmName: 'Binary Search',
        exportTheme: 'dark',
      })
    );
  });
});
