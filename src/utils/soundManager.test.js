/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('./soundManager.js');

describe('soundManager', () => {
  beforeEach(async () => {
    const { soundManager } = await import('./soundManager.js');
    soundManager.disable();
    vi.clearAllMocks();
  });

  it('exposes the current enabled state through getIsEnabled()', async () => {
    const { soundManager } = await import('./soundManager.js');

    expect(soundManager.getIsEnabled()).toBe(false);

    await soundManager.enable();
    expect(soundManager.getIsEnabled()).toBe(true);

    soundManager.disable();
    expect(soundManager.getIsEnabled()).toBe(false);
  });
});
