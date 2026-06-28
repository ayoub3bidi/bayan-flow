/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import { MemoryRouter } from 'react-router-dom';
import LegalDocument from './LegalDocument';
import i18n from '../i18n';

vi.mock('./Footer', () => ({
  default: () => <footer data-testid="legal-footer">Footer</footer>,
}));

vi.mock('./ThemeToggle', () => ({
  default: () => <button type="button">Theme</button>,
}));

vi.mock('./LanguageSwitcher', () => ({
  default: () => <div>Language</div>,
}));

const sampleSections = [
  {
    id: 'intro',
    title: 'Introduction',
    paragraphs: ['First paragraph.', 'Second paragraph.'],
  },
  {
    id: 'details',
    title: 'Details',
    paragraphs: ['Overview.'],
    list: ['Bullet one', 'Bullet two'],
  },
];

const renderLegalDocument = () =>
  renderWithI18n(
    <MemoryRouter>
      <LegalDocument
        title="Sample Policy"
        lastUpdated="2026-06-21"
        sections={sampleSections}
      />
    </MemoryRouter>
  );

describe('LegalDocument', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    window.scrollTo = vi.fn();
  });

  it('renders title, last updated, and section content', () => {
    renderLegalDocument();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sample Policy' })
    ).toBeInTheDocument();
    expect(screen.getByText('Last updated: 2026-06-21')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Introduction' })
    ).toBeInTheDocument();
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Bullet one')).toBeInTheDocument();
    expect(screen.getByTestId('legal-footer')).toBeInTheDocument();
  });

  it('scrolls to top when no hash fragment is present', () => {
    renderLegalDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('preserves scroll position when a hash fragment is present', () => {
    window.location.hash = '#intro';
    renderLegalDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
    window.location.hash = '';
  });

  it('links back to the home page', () => {
    renderLegalDocument();

    expect(screen.getByRole('link', { name: 'Bayan Flow' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
