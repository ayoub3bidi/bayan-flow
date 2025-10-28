/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from './FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders correctly with both desktop and mobile buttons', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    // Should render two buttons (desktop and mobile)
    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    expect(buttons).toHaveLength(2);

    // Both should have proper accessibility attributes
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label', 'View Python code');
      expect(button).toHaveAttribute('title', 'View Python code');
    });
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Click the first button (desktop)
    fireEvent.click(buttons[0]);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={true} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Both buttons should be disabled
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });

    fireEvent.click(buttons[0]);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('is not disabled when disabled prop is false', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={false} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Both buttons should be enabled
    buttons.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  it('applies additional className when provided', () => {
    const mockOnClick = vi.fn();
    const customClass = 'custom-class';
    render(
      <FloatingActionButton onClick={mockOnClick} className={customClass} />
    );

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Both buttons should have the custom class
    buttons.forEach(button => {
      expect(button).toHaveClass(customClass);
    });
  });

  it('has correct positioning classes for desktop button', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Desktop button (first one) should have side positioning
    expect(buttons[0]).toHaveClass(
      'fixed',
      'right-0',
      'top-1/2',
      '-translate-y-1/2',
      'z-50'
    );
    // Mobile button (second one) should have bottom-right positioning
    expect(buttons[1]).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
  });

  it('has correct accessibility attributes', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    // Both buttons should have correct accessibility attributes
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label', 'View Python code');
      expect(button).toHaveAttribute('title', 'View Python code');
    });
  });
});
