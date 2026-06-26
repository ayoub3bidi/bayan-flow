/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** Canonical production origin for SEO and social meta tags. */
export const PRODUCTION_ORIGIN = 'https://bayanflow.com';

export const OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Bayan Flow — interactive algorithm visualizer for sorting, pathfinding, searching, trees, and graphs',
};

export const DEFAULT_SITE_TITLE =
  'Bayan Flow - Interactive Algorithm Visualizer';

export const DEFAULT_SITE_DESCRIPTION =
  'Bayan Flow: Learn 45 algorithms with clarity through interactive step-by-step visualizations — sorting, pathfinding, searching, tree traversal, and graph algorithms. Free educational web app with Python examples and complexity analysis. Bayan (بيان) means clarity in Arabic.';

export const DEFAULT_OG_DESCRIPTION =
  'Interactive step-by-step visualizations for sorting, pathfinding, searching, tree traversal, and graph algorithms — with Python examples and complexity analysis.';

/**
 * @param {string} pathname - React Router pathname (e.g. `/`, `/app`)
 * @returns {string}
 */
export function getCanonicalUrl(pathname) {
  if (!pathname || pathname === '/') {
    return `${PRODUCTION_ORIGIN}/`;
  }

  return `${PRODUCTION_ORIGIN}${pathname}`;
}

/**
 * Hostnames that should be indexed by search engines.
 * @param {string} hostname
 * @returns {boolean}
 */
export function isIndexableHostname(hostname) {
  if (!hostname) return false;

  return hostname === 'bayanflow.com' || hostname === 'www.bayanflow.com';
}

/**
 * Hostnames that should never be indexed (dev, previews, local).
 * @param {string} hostname
 * @returns {boolean}
 */
export function isNoIndexHostname(hostname) {
  if (!hostname) return true;

  if (isIndexableHostname(hostname)) {
    return false;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }

  return hostname === 'dev.bayanflow.com' || hostname.endsWith('.workers.dev');
}
