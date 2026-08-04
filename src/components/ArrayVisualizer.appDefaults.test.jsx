/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderWithProviders, screen } from '../test/testUtils';
import ArrayVisualizer from './ArrayVisualizer';
import i18n from '../i18n';

vi.mock('./ComplexityPanel', () => ({
  default: () => <div data-testid="complexity-panel">Complexity</div>,
}));

vi.mock('./SwipeTutorial', () => ({
  default: ({ show }) =>
    show ? <div data-testid="swipe-tutorial">Swipe</div> : null,
}));

describe('ArrayVisualizer /app defaults', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    array: [3, 1, 2],
    states: ['default', 'comparing', 'default'],
    description: 'algorithms.descriptions.bubbleSort',
    algorithm: 'bubbleSort',
    onStepForward: vi.fn(),
    onStepBackward: vi.fn(),
    mode: 'manual',
    isComplete: false,
  };

  it('keeps legend, caption, and application role when demo props are omitted', () => {
    renderWithProviders(<ArrayVisualizer {...baseProps} />);

    // Legend auto-expands on mount; close control proves chrome is present
    expect(screen.getByLabelText(i18n.t('legend.close'))).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('application', {
        name: 'Array visualization - Swipe left/right to navigate steps',
      })
    ).toBeInTheDocument();
  });

  it('still opens the complexity panel after completion', async () => {
    renderWithProviders(<ArrayVisualizer {...baseProps} isComplete />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('complexity-panel')).toBeInTheDocument();
  });

  it('hero demo flags hide legend and complexity while allowing caption', async () => {
    renderWithProviders(
      <ArrayVisualizer
        {...baseProps}
        mode="autoplay"
        showChrome={false}
        showCaption
        interactive={false}
      />
    );

    expect(
      screen.queryByLabelText(i18n.t('legend.show'))
    ).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByTestId('complexity-panel')).not.toBeInTheDocument();
  });
});
