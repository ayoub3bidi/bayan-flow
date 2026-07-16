/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

describe('pyodideCdn', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('exports the pinned Pyodide version', async () => {
    const { PYODIDE_VERSION } = await import('./pyodideCdn.js');
    expect(PYODIDE_VERSION).toBe('0.27.5');
  });

  it('getPyodideCdnBase defaults to jsDelivr when env is unset', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PYODIDE_CDN_BASE', '');
    const { getPyodideCdnBase } = await import('./pyodideCdn.js');
    expect(getPyodideCdnBase()).toBe(
      'https://cdn.jsdelivr.net/pyodide/v0.27.5/full'
    );
  });

  it('getPyodideCdnBase uses VITE_PYODIDE_CDN_BASE when set', async () => {
    vi.resetModules();
    vi.stubEnv(
      'VITE_PYODIDE_CDN_BASE',
      'https://cdn.example.com/pyodide/v0.27.5/full/'
    );
    const { getPyodideCdnBase } = await import('./pyodideCdn.js');
    expect(getPyodideCdnBase()).toBe(
      'https://cdn.example.com/pyodide/v0.27.5/full'
    );
  });

  it('getPyodideCdnBase falls back to jsDelivr when override URL is invalid', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PYODIDE_CDN_BASE', 'not-a-valid-url');
    const { getPyodideCdnBase } = await import('./pyodideCdn.js');
    expect(getPyodideCdnBase()).toBe(
      'https://cdn.jsdelivr.net/pyodide/v0.27.5/full'
    );
  });

  it('pyodideScriptUrl appends pyodide.js to the CDN base', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PYODIDE_CDN_BASE', 'https://cdn.example.com/pyodide/full');
    const { pyodideScriptUrl } = await import('./pyodideCdn.js');
    expect(pyodideScriptUrl()).toBe(
      'https://cdn.example.com/pyodide/full/pyodide.js'
    );
  });
});
