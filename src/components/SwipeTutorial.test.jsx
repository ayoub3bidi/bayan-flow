/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SwipeTutorial from './SwipeTutorial';

describe('SwipeTutorial', () => {
  it('renders when show is true', () => {
    render(<SwipeTutorial show={true} onDismiss={vi.fn()} />);
    expect(
      screen.getByText('Swipe left or right to go through the steps')
    ).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<SwipeTutorial show={false} onDismiss={vi.fn()} />);
    expect(
      screen.queryByText('Swipe left or right to go through the steps')
    ).not.toBeInTheDocument();
  });

  it('calls onDismiss when overlay is clicked', () => {
    const mockDismiss = vi.fn();
    render(<SwipeTutorial show={true} onDismiss={mockDismiss} />);

    const overlay = screen
      .getByText('Swipe left or right to go through the steps')
      .closest('[class*="fixed"]');
    fireEvent.click(overlay);

    expect(mockDismiss).toHaveBeenCalledOnce();
  });
});
