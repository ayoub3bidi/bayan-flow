/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

export const EXPORT_SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'];

/**
 * Remotion export uses i18n.t(..., { lng }) — normalize to a bundled locale.
 * @param {string | undefined | null} lng
 * @returns {'en'|'fr'|'ar'}
 */
export function normalizeExportLanguage(lng) {
  if (lng == null || lng === '') return 'en';
  const base = String(lng).split('-')[0].toLowerCase();
  return EXPORT_SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
}
