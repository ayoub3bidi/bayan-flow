/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Blockly's message bundles per app language, loaded on demand.
 */

const BLOCKLY_LOCALES = {
  en: () => import('blockly/msg/en'),
  fr: () => import('blockly/msg/fr'),
  ar: () => import('blockly/msg/ar'),
};

/**
 * The language's Blockly messages, falling back to English if they fail to
 * load. Rejects only when English fails too.
 * @param {string} language - two-letter code
 */
export async function loadBlocklyLocale(language) {
  try {
    return await (BLOCKLY_LOCALES[language] ?? BLOCKLY_LOCALES.en)();
  } catch (error) {
    if (language === 'en' || !BLOCKLY_LOCALES[language]) throw error;
    return BLOCKLY_LOCALES.en();
  }
}
