/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { vi } from 'vitest';

export const soundManagerState = {
  isEnabled: false,
};

export const soundManagerMock = {
  playEvents: vi.fn(),
  enable: vi.fn(async () => {
    soundManagerState.isEnabled = true;
  }),
  disable: vi.fn(() => {
    soundManagerState.isEnabled = false;
  }),
  getIsEnabled: vi.fn(() => soundManagerState.isEnabled),
};

/** Re-apply mock implementations after vi.restoreAllMocks() in individual tests. */
export function resetSoundManagerMock() {
  soundManagerState.isEnabled = false;
  soundManagerMock.enable.mockImplementation(async () => {
    soundManagerState.isEnabled = true;
  });
  soundManagerMock.disable.mockImplementation(() => {
    soundManagerState.isEnabled = false;
  });
  soundManagerMock.getIsEnabled.mockImplementation(
    () => soundManagerState.isEnabled
  );
  soundManagerMock.playEvents.mockClear();
  soundManagerMock.enable.mockClear();
  soundManagerMock.disable.mockClear();
  soundManagerMock.getIsEnabled.mockClear();
}
