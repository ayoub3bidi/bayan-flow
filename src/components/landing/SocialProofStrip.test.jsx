/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen } from '../../test/testUtils';
import i18n from '../../i18n';
import SocialProofStrip from './SocialProofStrip';
import { SHOW_LANDING_SOCIAL_PROOF } from './landingSocialProof';

describe('landingSocialProof', () => {
  it('keeps the strip gated off until real proof exists', () => {
    expect(SHOW_LANDING_SOCIAL_PROOF).toBe(false);
  });
});

describe('SocialProofStrip', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders honest product signals without fake metrics', () => {
    renderWithProviders(<SocialProofStrip />);

    expect(screen.getByTestId('social-proof-strip')).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('landing.socialProof.items.algorithms.value'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('landing.socialProof.items.locales.value'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('landing.socialProof.items.depth.value'))
    ).toBeInTheDocument();
  });

  it('exposes an accessible region label', () => {
    renderWithProviders(<SocialProofStrip />);
    expect(
      screen.getByLabelText(i18n.t('landing.socialProof.ariaLabel'))
    ).toBeInTheDocument();
  });
});
