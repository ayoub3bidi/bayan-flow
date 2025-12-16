/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SwipeTutorial from './SwipeTutorial';
import i18n from '../i18n';

describe('SwipeTutorial', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders when show is true', () => {
    render(<SwipeTutorial show={true} onDismiss={vi.fn()} />);
    expect(screen.getByText('Swipe to Navigate')).toBeInTheDocument();
    expect(screen.getByText('Step Backward')).toBeInTheDocument();
    expect(screen.getByText('Step Forward')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<SwipeTutorial show={false} onDismiss={vi.fn()} />);
    expect(screen.queryByText('Swipe to Navigate')).not.toBeInTheDocument();
  });

  it('calls onDismiss when overlay is clicked', () => {
    const mockDismiss = vi.fn();
    render(<SwipeTutorial show={true} onDismiss={mockDismiss} />);

    const overlay = screen
      .getByText('Swipe to Navigate')
      .closest('[class*="fixed"]');
    fireEvent.click(overlay);

    expect(mockDismiss).toHaveBeenCalledOnce();
  });
});
