/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** Pinned Pyodide release loaded by the Python execution worker. */
export const PYODIDE_VERSION = '0.27.5';

const DEFAULT_PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

/**
 * Base URL for Pyodide assets (no trailing slash).
 * Override with VITE_PYODIDE_CDN_BASE when using a custom Pyodide CDN.
 * Custom origins are appended to CSP in `dist/_headers` at build time (see vite.config.js).
 * @returns {string}
 */
export function getPyodideCdnBase() {
  const configured = (import.meta.env.VITE_PYODIDE_CDN_BASE ?? '')
    .trim()
    .replace(/\/$/, '');
  return configured || DEFAULT_PYODIDE_CDN_BASE;
}

/**
 * Full URL to the Pyodide bootstrap script for the configured CDN base.
 * @returns {string}
 */
export function pyodideScriptUrl() {
  return `${getPyodideCdnBase()}/pyodide.js`;
}
