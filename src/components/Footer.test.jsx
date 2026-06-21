/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import Footer from './Footer';
import i18n from '../i18n';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Footer', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    await i18n.changeLanguage('en');
  });

  it('renders privacy and terms links', () => {
    renderWithI18n(<Footer />);

    expect(screen.getByText(i18n.t('footer.privacy'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.terms'))).toBeInTheDocument();
  });

  it('navigates to privacy policy on click', () => {
    renderWithI18n(<Footer />);

    fireEvent.click(screen.getByText(i18n.t('footer.privacy')));
    expect(mockNavigate).toHaveBeenCalledWith('/privacy');
  });

  it('navigates to terms of use on click', () => {
    renderWithI18n(<Footer />);

    fireEvent.click(screen.getByText(i18n.t('footer.terms')));
    expect(mockNavigate).toHaveBeenCalledWith('/terms');
  });
});
