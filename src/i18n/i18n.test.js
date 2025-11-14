/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './index';

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset to English before each test
    i18n.changeLanguage('en');
  });

  it('should initialize with English as default', () => {
    expect(i18n.language).toBe('en');
  });

  it('should support English and French languages', () => {
    expect(i18n.options.supportedLngs).toContain('en');
    expect(i18n.options.supportedLngs).toContain('fr');
  });

  it('should translate basic keys in English', () => {
    expect(i18n.t('header.title')).toBe('Bayan Flow');
    expect(i18n.t('settings.algorithm')).toBe('Algorithm');
    expect(i18n.t('controls.play')).toBe('Play');
  });

  it('should translate basic keys in French', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('header.title')).toBe('Bayan Flow');
    expect(i18n.t('settings.algorithm')).toBe('Algorithme');
    expect(i18n.t('controls.play')).toBe('Lecture');
  });

  it('should fallback to English for missing translations', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should handle interpolation correctly', () => {
    expect(i18n.t('info.step', { current: 5, total: 10 })).toBe('Step 5 of 10');
  });

  it('should handle interpolation in French', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('info.step', { current: 5, total: 10 })).toBe(
      'Étape 5 sur 10'
    );
  });
});
