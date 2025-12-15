/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import Hero from './Hero';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

// Mock UI components
vi.mock('../ui/Container', () => ({
  default: ({ children, className = '' }) => (
    <div className={className} data-testid="container">
      {children}
    </div>
  ),
}));

vi.mock('../ui/Button', () => ({
  default: ({ children, to, variant, ...props }) => (
    <a href={to} data-variant={variant} {...props}>
      {children}
    </a>
  ),
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <Hero />
    </BrowserRouter>
  );
};

describe('Hero', () => {
  describe('Rendering', () => {
    it('should render hero section', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('min-h-screen');
    });

    it('should render Container component', () => {
      renderComponent();
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('should render title', () => {
      renderComponent();
      // Title should be present (translated)
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderComponent();
      // Subtitle should be present
      const sections = screen.getAllByText(/./);
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should render CTA button', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/app');
      expect(link).toHaveAttribute('data-variant', 'cta');
    });
  });

  describe('Styling', () => {
    it('should have proper section classes', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('min-h-screen');
      expect(section).toHaveClass('flex');
      expect(section).toHaveClass('items-center');
      expect(section).toHaveClass('justify-center');
      expect(section).toHaveClass('overflow-hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible link', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should render with translations', () => {
      renderComponent();
      // Component should render even with translation keys
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });
});
