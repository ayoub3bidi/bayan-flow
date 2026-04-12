/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

describe('deployContext', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('isProductionMainBranch returns true when VITE_GIT_BRANCH is main', async () => {
    vi.stubEnv('VITE_GIT_BRANCH', 'main');
    const { isProductionMainBranch } = await import('./deployContext.js');
    expect(isProductionMainBranch()).toBe(true);
  });

  it('isProductionMainBranch returns false when VITE_GIT_BRANCH is develop', async () => {
    vi.stubEnv('VITE_GIT_BRANCH', 'develop');
    const { isProductionMainBranch } = await import('./deployContext.js');
    expect(isProductionMainBranch()).toBe(false);
  });

  it('isProductionMainBranch returns false when VITE_GIT_BRANCH is empty', async () => {
    vi.stubEnv('VITE_GIT_BRANCH', '');
    const { isProductionMainBranch } = await import('./deployContext.js');
    expect(isProductionMainBranch()).toBe(false);
  });
});
