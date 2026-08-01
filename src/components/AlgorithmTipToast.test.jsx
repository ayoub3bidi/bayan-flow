/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderWithI18n, screen, fireEvent } from '../test/testUtils';
import AlgorithmTipToast from './AlgorithmTipToast';

describe('AlgorithmTipToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the tip title and use-case message for the algorithm', () => {
    renderWithI18n(
      <AlgorithmTipToast algorithmKey="dijkstra" onClose={vi.fn()} />
    );

    expect(screen.getByText('Why it matters')).toBeInTheDocument();
    expect(screen.getByText(/GPS routing/)).toBeInTheDocument();
  });

  it('exposes the message to assistive technology', () => {
    renderWithI18n(
      <AlgorithmTipToast algorithmKey="dijkstra" onClose={vi.fn()} />
    );

    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <AlgorithmTipToast algorithmKey="dijkstra" onClose={onClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after 4 seconds', () => {
    const onClose = vi.fn();
    renderWithI18n(
      <AlgorithmTipToast algorithmKey="dijkstra" onClose={onClose} />
    );

    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
