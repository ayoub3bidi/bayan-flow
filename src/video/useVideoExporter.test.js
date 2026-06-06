/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it } from 'vitest';
import {
  cloneExportSteps,
  canProceedWithExport,
  getBlockingRenderIssues,
  hasAudioRenderBlocker,
  isExportCancelledError,
  summarizeRenderIssues,
} from './useVideoExporter.js';

describe('useVideoExporter helpers', () => {
  it('cloneExportSteps returns a deep copy of plain step data', () => {
    const steps = [
      { array: [3, 1, 2], states: ['default', 'default', 'default'] },
    ];
    const cloned = cloneExportSteps(steps);
    expect(cloned).toEqual(steps);
    expect(cloned).not.toBe(steps);
    cloned[0].array[0] = 99;
    expect(steps[0].array[0]).toBe(3);
  });

  it('summarizeRenderIssues prefers error-severity messages', () => {
    expect(
      summarizeRenderIssues([
        { severity: 'warning', message: 'Heads up' },
        { severity: 'error', message: 'Audio codec unsupported' },
      ])
    ).toBe('Audio codec unsupported');
  });

  it('hasAudioRenderBlocker detects audio/container codec issues', () => {
    expect(hasAudioRenderBlocker([{ type: 'audio-codec-unsupported' }])).toBe(
      true
    );
    expect(hasAudioRenderBlocker([{ type: 'webgl-unsupported' }])).toBe(false);
  });

  it('canProceedWithExport ignores webgl-only preflight failures', () => {
    const webglOnly = {
      canRender: false,
      issues: [
        {
          type: 'webgl-unsupported',
          severity: 'error',
          message: 'WebGL is not supported. 3D CSS transforms will fail.',
        },
      ],
    };

    expect(canProceedWithExport(webglOnly)).toBe(true);
    expect(getBlockingRenderIssues(webglOnly.issues)).toEqual([]);
    expect(summarizeRenderIssues(webglOnly.issues)).toBe(
      'WebGL is not supported. 3D CSS transforms will fail.'
    );
  });

  it('canProceedWithExport still blocks on codec and WebCodecs issues', () => {
    const blocked = {
      canRender: false,
      issues: [
        {
          type: 'webcodecs-unavailable',
          severity: 'error',
          message: 'WebCodecs unavailable',
        },
      ],
    };

    expect(canProceedWithExport(blocked)).toBe(false);
    expect(summarizeRenderIssues(blocked.issues)).toBe('WebCodecs unavailable');
  });

  it('isExportCancelledError detects abort and Remotion cancel messages', () => {
    expect(
      isExportCancelledError(new DOMException('Aborted', 'AbortError'))
    ).toBe(true);
    expect(
      isExportCancelledError(new Error('renderMediaOnWeb() was cancelled'))
    ).toBe(true);
    expect(
      isExportCancelledError(new Error('renderMediaOnWeb() was canceled'))
    ).toBe(true);
    expect(isExportCancelledError(new Error('WebCodecs unavailable'))).toBe(
      false
    );
  });
});
