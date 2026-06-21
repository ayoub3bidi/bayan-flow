/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import { MemoryRouter } from 'react-router-dom';
import TermsOfUse from './TermsOfUse';
import i18n from '../i18n';

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/ThemeToggle', () => ({
  default: () => <button type="button">Theme</button>,
}));

vi.mock('../components/LanguageSwitcher', () => ({
  default: () => <div>Language</div>,
}));

describe('TermsOfUse', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders terms of use content', () => {
    renderWithI18n(
      <MemoryRouter>
        <TermsOfUse />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Terms of Use' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Elastic License/i)).toBeInTheDocument();
    expect(screen.getByText(/AS IS/i)).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
