/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FloatingActionButton from './FloatingActionButton';

function setViewportWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

describe('FloatingActionButton', () => {
  beforeEach(() => {
    setViewportWidth(1024);
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  it('renders a single desktop button by default', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-label', 'View Python code');
    expect(buttons[0]).toHaveAttribute('title', 'View Python code');
    expect(buttons[0]).toHaveClass(
      'fixed',
      'right-0',
      'top-1/2',
      '-translate-y-1/2',
      'z-50'
    );
  });

  it('renders a mobile button when viewport is narrow', () => {
    setViewportWidth(375);
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const buttons = screen.getAllByRole('button', {
      name: /view python code/i,
    });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /view python code/i,
      })
    );

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', {
      name: /view python code/i,
    });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('is not disabled when disabled prop is false', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={false} />);

    expect(
      screen.getByRole('button', {
        name: /view python code/i,
      })
    ).not.toBeDisabled();
  });

  it('applies additional className when provided', () => {
    const mockOnClick = vi.fn();
    const customClass = 'custom-class';
    render(
      <FloatingActionButton onClick={mockOnClick} className={customClass} />
    );

    expect(
      screen.getByRole('button', {
        name: /view python code/i,
      })
    ).toHaveClass(customClass);
  });

  it('has correct accessibility attributes', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', {
      name: /view python code/i,
    });
    expect(button).toHaveAttribute('aria-label', 'View Python code');
    expect(button).toHaveAttribute('title', 'View Python code');
  });
});
