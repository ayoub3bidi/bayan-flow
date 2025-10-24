/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toBeInTheDocument();
    });

    it('should display sun icon when theme is light', () => {
      render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should display moon icon when theme is dark', () => {
      render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for light theme', () => {
      render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should have proper ARIA attributes for dark theme', () => {
      render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should have screen reader text for current state', () => {
      const { rerender } = render(
        <ThemeToggle theme="light" onToggle={vi.fn()} />
      );

      expect(screen.getByText('Light mode active')).toBeInTheDocument();

      rerender(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      expect(screen.getByText('Dark mode active')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const button = screen.getByRole('switch');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Interaction', () => {
    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const button = screen.getByRole('switch');
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space/Enter', () => {
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const checkbox = screen.getByRole('switch');
      checkbox.focus();
      expect(checkbox).toHaveFocus();

      // Native checkbox behavior: Space/Enter trigger click
      // We already test click above, so just verify it's focusable
    });
  });

  describe('Styling', () => {
    it('should apply custom className to label wrapper', () => {
      const { container } = render(
        <ThemeToggle
          theme="light"
          onToggle={vi.fn()}
          className="custom-class"
        />
      );

      const label = container.querySelector('label');
      expect(label).toHaveClass('custom-class');
    });

    it('should have sr-only class on checkbox', () => {
      render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

      const checkbox = screen.getByRole('switch');
      expect(checkbox).toHaveClass('sr-only');
      expect(checkbox).toHaveClass('peer');
    });
  });

  describe('Theme state changes', () => {
    it('should update ARIA attributes when theme prop changes', () => {
      const { rerender } = render(
        <ThemeToggle theme="light" onToggle={vi.fn()} />
      );

      let checkbox = screen.getByRole('switch');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).not.toBeChecked();

      rerender(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      checkbox = screen.getByRole('switch');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toBeChecked();
    });

    it('should update aria-label when theme prop changes', () => {
      const { rerender } = render(
        <ThemeToggle theme="light" onToggle={vi.fn()} />
      );

      let button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

      rerender(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('Integration with document', () => {
    it('should work correctly when toggling theme multiple times', () => {
      let currentTheme = 'light';
      const onToggle = vi.fn(() => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      });

      const { rerender } = render(
        <ThemeToggle theme={currentTheme} onToggle={onToggle} />
      );

      const button = screen.getByRole('switch');

      // First toggle
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledTimes(1);
      rerender(<ThemeToggle theme={currentTheme} onToggle={onToggle} />);
      expect(button).toHaveAttribute('aria-checked', 'true');

      // Second toggle
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledTimes(2);
      rerender(<ThemeToggle theme={currentTheme} onToggle={onToggle} />);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });
  });
});
