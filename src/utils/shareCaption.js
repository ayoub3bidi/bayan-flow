/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { PRODUCTION_ORIGIN } from '../constants/siteSeo.js';

/**
 * Generate a smart caption for social media sharing.
 * @param {string | null} algorithmName - Display name of the algorithm
 * @returns {{ caption: string, title: string, fullShareText: string }}
 */
export function generateShareCaption(algorithmName) {
  const name = algorithmName || 'Algorithm';
  const displayName = name.toLowerCase().endsWith('algorithm')
    ? name
    : `${name} Algorithm`;

  const caption = `${displayName}. Step-by-step visualization from Bayan Flow.`;
  const title = `${name} Visualization — Bayan Flow`;
  const fullShareText = `${caption}\n\n${PRODUCTION_ORIGIN}/app`;

  return { caption, title, fullShareText };
}
