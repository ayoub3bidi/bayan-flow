/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithI18n, screen, fireEvent, act } from '../../test/testUtils';
import i18n from '../../i18n';
import FAQ from './FAQ';

// Mock UI components
vi.mock('../ui/Container', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../ui/Section', () => ({
  default: ({ children, className = '' }) => (
    <section className={className}>{children}</section>
  ),
}));

const renderComponent = () => {
  return renderWithI18n(<FAQ />);
};

describe('FAQ', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = renderComponent();
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render heading', () => {
      renderComponent();
      expect(
        screen.getByText(/Frequently Asked Questions/i)
      ).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderComponent();
      expect(
        screen.getByText(/Answers for learners and instructors/i)
      ).toBeInTheDocument();
    });

    it('should render all four questions', () => {
      renderComponent();
      expect(
        screen.getByText(
          /How is this different from just watching algorithm videos/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/I'm new to algorithms and programming/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Will I actually learn it/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Do I need to install anything/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accordion Behavior', () => {
    it('should have first item open by default', () => {
      renderComponent();
      expect(
        screen.getByText(/Videos are over in 60 seconds/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/That's exactly who this is for/i)
      ).not.toBeInTheDocument();
    });

    it('should open a single item and close the previous one', () => {
      renderComponent();
      fireEvent.click(
        screen.getByText(/I'm new to algorithms and programming/i)
      );
      expect(
        screen.getByText(/That's exactly who this is for/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Videos are over in 60 seconds/i)
      ).not.toBeInTheDocument();
    });

    it('should close the open item when clicked again', () => {
      renderComponent();
      fireEvent.click(
        screen.getByText(
          /How is this different from just watching algorithm videos/i
        )
      );
      expect(
        screen.queryByText(/Videos are over in 60 seconds/i)
      ).not.toBeInTheDocument();
    });

    it('should update aria-expanded on the open item', () => {
      renderComponent();
      const firstButton = screen
        .getByText(/How is this different from just watching algorithm videos/i)
        .closest('button');
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(screen.getByText(/Do I need to install anything/i));
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic question text when language is Arabic', async () => {
      await act(async () => {
        await i18n.changeLanguage('ar');
      });
      renderComponent();
      expect(
        screen.getByText(/ما الفرق بين هذا ومشاهدة فيديوهات الخوارزميات/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/هل أحتاج إلى تثبيت أي شيء/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should wrap questions in heading elements', () => {
      const { container } = renderComponent();
      expect(container.querySelectorAll('h3').length).toBe(4);
    });

    it('should expose answer regions via aria-controls', () => {
      renderComponent();
      const button = screen
        .getByText(/How is this different from just watching algorithm videos/i)
        .closest('button');
      expect(button).toHaveAttribute('aria-controls', 'faq-answer-difference');
      expect(
        document.getElementById('faq-answer-difference')
      ).toBeInTheDocument();
    });
  });
});
