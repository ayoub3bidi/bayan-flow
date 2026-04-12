/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import i18n from '../i18n';

/**
 * Many steps store human text from getAlgorithmDescription() (resolved at step build).
 * Initial steps often store an i18n key (e.g. algorithms.descriptions.bubbleSort) that
 * the UI resolves with t(description). Remotion export must resolve the same keys.
 *
 * @param {string | undefined | null} description
 * @param {string} [lng] - i18n language code (e.g. from export); uses current language if omitted
 * @returns {string}
 */
export function resolveStepDescription(description, lng) {
  if (description == null || description === '') return '';
  if (typeof description !== 'string') return String(description);
  const opts = lng ? { lng } : undefined;
  if (i18n.exists(description, opts)) {
    return i18n.t(description, opts);
  }
  return description;
}
