/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Compact GitHub-style counts (e.g. 98.5k, 1.2M).
 * @param {number} count
 * @returns {string}
 */
export const formatGitHubCount = count => {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 0) {
    return '0';
  }

  if (value >= 1_000_000) {
    const scaled = value / 1_000_000;
    const formatted =
      scaled >= 10 ? Math.round(scaled).toString() : scaled.toFixed(1);
    return `${formatted.replace(/\.0$/, '')}M`;
  }

  if (value >= 1_000) {
    const scaled = value / 1_000;
    const formatted =
      scaled >= 100 ? Math.round(scaled).toString() : scaled.toFixed(1);
    return `${formatted.replace(/\.0$/, '')}k`;
  }

  return String(Math.round(value));
};
