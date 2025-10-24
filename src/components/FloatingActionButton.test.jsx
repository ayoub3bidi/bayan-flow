/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButton from './FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders correctly', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'View Python code');
    expect(button).toHaveAttribute('title', 'View Python code');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('is not disabled when disabled prop is false', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).not.toBeDisabled();
  });

  it('applies additional className when provided', () => {
    const mockOnClick = vi.fn();
    const customClass = 'custom-class';
    render(
      <FloatingActionButton onClick={mockOnClick} className={customClass} />
    );

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).toHaveClass(customClass);
  });

  it('has correct positioning classes', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).toHaveClass(
      'fixed',
      'right-6',
      'top-1/2',
      '-translate-y-1/2',
      'z-50'
    );
  });

  it('has correct accessibility attributes', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    expect(button).toHaveAttribute('aria-label', 'View Python code');
    expect(button).toHaveAttribute('title', 'View Python code');
  });

  it('contains Code icon', () => {
    const mockOnClick = vi.fn();
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /view python code/i });
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
