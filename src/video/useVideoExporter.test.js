/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  cloneExportSteps,
  canProceedWithExport,
  getBlockingRenderIssues,
  hasAudioRenderBlocker,
  isExportCancelledError,
  summarizeRenderIssues,
  useVideoExporter,
} from './useVideoExporter.js';

const { canRenderMediaOnWeb, renderMediaOnWeb } = vi.hoisted(() => ({
  canRenderMediaOnWeb: vi.fn(),
  renderMediaOnWeb: vi.fn(),
}));

vi.mock('@remotion/web-renderer', () => ({
  canRenderMediaOnWeb,
  renderMediaOnWeb,
}));

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

  it('cloneExportSteps returns original steps when cloning fails', () => {
    const circular = { array: [1] };
    circular.self = circular;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(cloneExportSteps(circular)).toBe(circular);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('useVideoExporter hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canRenderMediaOnWeb.mockResolvedValue({
      canRender: true,
      issues: [],
    });
    renderMediaOnWeb.mockResolvedValue({
      getBlob: vi.fn().mockResolvedValue(new Blob(['video'])),
    });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:export'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('enters error state when export is requested with no steps', async () => {
    const { result } = renderHook(() => useVideoExporter());

    await act(async () => {
      await result.current.exportVideo({ steps: [] });
    });

    expect(result.current.exportState).toBe('error');
    expect(result.current.exportErrorMessage).toBe(
      'No visualization steps to export.'
    );
  });

  it('falls back to muted export when audio codec preflight fails', async () => {
    canRenderMediaOnWeb
      .mockResolvedValueOnce({
        canRender: false,
        issues: [{ type: 'audio-codec-unsupported', severity: 'error' }],
      })
      .mockResolvedValueOnce({
        canRender: true,
        issues: [],
      });

    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1, 2], states: ['default', 'default'] }];

    await act(async () => {
      await result.current.exportVideo({
        steps,
        algorithmName: 'Bubble Sort',
        includeExportAudio: true,
      });
    });

    expect(canRenderMediaOnWeb).toHaveBeenCalledTimes(2);
    expect(renderMediaOnWeb).toHaveBeenCalledWith(
      expect.objectContaining({ muted: true })
    );
    expect(result.current.exportState).toBe('preview');
  });

  it('reportExportError sets error state with the given message', () => {
    const { result } = renderHook(() => useVideoExporter());

    act(() => {
      result.current.reportExportError('Something went wrong');
    });

    expect(result.current.exportState).toBe('error');
    expect(result.current.exportErrorMessage).toBe('Something went wrong');
    expect(result.current.exportProgress).toBe(0);
  });

  it('cancelExport dismisses an in-flight export session', async () => {
    renderMediaOnWeb.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    );

    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1], states: ['default'] }];

    act(() => {
      void result.current.exportVideo({ steps, algorithmName: 'Test' });
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.cancelExport();
    });

    expect(result.current.exportState).toBe('idle');
  });
});
