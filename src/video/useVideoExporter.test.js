/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  cloneExportSteps,
  canProceedWithExport,
  getBlockingRenderIssues,
  hasAudioRenderBlocker,
  isExportCancelledError,
  useVideoExporter,
} from './useVideoExporter.js';
import i18n from '../i18n/index.js';

const { canRenderMediaOnWeb, renderMediaOnWeb, buildExportAudioUrl } =
  vi.hoisted(() => ({
    canRenderMediaOnWeb: vi.fn(),
    renderMediaOnWeb: vi.fn(),
    buildExportAudioUrl: vi.fn(),
  }));

vi.mock('@remotion/web-renderer', () => ({
  canRenderMediaOnWeb,
  renderMediaOnWeb,
}));

vi.mock('./audio/mixExportAudio.js', () => ({ buildExportAudioUrl }));

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
    buildExportAudioUrl.mockResolvedValue('blob:audio');
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:export'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enters error state when export is requested with no steps', async () => {
    const { result } = renderHook(() => useVideoExporter());

    await act(async () => {
      await result.current.exportVideo({ steps: [] });
    });

    expect(result.current.exportState).toBe('error');
    expect(result.current.exportErrorMessage).toBe(
      'There is nothing to export yet. Run the visualization first.'
    );
  });

  it('refuses runs too long to fit the 10-minute limit', async () => {
    const { result } = renderHook(() => useVideoExporter());

    await act(async () => {
      await result.current.exportVideo({ steps: Array(3000).fill({}) });
    });

    expect(result.current.exportState).toBe('error');
    expect(canRenderMediaOnWeb).not.toHaveBeenCalled();
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
    expect(buildExportAudioUrl).not.toHaveBeenCalled();
    expect(renderMediaOnWeb).toHaveBeenCalledWith(
      expect.objectContaining({ muted: true })
    );
    expect(result.current.exportState).toBe('preview');
  });

  it('renders one pre-mixed sound track and frees it afterwards', async () => {
    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1, 2], states: ['default', 'default'] }];

    await act(async () => {
      await result.current.exportVideo({ steps, algorithmName: 'Bubble Sort' });
    });

    expect(buildExportAudioUrl).toHaveBeenCalledWith(
      expect.objectContaining({ steps, framesPerStep: 45 })
    );
    const options = renderMediaOnWeb.mock.calls[0][0];
    expect(options.muted).toBe(false);
    expect(options.inputProps.exportAudioSrc).toBe('blob:audio');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:audio');
  });

  it.each([
    [undefined, 'bars'],
    ['boxes', 'boxes'],
    ['bars', 'bars'],
    ['nonsense', 'bars'],
  ])(
    'passes arrayView %s to the composition as %s',
    async (input, expected) => {
      const { result } = renderHook(() => useVideoExporter());
      const steps = [{ array: [1, 2], states: ['default', 'default'] }];

      await act(async () => {
        await result.current.exportVideo({ steps, arrayView: input });
      });

      expect(renderMediaOnWeb.mock.calls[0][0].inputProps.arrayView).toBe(
        expected
      );
    }
  );

  it('exports without sound when the sound track cannot be built', async () => {
    buildExportAudioUrl.mockRejectedValueOnce(new Error('decode failed'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1, 2], states: ['default', 'default'] }];

    await act(async () => {
      await result.current.exportVideo({ steps, algorithmName: 'Bubble Sort' });
    });

    const options = renderMediaOnWeb.mock.calls[0][0];
    expect(options.muted).toBe(true);
    expect(options.inputProps.exportAudioSrc).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    expect(result.current.exportState).toBe('preview');
    warnSpy.mockRestore();
  });

  it('shows a translated message instead of the raw render error', async () => {
    renderMediaOnWeb.mockRejectedValueOnce(
      new Error("Failed to execute 'btoa' on 'Window'")
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await i18n.changeLanguage('fr');
    const { result } = renderHook(() => useVideoExporter());

    try {
      await act(async () => {
        await result.current.exportVideo({
          steps: [{ array: [1], states: ['default'] }],
        });
      });

      expect(result.current.exportState).toBe('error');
      expect(result.current.exportErrorMessage).toBe(
        "Une erreur s'est produite lors de la création de la vidéo. Veuillez réessayer."
      );
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      await i18n.changeLanguage('en');
      errorSpy.mockRestore();
    }
  });

  it('shows the translated unsupported-browser message', async () => {
    canRenderMediaOnWeb.mockResolvedValue({
      canRender: false,
      issues: [
        { type: 'webcodecs-unavailable', severity: 'error', message: 'raw' },
      ],
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useVideoExporter());

    await act(async () => {
      await result.current.exportVideo({
        steps: [{ array: [1], states: ['default'] }],
      });
    });

    expect(result.current.exportErrorMessage).toBe(
      'Video export is not supported in this browser. Use Chrome 94+, Firefox 130+, or Safari 26+.'
    );
    warnSpy.mockRestore();
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

  it('getExportBlob returns the rendered video blob after export', async () => {
    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1, 2], states: ['default', 'default'] }];

    expect(result.current.getExportBlob()).toBeNull();

    await act(async () => {
      await result.current.exportVideo({ steps, algorithmName: 'Bubble Sort' });
    });

    const blob = result.current.getExportBlob();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('stores algorithm metadata after successful export', async () => {
    const { result } = renderHook(() => useVideoExporter());
    const steps = [{ array: [1, 2], states: ['default', 'default'] }];

    await act(async () => {
      await result.current.exportVideo({
        steps,
        algorithmName: 'Insertion Sort',
        algorithmKey: 'insertionSort',
        algorithmType: 'sorting',
      });
    });

    expect(result.current.exportAlgorithmMeta).toEqual({
      algorithmName: 'Insertion Sort',
      algorithmKey: 'insertionSort',
      algorithmType: 'sorting',
    });
  });
});
