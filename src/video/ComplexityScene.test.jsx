/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComplexityScene from './ComplexityScene.jsx';

const useCurrentFrame = vi.fn();

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children }) => <div>{children}</div>,
  useCurrentFrame: () => useCurrentFrame(),
  interpolate: vi.fn(() => 0.5),
}));

vi.mock('../registry/complexityDatasetRegistry.js', () => ({
  COMPLEXITY_DATASETS: {
    sorting: {
      bubbleSort: {
        name: 'Bubble Sort',
        timeComplexity: {
          best: 'O(n)',
          average: 'O(n^2)',
          worst: 'O(n^2)',
        },
        spaceComplexity: 'O(1)',
      },
    },
    pathfinding: {
      bfs: {
        name: 'Breadth First Search',
        timeComplexity: {
          best: 'O(V + E)',
          average: 'O(V + E)',
          worst: 'O(V + E)',
        },
        spaceComplexity: 'O(V)',
      },
    },
  },
  DEFAULT_COMPLEXITY_DATASET: 'sorting',
}));

vi.mock('../constants/index.js', () => ({
  COMPLEXITY_FUNCTIONS: {
    'O(n^2)': n => n * n,
    'O(V + E)': n => n,
  },
}));

describe('ComplexityScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrentFrame.mockReturnValue(30);
  });

  it('renders complexity data for the requested dataset', () => {
    render(
      <ComplexityScene
        algorithmKey="bfs"
        complexityDataset="pathfinding"
        algorithmName=""
      />
    );

    expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    expect(screen.getByText('Breadth First Search')).toBeInTheDocument();
    expect(screen.getAllByText('O(V + E)')).toHaveLength(3);
    expect(screen.getByText('O(V)')).toBeInTheDocument();
  });

  it('falls back to the default dataset when the dataset key is unknown', () => {
    render(
      <ComplexityScene
        algorithmKey="bubbleSort"
        complexityDataset="unknown"
        algorithmName="Bubble Sort"
      />
    );

    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    expect(screen.getAllByText('O(n^2)').length).toBeGreaterThan(0);
  });

  it('renders the unavailable state for unknown algorithms', () => {
    render(
      <ComplexityScene
        algorithmKey="missing"
        complexityDataset="pathfinding"
        algorithmName="Unknown"
      />
    );

    expect(
      screen.getByText('Complexity data not available')
    ).toBeInTheDocument();
  });
});
