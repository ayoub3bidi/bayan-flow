/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { ConsentProvider } from '../contexts/ConsentContext';
import CookieConsentBanner from './CookieConsentBanner';

const STORAGE_KEY = 'bayanflow:cookie-consent';

function renderBanner() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <ConsentProvider>
          <CookieConsentBanner />
        </ConsentProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('CookieConsentBanner', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('renders banner when no consent stored', () => {
    renderBanner();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('consent.message'))).toBeInTheDocument();
  });

  it('does not render banner when consent is already stored', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ analytics: true, timestamp: Date.now() })
    );
    renderBanner();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders accept and decline buttons', () => {
    renderBanner();
    expect(screen.getByText(i18n.t('consent.acceptAll'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('consent.declineAll'))).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    renderBanner();
    const link = screen.getByText(i18n.t('consent.privacyPolicy'));
    expect(link).toHaveAttribute('href', '/privacy');
  });

  it('hides banner after accepting', async () => {
    renderBanner();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText(i18n.t('consent.acceptAll')));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.analytics).toBe(true);
  });

  it('hides banner after declining', async () => {
    renderBanner();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText(i18n.t('consent.declineAll')));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.analytics).toBe(false);
  });

  it('banner is accessible with proper role', () => {
    renderBanner();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label');
  });
});
