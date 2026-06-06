/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMasterChain, MASTER_INPUT_GAIN } from './masterChain.js';

describe('createMasterChain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the shared bus with master input gain and effects chain', async () => {
    const Tone = await import('tone');
    const { input } = await createMasterChain();

    expect(Tone.Gain).toHaveBeenCalledWith(MASTER_INPUT_GAIN);
    expect(Tone.Filter).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'lowpass', frequency: 5000 })
    );
    expect(Tone.Compressor).toHaveBeenCalledWith(
      expect.objectContaining({ threshold: -24, ratio: 3 })
    );
    expect(Tone.Reverb).toHaveBeenCalledWith(
      expect.objectContaining({ decay: 1.2, wet: 0.12 })
    );
    expect(input.chain).toHaveBeenCalled();
    expect(input).toBeDefined();
  });
});
