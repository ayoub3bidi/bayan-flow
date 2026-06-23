/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { pseudocodeStringsEn } from './strings.en.js';
import { pseudocodeStringsFr } from './strings.fr.js';
import { pseudocodeStringsAr } from './strings.ar.js';

const LOCALES = {
  en: pseudocodeStringsEn,
  fr: pseudocodeStringsFr,
  ar: pseudocodeStringsAr,
};

/**
 * @param {string | undefined} lng - i18n language code (e.g. en, fr, ar, fr-FR)
 * @returns {'en' | 'fr' | 'ar'}
 */
export function normalizePseudocodeLocale(lng) {
  if (!lng) return 'en';
  const base = String(lng).split(/[-_]/)[0]?.toLowerCase() ?? 'en';
  if (base === 'fr') return 'fr';
  if (base === 'ar') return 'ar';
  return 'en';
}

/**
 * Pseudocode for the active UI language; falls back to English, then null.
 *
 * @param {string} algorithmKey
 * @param {string | undefined} lng
 * @returns {string | null}
 */
export function getPseudocodeForLocale(algorithmKey, lng) {
  const loc = normalizePseudocodeLocale(lng);
  const primary = LOCALES[loc]?.[algorithmKey];
  if (primary) return primary;
  const fallback = LOCALES.en[algorithmKey];
  return fallback ?? null;
}

/** @deprecated Use getPseudocodeForLocale; kept for any external callers. */
export function getPseudocode(algorithmKey) {
  return getPseudocodeForLocale(algorithmKey, 'en');
}
