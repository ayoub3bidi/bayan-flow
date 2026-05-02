/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Responsive grid column classes for the landing algorithm-type cards.
 *
 * @param {number} modeCount — number of category cards rendered
 * @returns {string} Tailwind classes (without `grid gap-8`)
 */
export function getAlgorithmTypesGridColsClass(modeCount) {
  if (modeCount === 2) {
    return 'md:grid-cols-2';
  }
  return 'md:grid-cols-2 lg:grid-cols-3';
}
