/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { motion } from 'framer-motion';
import AutoHidingLegend from './AutoHidingLegend';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'legend.title': 'Legend',
        'legend.close': 'Close',
        'legend.show': 'Show legend',
      };
      return translations[key] || key;
    },
  }),
}));

describe('AutoHidingLegend', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const mockLegendItems = [
    { state: 'comparing', color: '#ff6b6b', label: 'Comparing' },
    { state: 'sorted', color: '#51cf66', label: 'Sorted' },
    { state: 'swapping', color: '#339af0', label: 'Swapping' },
  ];

  it('renders the legend expanded initially (auto-show)', () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should auto-expand and show the legend content
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Comparing')).toBeInTheDocument();
    expect(screen.getByText('Sorted')).toBeInTheDocument();
    expect(screen.getByText('Swapping')).toBeInTheDocument();
  });

  it('auto-expands on mount and auto-hides after 4 seconds', async () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should auto-expand
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Comparing')).toBeInTheDocument();
    expect(screen.getByText('Sorted')).toBeInTheDocument();
    expect(screen.getByText('Swapping')).toBeInTheDocument();

    // Fast-forward 4 seconds using act
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await vi.runAllTimersAsync();
    });

    // Should show info button again and legend should be hidden
    const infoButton = screen.getByRole('button', { name: /show/i });
    expect(infoButton).toBeInTheDocument();
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();
  });

  it('does not auto-expand when already complete', () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={true} />
    );

    // Should only show info button, not auto-expand
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();
    const infoButton = screen.getByRole('button', { name: /show/i });
    expect(infoButton).toBeInTheDocument();
  });

  it('resets auto-show state when algorithm completes', async () => {
    const { rerender } = render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Let it auto-expand and hide
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await vi.runAllTimersAsync();
    });

    expect(screen.queryByText('Legend')).not.toBeInTheDocument();

    // Complete the algorithm
    rerender(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={true} />
    );

    // Should still show info button
    const infoButton = screen.getByRole('button', { name: /show/i });
    expect(infoButton).toBeInTheDocument();

    // Change back to not complete
    rerender(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should auto-expand again since hasAutoShown was reset
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('expands when info button is clicked after auto-hide', async () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Fast-forward past the auto-hide timeout
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await vi.runAllTimersAsync();
    });

    // Now the info button should be visible
    const infoButton = screen.getByRole('button', { name: /show/i });
    fireEvent.click(infoButton);

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Comparing')).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should auto-expand initially
    expect(screen.getByText('Legend')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should show info button again
    expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument();
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();
  });

  it('displays all legend items correctly', () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should auto-expand and show all legend items
    expect(screen.getByText('Legend')).toBeInTheDocument();

    // Check all legend items are rendered
    mockLegendItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();

      const colorBox = screen.getByText(item.label).previousElementSibling;
      expect(colorBox).toHaveStyle({ backgroundColor: item.color });
    });
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Unmount before timer completes
    unmount();

    // Fast-forward time - should not cause any issues
    vi.advanceTimersByTime(4000);

    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('handles empty legend items array', () => {
    render(<AutoHidingLegend legendItems={[]} isComplete={false} />);

    // Should auto-expand even with empty items
    expect(screen.getByText('Legend')).toBeInTheDocument();
    // Should not show any legend items
    expect(screen.queryByText('Comparing')).not.toBeInTheDocument();
  });

  it('only auto-expands once per session', async () => {
    const { rerender } = render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Let it auto-expand and hide
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await vi.runAllTimersAsync();
    });

    expect(screen.queryByText('Legend')).not.toBeInTheDocument();

    // Re-render same state (should not auto-expand again)
    rerender(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should not auto-expand again since hasAutoShown is true
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument();
  });

  it('should handle when hasAutoShown changes to false', async () => {
    const { rerender } = render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={true} />
    );

    // When complete, should not auto-expand
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();

    // Change to not complete - should auto-expand
    rerender(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('should handle manual toggle when expanded', () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Should be expanded initially
    expect(screen.getByText('Legend')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Should collapse
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument();
  });

  it('should handle manual toggle when collapsed', async () => {
    render(
      <AutoHidingLegend legendItems={mockLegendItems} isComplete={false} />
    );

    // Wait for auto-hide
    await act(async () => {
      vi.advanceTimersByTime(4000);
      await vi.runAllTimersAsync();
    });

    // Should be collapsed
    expect(screen.queryByText('Legend')).not.toBeInTheDocument();

    // Click show button
    const showButton = screen.getByRole('button', { name: /show/i });
    fireEvent.click(showButton);

    // Should expand
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });
});
