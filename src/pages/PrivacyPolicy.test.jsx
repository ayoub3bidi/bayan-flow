/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import i18n from '../i18n';

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

describe('PrivacyPolicy', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders privacy policy content', () => {
    renderWithI18n(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/PostHog/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Optional Google sign-in/i)).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
