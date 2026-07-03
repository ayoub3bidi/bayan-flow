/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderWithProviders, screen } from '../test/testUtils';
import ArrayVisualizer from './ArrayVisualizer';
import '../test/setup';

vi.mock('./ComplexityPanel', () => ({
  default: () => <div data-testid="complexity-panel">Complexity</div>,
}));

vi.mock('./AutoHidingLegend', () => ({
  default: () => null,
}));

vi.mock('./SwipeTutorial', () => ({
  default: () => null,
}));

vi.mock('./ArrayBar', () => ({
  default: () => <div />,
}));

describe('ArrayVisualizer complexity gate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const baseProps = {
    array: [3, 1, 2],
    states: ['default', 'default', 'default'],
    description: '',
    algorithm: 'bubbleSort',
    onStepForward: vi.fn(),
    onStepBackward: vi.fn(),
    mode: 'autoplay',
  };

  it('opens complexity_limit gate after anonymous view limit is exceeded', async () => {
    vi.useFakeTimers();
    const onGatedFeatureClick = vi.fn();

    localStorage.setItem('anon_complexity_views', '2');

    renderWithProviders(
      <ArrayVisualizer
        {...baseProps}
        isComplete
        onGatedFeatureClick={onGatedFeatureClick}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('complexity-panel')).toBeInTheDocument();
    expect(onGatedFeatureClick).toHaveBeenCalledWith('complexity_limit');

    vi.useRealTimers();
  });
});
