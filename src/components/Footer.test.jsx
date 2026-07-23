/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import Footer from './Footer';
import i18n from '../i18n';
import { ConsentProvider } from '../contexts/ConsentContext.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderFooter() {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <ConsentProvider>
          <Footer />
        </ConsentProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
}

describe('Footer', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    await i18n.changeLanguage('en');
  });

  it('renders privacy and terms links', () => {
    renderFooter();

    expect(screen.getByText(i18n.t('footer.privacy'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.terms'))).toBeInTheDocument();
  });

  it('navigates to privacy policy on click', () => {
    renderFooter();

    fireEvent.click(screen.getByText(i18n.t('footer.privacy')));
    expect(mockNavigate).toHaveBeenCalledWith('/privacy');
  });

  it('navigates to terms of use on click', () => {
    renderFooter();

    fireEvent.click(screen.getByText(i18n.t('footer.terms')));
    expect(mockNavigate).toHaveBeenCalledWith('/terms');
  });

  it('renders pro plan link', () => {
    renderFooter();

    const link = screen.getByRole('link', {
      name: i18n.t('footer.proPlan'),
    });
    expect(link).toHaveAttribute('href', '/pro');
  });

  it('navigates to pro page on click', () => {
    renderFooter();

    const link = screen.getByRole('link', {
      name: i18n.t('footer.proPlan'),
    });
    expect(link).toHaveAttribute('href', '/pro');
    fireEvent.click(link);
  });

  it('cookie preferences button resets consent and reopens banner', () => {
    localStorage.setItem(
      'bayanflow:cookie-consent',
      JSON.stringify({ analytics: true, timestamp: Date.now() })
    );
    renderFooter();

    const btn = screen.getByText(i18n.t('footer.cookiePreferences'));
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(localStorage.getItem('bayanflow:cookie-consent')).toBeNull();
  });
});
