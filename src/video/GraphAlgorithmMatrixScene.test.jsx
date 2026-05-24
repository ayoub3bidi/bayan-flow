/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GraphAlgorithmMatrixScene from './GraphAlgorithmMatrixScene.jsx';

vi.mock('remotion', () => ({
  useCurrentFrame: () => 0,
  interpolateColors: vi.fn((_value, _range, colors) => colors[1]),
}));

describe('GraphAlgorithmMatrixScene', () => {
  it('places the matrix lower in the scene while preserving room for top badges', () => {
    const { container } = render(
      <GraphAlgorithmMatrixScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[
          {
            matrix: {
              rowLabels: ['A', 'B', 'C', 'D'],
              columnLabels: ['A', 'B', 'C', 'D'],
              cells: [
                ['0', '1', '2', '3'],
                ['1', '0', '4', '5'],
                ['2', '4', '0', '6'],
                ['3', '5', '6', '0'],
              ],
              cellStates: [
                ['default', 'default', 'default', 'default'],
                ['default', 'default', 'default', 'default'],
                ['default', 'default', 'default', 'default'],
                ['default', 'default', 'default', 'default'],
              ],
            },
            graphArtifacts: {
              badges: [{ id: 'intermediate', text: 'Intermediate: A' }],
            },
          },
        ]}
      />
    );

    const firstCell = container.querySelector('rect');

    expect(firstCell).toBeInTheDocument();
    expect(Number(firstCell?.getAttribute('y'))).toBeGreaterThanOrEqual(210);
  });

  it('keeps a 6x6 matrix inside the scene safe area', () => {
    const { container } = render(
      <GraphAlgorithmMatrixScene
        framesPerStep={1}
        exportTheme="dark"
        steps={[
          {
            matrix: {
              rowLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
              columnLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
              cells: Array.from({ length: 6 }, (_, rowIndex) =>
                Array.from({ length: 6 }, (_, columnIndex) =>
                  String((rowIndex + columnIndex) % 7)
                )
              ),
              cellStates: Array.from({ length: 6 }, () =>
                Array.from({ length: 6 }, () => 'default')
              ),
            },
            graphArtifacts: {
              badges: [{ id: 'intermediate', text: 'Intermediate: C' }],
            },
          },
        ]}
      />
    );

    const firstCell = container.querySelector('rect');

    expect(firstCell).toBeInTheDocument();
    expect(Number(firstCell?.getAttribute('x'))).toBeGreaterThanOrEqual(180);
    expect(Number(firstCell?.getAttribute('y'))).toBeGreaterThanOrEqual(210);
    expect(Number(firstCell?.getAttribute('width'))).toBeGreaterThan(0);
  });
});
