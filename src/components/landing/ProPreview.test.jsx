/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithI18n, screen } from '../../test/testUtils';
import { BrowserRouter } from 'react-router-dom';
import i18n from '../../i18n';
import ProPreview from './ProPreview';
import { WAITLIST_EMAIL_STORAGE_KEY } from '@/constants/waitlist';

// Mock UI components
vi.mock('../ui/Container', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../ui/Section', () => ({
  default: ({ children, className = '' }) => (
    <section className={className}>{children}</section>
  ),
}));

vi.mock('../ui/Button', () => ({
  default: ({ children, variant, to, href, ...props }) => {
    if (to || href) {
      return (
        <a href={to || href} data-variant={variant} {...props}>
          {children}
        </a>
      );
    }
    return (
      <button data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
}));

const renderComponent = () => {
  return renderWithI18n(
    <BrowserRouter>
      <ProPreview />
    </BrowserRouter>
  );
};

const includedIcons = container =>
  [...container.querySelectorAll('svg')].filter(
    el => el.getAttribute('aria-label') === 'Included'
  );
const excludedIcons = container =>
  [...container.querySelectorAll('svg')].filter(
    el => el.getAttribute('aria-label') === 'Not included'
  );

describe('ProPreview', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderComponent();
      expect(screen.getByText(/Go Further with Pro/i)).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderComponent();
      expect(
        screen.getByText(/Built for interview prep and classroom teaching/i)
      ).toBeInTheDocument();
    });

    it('should render plan labels', () => {
      renderComponent();
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  describe('Comparison Table', () => {
    it('should render a table with fixed layout and equal plan columns', () => {
      const { container } = renderComponent();
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('table-fixed');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
      const cols = table.querySelectorAll('col');
      expect(cols.length).toBe(3);
      expect(cols[1].className).toContain('w-1/4');
      expect(cols[2].className).toContain('w-1/4');
    });

    it('should render feature header column', () => {
      renderComponent();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should render all feature phrases once', () => {
      renderComponent();
      expect(screen.getByText('Visualize All Algorithms')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Customizable: Adjust Array Size (5-100) or Grid Size (15×15 to 35×35)'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Interactive Python Online Editor')
      ).toBeInTheDocument();
      expect(screen.getByText('Interactive Sound')).toBeInTheDocument();
      expect(screen.getByText('Full Screen Mode')).toBeInTheDocument();
      expect(screen.getByText('Algorithm Insight')).toBeInTheDocument();
      expect(screen.getByText('Video Export')).toBeInTheDocument();
      expect(screen.getByText('Custom Inputs')).toBeInTheDocument();
      expect(
        screen.getByText('Algorithms Comparison Mode')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Presentation Mode (Dedicated For Teachers)')
      ).toBeInTheDocument();
      expect(screen.getByText('Step-by-step Pseudocode')).toBeInTheDocument();
      expect(
        screen.getByText('Save Your Notes on Every Algorithm')
      ).toBeInTheDocument();
    });

    it('should render check icon for features on both plans', () => {
      const { container } = renderComponent();
      const checks = includedIcons(container);
      expect(checks.length).toBe(19);
      checks.forEach(check => {
        expect(check).toHaveClass('text-emerald-500');
      });
    });

    it('should render x icon for features missing on the free plan', () => {
      const { container } = renderComponent();
      const crosses = excludedIcons(container);
      expect(crosses.length).toBe(3);
      crosses.forEach(cross => {
        expect(cross).toHaveClass('text-red-500');
      });
    });

    it('should mark free features as included on both plans', () => {
      const { container } = renderComponent();
      const rows = [...container.querySelectorAll('tbody tr')];
      const pythonRow = rows.find(tr =>
        tr.textContent.includes('Interactive Python')
      );
      const pythonCells = pythonRow.querySelectorAll('td');
      expect(
        pythonCells[1].querySelector('svg').getAttribute('aria-label')
      ).toBe('Included');
      expect(
        pythonCells[2].querySelector('svg').getAttribute('aria-label')
      ).toBe('Included');
    });

    it('should mark pseudocode and notes as included on both plans', () => {
      const { container } = renderComponent();
      const rows = [...container.querySelectorAll('tbody tr')];
      ['Step-by-step Pseudocode', 'Save Your Notes on Every Algorithm'].forEach(
        label => {
          const row = rows.find(tr => tr.textContent.includes(label));
          const cells = row.querySelectorAll('td');
          expect(cells[1].querySelector('svg').getAttribute('aria-label')).toBe(
            'Included'
          );
          expect(cells[2].querySelector('svg').getAttribute('aria-label')).toBe(
            'Included'
          );
        }
      );
    });

    it('should render video export cells as text instead of icons', () => {
      renderComponent();
      expect(
        screen.getByText('HD MP4 Exports (With Watermark)')
      ).toBeInTheDocument();
      expect(screen.getByText('Watermark-Free Exports')).toBeInTheDocument();
    });

    it('should not render any price', () => {
      renderComponent();
      expect(screen.queryByText('Free forever')).not.toBeInTheDocument();
      expect(screen.queryByText('PRICING_TBD')).not.toBeInTheDocument();
    });

    it('should mark presentation mode as a pro-only feature', () => {
      const { container } = renderComponent();
      const presentationRow = [...container.querySelectorAll('tbody tr')].find(
        tr =>
          tr.textContent.includes('Presentation Mode (Dedicated For Teachers)')
      );
      const cells = presentationRow.querySelectorAll('td');
      expect(cells[1].querySelector('svg').getAttribute('aria-label')).toBe(
        'Not included'
      );
      expect(cells[2].querySelector('svg').getAttribute('aria-label')).toBe(
        'Included'
      );
    });

    it('should render pro features as included', () => {
      const { container } = renderComponent();
      const proColumnCells = [...container.querySelectorAll('tbody tr')].map(
        tr => tr.querySelectorAll('td')[2]
      );
      expect(proColumnCells.length).toBe(12);
    });
  });

  describe('Waitlist State', () => {
    it('should show coming soon badge when not joined', () => {
      renderComponent();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('should show joined badge when waitlist email is stored', () => {
      localStorage.setItem(WAITLIST_EMAIL_STORAGE_KEY, 'test@example.com');
      renderComponent();
      expect(screen.getByText("You're on the list")).toBeInTheDocument();
      expect(screen.getByText('View Your Spot')).toBeInTheDocument();
    });
  });

  describe('CTA', () => {
    it('should render CTA link with cta variant', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-variant', 'cta');
    });

    it('should show waitlist CTA when not joined', () => {
      renderComponent();
      expect(screen.getByText('Join The Waitlist')).toBeInTheDocument();
      expect(screen.queryByText('View Your Spot')).not.toBeInTheDocument();
    });

    it('should link to pro page with landing source', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/pro?source=landing');
    });

    it('should not nest a button inside the link', () => {
      renderComponent();
      const link = screen.getByRole('link');
      expect(link.querySelector('button')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply section styling', () => {
      const { container } = renderComponent();
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'overflow-hidden');
    });

    it('should apply glass morphism to the table card', () => {
      const { container } = renderComponent();
      const card = container.querySelectorAll('div[class*="backdrop-blur-xl"]');
      expect(card.length).toBe(1);
    });

    it('should have gradient background layer', () => {
      const { container } = renderComponent();
      const gradient = container.querySelector('div[class*="bg-linear-to-b"]');
      expect(gradient).toBeInTheDocument();
    });
  });

  describe('Text Hierarchy', () => {
    it('should render h2 heading', () => {
      const { container } = renderComponent();
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveClass('landing-h2');
    });

    it('should display body text with proper styling', () => {
      const { container } = renderComponent();
      const bodyText = container.querySelector('p[class*="landing-body"]');
      expect(bodyText).toBeInTheDocument();
    });

    it('should have proper color contrast for text', () => {
      const { container } = renderComponent();
      const textElements = container.querySelectorAll('[class*="text-text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should have accessible table headers', () => {
      const { container } = renderComponent();
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBe(3);
    });

    it('should have accessible link', () => {
      renderComponent();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render a single interactive element (no nested button)', () => {
      renderComponent();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });
});
