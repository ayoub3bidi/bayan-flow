/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
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
