/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './index';
import { ALGORITHM_KNOWLEDGE } from '../constants/algorithmKnowledge';
import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';
import ar from './locales/ar/translation.json';

const LOCALE_RESOURCES = { en, fr, ar };

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

  it('should provide a use-case string for every algorithm in all locales', () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);
    expect(algorithmKeys.length).toBeGreaterThan(0);

    for (const lang of ['en', 'fr', 'ar']) {
      const uses = LOCALE_RESOURCES[lang].algorithmUses;
      for (const key of algorithmKeys) {
        const result = uses[key];
        expect(result, `missing algorithmUses.${key} in ${lang}`).toBeTruthy();
        expect(String(result).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('should provide an algorithm tip string for every algorithm in all locales', () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);
    expect(algorithmKeys.length).toBeGreaterThan(0);

    for (const lang of ['en', 'fr', 'ar']) {
      const tips = LOCALE_RESOURCES[lang].algorithmTips;
      for (const key of algorithmKeys) {
        const result = tips[key];
        expect(result, `missing algorithmTips.${key} in ${lang}`).toBeTruthy();
        expect(String(result).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('should not duplicate the use-case string in the algorithm tip', () => {
    const algorithmKeys = Object.keys(ALGORITHM_KNOWLEDGE);

    for (const lang of ['en', 'fr', 'ar']) {
      const uses = LOCALE_RESOURCES[lang].algorithmUses;
      const tips = LOCALE_RESOURCES[lang].algorithmTips;
      for (const key of algorithmKeys) {
        const use = uses[key];
        const tip = tips[key];
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
