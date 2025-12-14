/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from './Button';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      button: ({ children, ...props }) => (
        <button {...props}>{children}</button>
      ),
      a: ({ children, ...props }) => <a {...props}>{children}</a>,
    },
  };
});

const renderButton = (props = {}) => {
  return render(
    <BrowserRouter>
      <Button {...props}>Click me</Button>
    </BrowserRouter>
  );
};

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with default primary variant', () => {
      renderButton();
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with primary variant classes', () => {
      renderButton({ variant: 'primary' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-theme-primary');
    });

    it('should render with secondary variant classes', () => {
      renderButton({ variant: 'secondary' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-surface');
    });

    it('should render with ghost variant classes', () => {
      renderButton({ variant: 'ghost' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should apply custom className', () => {
      renderButton({ className: 'custom-class' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render children correctly', () => {
      render(
        <BrowserRouter>
          <Button>Custom Text</Button>
        </BrowserRouter>
      );
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });
  });

  describe('CTA Variant', () => {
    it('should render CTA variant with special styling', () => {
      renderButton({ variant: 'cta' });
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // CTA has a span with the animation class
      const animatedSpan = button.querySelector('span[class*="animate"]');
      expect(animatedSpan).toBeInTheDocument();
    });

    it('should have spinning border animation', () => {
      renderButton({ variant: 'cta' });
      const button = screen.getByRole('button');
      const animatedSpan = button.querySelector('span');
      expect(animatedSpan?.className).toContain('animate');
    });

    it('should render with dark background', () => {
      renderButton({ variant: 'cta' });
      const button = screen.getByRole('button');
      const textSpan = button.querySelector('span[class*="bg-slate"]');
      expect(textSpan).toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should render as Link when to prop is provided', () => {
      render(
        <BrowserRouter>
          <Button to="/test">Click me</Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render as external link when href prop is provided', () => {
      render(
        <BrowserRouter>
          <Button href="https://example.com">Click me</Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should support target prop for external links', () => {
      render(
        <BrowserRouter>
          <Button href="https://example.com" target="_blank">
            Click me
          </Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should render CTA variant as Link', () => {
      render(
        <BrowserRouter>
          <Button variant="cta" to="/test">
            Click me
          </Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render CTA variant as external link', () => {
      render(
        <BrowserRouter>
          <Button variant="cta" href="https://example.com">
            Click me
          </Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Click Handling', () => {
    it('should call onClick handler', () => {
      const onClick = vi.fn();
      renderButton({ onClick });
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('should call onClick for CTA variant', () => {
      const onClick = vi.fn();
      renderButton({ variant: 'cta', onClick });
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('should not call onClick for link variants', () => {
      const onClick = vi.fn();
      render(
        <BrowserRouter>
          <Button to="/test" onClick={onClick}>
            Click me
          </Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      renderButton();
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should support aria props', () => {
      renderButton({ 'aria-label': 'Test button' });
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Test button');
    });

    it('should have proper role for buttons', () => {
      renderButton();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have proper role for links', () => {
      render(
        <BrowserRouter>
          <Button to="/test">Click me</Button>
        </BrowserRouter>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward additional props', () => {
      renderButton({
        'data-testid': 'custom-button',
        disabled: false,
      });
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('should preserve className with custom additions', () => {
      renderButton({
        className: 'mt-4 mb-2',
        variant: 'primary',
      });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('mt-4', 'mb-2', 'bg-theme-primary');
    });
  });

  describe('Content Rendering', () => {
    it('should render with icon and text', () => {
      render(
        <BrowserRouter>
          <Button>
            <span>Icon</span>
            <span>Text</span>
          </Button>
        </BrowserRouter>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should handle HTML content', () => {
      render(
        <BrowserRouter>
          <Button>
            <em>Emphasized</em> text
          </Button>
        </BrowserRouter>
      );
      expect(screen.getByText('Emphasized')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have touch-friendly min height', () => {
      renderButton();
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-touch');
    });

    it('should have proper padding for touch targets', () => {
      renderButton();
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(
        <BrowserRouter>
          <Button></Button>
        </BrowserRouter>
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined variant with primary default', () => {
      render(
        <BrowserRouter>
          <Button variant={undefined}>Click me</Button>
        </BrowserRouter>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-theme-primary');
    });

    it('should handle both to and href (to takes precedence)', () => {
      render(
        <BrowserRouter>
          <Button to="/test" href="https://example.com">
            Click me
          </Button>
        </BrowserRouter>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });
  });
});
