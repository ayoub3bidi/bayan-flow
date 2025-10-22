import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('should have proper ARIA attributes for dark theme', () => {
      render(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-checked', 'true');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
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
    it('should call onToggle when clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const button = screen.getByRole('switch');
      await user.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when activated with keyboard', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const button = screen.getByRole('switch');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when activated with space key', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ThemeToggle theme="light" onToggle={onToggle} />);

      const button = screen.getByRole('switch');
      button.focus();
      await user.keyboard(' ');

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(
        <ThemeToggle
          theme="light"
          onToggle={vi.fn()}
          className="custom-class"
        />
      );

      const button = screen.getByRole('switch');
      expect(button).toHaveClass('custom-class');
    });

    it('should have focus styles', () => {
      render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

      const button = screen.getByRole('switch');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-theme-primary');
    });
  });

  describe('Theme state changes', () => {
    it('should update ARIA attributes when theme prop changes', () => {
      const { rerender } = render(
        <ThemeToggle theme="light" onToggle={vi.fn()} />
      );

      let button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<ThemeToggle theme="dark" onToggle={vi.fn()} />);

      button = screen.getByRole('switch');
      expect(button).toHaveAttribute('aria-pressed', 'true');
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
    it('should work correctly when toggling theme multiple times', async () => {
      const user = userEvent.setup();
      let currentTheme = 'light';
      const onToggle = vi.fn(() => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      });

      const { rerender } = render(
        <ThemeToggle theme={currentTheme} onToggle={onToggle} />
      );

      const button = screen.getByRole('switch');

      // First toggle
      await user.click(button);
      expect(onToggle).toHaveBeenCalledTimes(1);
      rerender(<ThemeToggle theme={currentTheme} onToggle={onToggle} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');

      // Second toggle
      await user.click(button);
      expect(onToggle).toHaveBeenCalledTimes(2);
      rerender(<ThemeToggle theme={currentTheme} onToggle={onToggle} />);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
