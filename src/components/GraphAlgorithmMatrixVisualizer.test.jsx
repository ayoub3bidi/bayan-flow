/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmMatrixVisualizer from './GraphAlgorithmMatrixVisualizer.jsx';

describe('GraphAlgorithmMatrixVisualizer', () => {
  it('renders matrix badges when graphArtifacts are provided', () => {
    render(
      <GraphAlgorithmMatrixVisualizer
        matrix={{
          rowLabels: ['A'],
          columnLabels: ['A'],
          cells: [['0']],
          cellStates: [['current']],
        }}
        graphArtifacts={{
          badges: [{ id: 'k', text: 'Intermediate: A' }],
        }}
        description=""
        isComplete={false}
        algorithm="floydWarshallAlgorithm"
      />
    );

    expect(screen.getByText('Intermediate: A')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('keeps the completed matrix visible briefly before showing complexity', () => {
    vi.useFakeTimers();

    try {
      render(
        <GraphAlgorithmMatrixVisualizer
          matrix={{
            rowLabels: ['A'],
            columnLabels: ['A'],
            cells: [['0']],
            cellStates: [['default']],
          }}
          graphArtifacts={{ badges: [] }}
          description=""
          isComplete
          algorithm="floydWarshallAlgorithm"
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText('Complexity Analysis')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Complexity Analysis')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
