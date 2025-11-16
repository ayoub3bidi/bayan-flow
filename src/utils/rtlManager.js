/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * RTL Manager
 * Handles document direction (dir attribute) switching based on language
 */

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur']; // Arabic, Hebrew, Persian, Urdu

/**
 * Check if a language code requires RTL layout
 * @param {string} languageCode - The language code (e.g., 'en', 'ar', 'fr')
 * @returns {boolean} - True if the language is RTL
 */
export function isRTL(languageCode) {
  if (!languageCode) return false;

  // Handle language codes with region (e.g., 'ar-SA', 'en-US')
  const baseLanguage = languageCode.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(baseLanguage);
}

/**
 * Set the document direction based on language
 * @param {string} languageCode - The language code
 */
export function setDocumentDirection(languageCode) {
  const direction = isRTL(languageCode) ? 'rtl' : 'ltr';

  // Set dir attribute on html element
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', languageCode);
  }
}

/**
 * Get the current document direction
 * @returns {string} - 'rtl' or 'ltr'
 */
export function getDocumentDirection() {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.getAttribute('dir') || 'ltr';
}

/**
 * Initialize RTL support with i18next
 * Should be called when language changes
 * @param {Object} i18n - The i18next instance
 */
export function initRTL(i18n) {
  if (!i18n) return;

  // Set initial direction
  setDocumentDirection(i18n.language);

  // Listen for language changes
  i18n.on('languageChanged', lng => {
    setDocumentDirection(lng);
  });
}
