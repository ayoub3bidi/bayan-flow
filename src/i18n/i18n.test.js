/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './index';
import { ALGORITHM_KNOWLEDGE } from '../constants/algorithmKnowledge';

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset to English before each test
    i18n.changeLanguage('en');
  });

  it('should initialize with English as default', () => {
    expect(i18n.language).toBe('en');
  });

  it('should support English, French, and Arabic languages', () => {
    expect(i18n.options.supportedLngs).toContain('en');
    expect(i18n.options.supportedLngs).toContain('fr');
    expect(i18n.options.supportedLngs).toContain('ar');
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

  it('should translate basic keys in Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.t('header.title')).toBe('بيان فلو');
    expect(i18n.t('settings.algorithm')).toBe('الخوارزمية');
    expect(i18n.t('controls.play')).toBe('تشغيل');
  });

  it('should handle interpolation in Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.t('info.step', { current: 5, total: 10 })).toBe(
      'الخطوة 5 من 10'
    );
  });

  it('should provide a use-case string for every algorithm in all locales', async () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);
    expect(algorithmKeys.length).toBeGreaterThan(0);

    for (const lang of ['en', 'fr', 'ar']) {
      await i18n.changeLanguage(lang);
      for (const key of algorithmKeys) {
        const result = i18n.t(`algorithmUses.${key}`);
        expect(result, `missing algorithmUses.${key} in ${lang}`).not.toBe(
          `algorithmUses.${key}`
        );
        expect(result.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('should provide an algorithm tip string for every algorithm in all locales', async () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);
    expect(algorithmKeys.length).toBeGreaterThan(0);

    for (const lang of ['en', 'fr', 'ar']) {
      await i18n.changeLanguage(lang);
      for (const key of algorithmKeys) {
        const result = i18n.t(`algorithmTips.${key}`);
        expect(result, `missing algorithmTips.${key} in ${lang}`).not.toBe(
          `algorithmTips.${key}`
        );
        expect(result.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('should not duplicate the use-case string in the algorithm tip', async () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);

    for (const lang of ['en', 'fr', 'ar']) {
      await i18n.changeLanguage(lang);
      for (const key of algorithmKeys) {
        const use = i18n.t(`algorithmUses.${key}`);
        const tip = i18n.t(`algorithmTips.${key}`);
        expect(
          tip,
          `algorithmTips.${key} in ${lang} duplicates algorithmUses.${key}`
        ).not.toBe(use);
      }
    }
  });

  it('should translate algorithm use-case labels in all locales', async () => {
    for (const lang of ['en', 'fr', 'ar']) {
      await i18n.changeLanguage(lang);
      expect(i18n.t('settings.useCases').length).toBeGreaterThan(0);
      expect(i18n.t('app.algorithmTipTitle').length).toBeGreaterThan(0);
    }
  });
});
