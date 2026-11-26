/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackBlocksTabOpened,
  trackBlocksProgramRun,
  trackVisualizationStarted,
  BLOCKS_TAB_OPENED,
  BLOCKS_PROGRAM_RUN,
  VISUALIZATION_STARTED,
} from './analyticsEvents.js';
import { captureEvent } from './analytics.js';

vi.mock('./analytics.js', () => ({
  captureEvent: vi.fn(),
}));

describe('analyticsEvents blocks tab', () => {
  beforeEach(() => {
    vi.mocked(captureEvent).mockClear();
  });

  it('tracks the Blocks tab being opened, supported or not', () => {
    trackBlocksTabOpened('depthFirstSearch', false);
    expect(captureEvent).toHaveBeenCalledWith(BLOCKS_TAB_OPENED, {
      algorithm_key: 'depthFirstSearch',
      supported: false,
    });
  });

  it('tracks block program runs with their outcome', () => {
    trackBlocksProgramRun('bubbleSort', false);
    expect(captureEvent).toHaveBeenCalledWith(BLOCKS_PROGRAM_RUN, {
      algorithm_key: 'bubbleSort',
      success: false,
    });
  });

  it('tags visualization_started with its source, defaulting to algorithm', () => {
    trackVisualizationStarted('bubbleSort', 'sorting', true);
    trackVisualizationStarted('bubbleSort', 'sorting', true, 'blocks');
    expect(captureEvent).toHaveBeenNthCalledWith(1, VISUALIZATION_STARTED, {
      algorithm_key: 'bubbleSort',
      category: 'sorting',
      is_authenticated: true,
      source: 'algorithm',
    });
    expect(captureEvent).toHaveBeenNthCalledWith(
      2,
      VISUALIZATION_STARTED,
      expect.objectContaining({ source: 'blocks' })
    );
  });
});
