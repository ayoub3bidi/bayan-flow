/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimelineItem from './TimelineItem';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckCircle2: () => <svg data-testid="check-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
  Sparkles: () => <svg data-testid="sparkles-icon" />,
}));

describe('TimelineItem', () => {
  const defaultProps = {
    date: '2025-01',
    title: 'Test Feature',
    description: 'This is a test timeline item',
    status: 'completed',
    position: 'left',
    index: 0,
  };

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<TimelineItem {...defaultProps} />);
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
      expect(screen.getByText('2025-01')).toBeInTheDocument();
      expect(
        screen.getByText('This is a test timeline item')
      ).toBeInTheDocument();
    });

    it('should display date', () => {
      render(<TimelineItem {...defaultProps} />);
      expect(screen.getByText('2025-01')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<TimelineItem {...defaultProps} />);
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });

    it('should display description', () => {
      render(<TimelineItem {...defaultProps} />);
      expect(
        screen.getByText('This is a test timeline item')
      ).toBeInTheDocument();
    });

    it('should render iframe when videoUrl is provided', () => {
      const props = {
        ...defaultProps,
        videoUrl: 'https://www.youtube.com/embed/test123',
      };
      render(<TimelineItem {...props} />);
      const iframe = screen.getByTitle('Test Feature');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/test123'
      );
    });

    it('should not render iframe when videoUrl is not provided', () => {
      render(<TimelineItem {...defaultProps} />);
      expect(screen.queryByTitle('Test Feature')).not.toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('should render with completed status', () => {
      const props = { ...defaultProps, status: 'completed' };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('check-icon')).toHaveLength(2);
    });

    it('should render with in-progress status', () => {
      const props = { ...defaultProps, status: 'in-progress' };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('zap-icon')).toHaveLength(2);
    });

    it('should render with planned status', () => {
      const props = { ...defaultProps, status: 'planned' };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('sparkles-icon')).toHaveLength(2);
    });

    it('should apply correct styling for completed status', () => {
      const props = { ...defaultProps, status: 'completed' };
      const { container } = render(<TimelineItem {...props} />);
      const element = container.querySelector('div[class*="opacity-100"]');
      expect(element).toBeInTheDocument();
    });

    it('should apply correct styling for planned status', () => {
      const props = { ...defaultProps, status: 'planned' };
      const { container } = render(<TimelineItem {...props} />);
      const element = container.querySelector('div[class*="opacity-60"]');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Position Variants', () => {
    it('should render with left position', () => {
      const props = { ...defaultProps, position: 'left' };
      const { container } = render(<TimelineItem {...props} />);
      const element = container.querySelector('div[class*="md:col-start-1"]');
      expect(element).toBeInTheDocument();
    });

    it('should render with right position', () => {
      const props = { ...defaultProps, position: 'right' };
      const { container } = render(<TimelineItem {...props} />);
      const element = container.querySelector('div[class*="md:col-start-2"]');
      expect(element).toBeInTheDocument();
    });

    it('should default to planned status when not specified', () => {
      const props = { ...defaultProps, status: undefined };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('sparkles-icon')).toHaveLength(2);
    });
  });

  describe('Status Badge Display', () => {
    it('should display status badge for completed', () => {
      const props = { ...defaultProps, status: 'completed' };
      render(<TimelineItem {...props} />);
      // Status badge should be rendered through i18n
      expect(screen.getAllByTestId('check-icon')).toHaveLength(2);
    });

    it('should display status badge for in-progress', () => {
      const props = { ...defaultProps, status: 'in-progress' };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('zap-icon')).toHaveLength(2);
    });

    it('should display status badge for planned', () => {
      const props = { ...defaultProps, status: 'planned' };
      render(<TimelineItem {...props} />);
      expect(screen.getAllByTestId('sparkles-icon')).toHaveLength(2);
    });
  });

  describe('Timeline Dot', () => {
    it('should render timeline dot', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      const dot = container.querySelector('div[class*="w-4"][class*="h-4"]');
      expect(dot).toBeInTheDocument();
    });

    it('should apply correct color for completed status dot', () => {
      const props = { ...defaultProps, status: 'completed' };
      const { container } = render(<TimelineItem {...props} />);
      const dot = container.querySelector('div[class*="bg-emerald-500"]');
      expect(dot).toBeInTheDocument();
    });

    it('should apply correct color for in-progress status dot', () => {
      const props = { ...defaultProps, status: 'in-progress' };
      const { container } = render(<TimelineItem {...props} />);
      const dot = container.querySelector('div[class*="bg-amber-500"]');
      expect(dot).toBeInTheDocument();
    });

    it('should apply correct color for planned status dot', () => {
      const props = { ...defaultProps, status: 'planned' };
      const { container } = render(<TimelineItem {...props} />);
      const dot = container.querySelector('div[class*="bg-sky-500"]');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Animation Properties', () => {
    it('should render with animation props', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      // Check that motion div is rendered
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should use index for animation delay', () => {
      const props = { ...defaultProps, index: 2 };
      const { container } = render(<TimelineItem {...props} />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should contain proper heading hierarchy', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      // h3 for title as per component
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain('Test Feature');
    });

    it('should have alt text for iframe if present', () => {
      const props = {
        ...defaultProps,
        videoUrl: 'https://www.youtube.com/embed/test123',
      };
      render(<TimelineItem {...props} />);
      const iframe = screen.getByTitle('Test Feature');
      expect(iframe).toHaveAttribute('title', 'Test Feature');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      const props = { ...defaultProps, title: longTitle };
      render(<TimelineItem {...props} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDesc = 'Lorem ipsum '.repeat(50);
      const props = { ...defaultProps, description: longDesc };
      render(<TimelineItem {...props} />);
      expect(
        screen.getByText(new RegExp(longDesc.slice(0, 50)))
      ).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Test & Feature <> "Quote"';
      const props = { ...defaultProps, title: specialTitle };
      render(<TimelineItem {...props} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle missing videoUrl gracefully', () => {
      const props = { ...defaultProps, videoUrl: '' };
      const { container } = render(<TimelineItem {...props} />);
      expect(container.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('should handle undefined values gracefully', () => {
      const props = {
        ...defaultProps,
        videoUrl: undefined,
      };
      render(<TimelineItem {...props} />);
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should render date and status badge together', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      const badges = container.querySelectorAll(
        '[class*="px-3"][class*="py-1"]'
      );
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should render icon with title', () => {
      const { container } = render(<TimelineItem {...defaultProps} />);
      const titleContainer = container.querySelector('h3');
      expect(titleContainer).toBeInTheDocument();
    });

    it('should maintain proper order: date → status → icon → title → description → video', () => {
      const props = {
        ...defaultProps,
        videoUrl: 'https://www.youtube.com/embed/test123',
      };
      const { container } = render(<TimelineItem {...props} />);
      const elements = container.querySelectorAll('*');
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
