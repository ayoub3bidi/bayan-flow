/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useCallback, useRef } from 'react';
import AlgorithmVideo from './AlgorithmVideo.jsx';
import {
  VIDEO_FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  VIDEO_WIDTH_VERTICAL,
  VIDEO_HEIGHT_VERTICAL,
  VIDEO_EXPORT_FRAMES_PER_STEP,
  COMPLEXITY_DURATION_FRAMES,
  DEFAULT_VIDEO_WATERMARK,
  DEFAULT_EXPORT_AUDIO_VOLUME,
} from './constants.js';
import { ALGORITHM_TYPES } from '../constants/index.js';
import { normalizeExportLanguage } from './exportLanguage.js';

const COMPOSITION_ID = 'AlgorithmVideo';

/** Remotion flags WebGL for 3D CSS; Bayan export scenes are 2D-only. */
const NON_BLOCKING_PREFLIGHT_ISSUES = new Set(['webgl-unsupported']);

/** @param {Array<{ severity?: string, type?: string }>} [issues] */
export function getBlockingRenderIssues(issues = []) {
  return issues.filter(
    issue =>
      issue.severity === 'error' &&
      !NON_BLOCKING_PREFLIGHT_ISSUES.has(issue.type)
  );
}

/** @param {{ canRender?: boolean, issues?: Array<{ severity?: string, type?: string }> }} check */
export function canProceedWithExport(check) {
  if (check.canRender) return true;
  return getBlockingRenderIssues(check.issues).length === 0;
}

/** @param {unknown[]} steps */
export function cloneExportSteps(steps) {
  try {
    return JSON.parse(JSON.stringify(steps));
  } catch (err) {
    console.warn('[Export Video] Could not clone steps; using original.', err);
    return steps;
  }
}

/** @param {Array<{ severity?: string, message?: string, type?: string }>} [issues] */
export function summarizeRenderIssues(issues = []) {
  const messages = getBlockingRenderIssues(issues)
    .map(issue => issue.message)
    .filter(Boolean);
  if (messages.length) return messages.join(' ');
  return issues[0]?.message ?? '';
}

/** @param {Array<{ type?: string }>} [issues] */
export function hasAudioRenderBlocker(issues = []) {
  return issues.some(issue =>
    ['audio-codec-unsupported', 'container-codec-mismatch'].includes(
      issue.type
    )
  );
}

/**
 * Hook for exporting algorithm visualization as MP4 via @remotion/web-renderer.
 * State: idle | orientation | checking | rendering | preview | error
 *
 * @returns {{ beginExportFlow: Function, exportVideo: Function, exportState: string, exportProgress: number, exportBlobUrl: string | null, exportFileName: string, exportErrorMessage: string | null, cancelExport: Function, closePreview: Function, downloadVideo: Function, canRenderOnWeb: boolean | null }}
 */
export function useVideoExporter() {
  const [exportState, setExportState] = useState('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportBlobUrl, setExportBlobUrl] = useState(null);
  const [exportFileName, setExportFileName] = useState('visualization.mp4');
  const [exportErrorMessage, setExportErrorMessage] = useState(null);
  const [canRenderOnWeb, setCanRenderOnWeb] = useState(null);
  const blobRef = useRef(null);
  const abortRef = useRef(null);

  const resetExportSession = useCallback(() => {
    if (exportBlobUrl) {
      URL.revokeObjectURL(exportBlobUrl);
    }
    blobRef.current = null;
    setExportBlobUrl(null);
    setExportState('idle');
    setExportProgress(0);
    setExportErrorMessage(null);
  }, [exportBlobUrl]);

  const cancelExport = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const beginExportFlow = useCallback(() => {
    setExportErrorMessage(null);
    setExportState('orientation');
  }, []);

  const closePreview = useCallback(() => {
    resetExportSession();
  }, [resetExportSession]);

  const downloadVideo = useCallback(() => {
    if (!blobRef.current || !exportFileName) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportFileName]);

  const exportVideo = useCallback(
    async ({
      steps,
      algorithmType,
      algorithmName,
      algorithmKey,
      speed: _speed,
      gridSize = 15,
      orientation = 'horizontal',
      watermark: watermarkPartial,
      includeExportAudio = true,
      exportAudioVolume = DEFAULT_EXPORT_AUDIO_VOLUME,
      exportTheme = 'dark',
      exportLanguage,
    }) => {
      if (!steps?.length) {
        setExportErrorMessage('No visualization steps to export.');
        setExportState('error');
        return;
      }

      const exportSteps = cloneExportSteps(steps);
      const isVertical = orientation === 'vertical';
      const width = isVertical ? VIDEO_WIDTH_VERTICAL : VIDEO_WIDTH;
      const height = isVertical ? VIDEO_HEIGHT_VERTICAL : VIDEO_HEIGHT;

      const framesPerStep = VIDEO_EXPORT_FRAMES_PER_STEP;
      const mainDurationInFrames = exportSteps.length * framesPerStep;
      const durationInFrames =
        mainDurationInFrames + COMPLEXITY_DURATION_FRAMES;

      const watermark = {
        ...DEFAULT_VIDEO_WATERMARK,
        ...watermarkPartial,
      };

      let renderMuted = !includeExportAudio;
      let exportAudioEnabled = includeExportAudio;

      const inputProps = {
        steps: exportSteps,
        algorithmType: algorithmType ?? ALGORITHM_TYPES.SORTING,
        algorithmName: algorithmName ?? '',
        algorithmKey: algorithmKey ?? '',
        framesPerStep,
        gridSize,
        watermark,
        includeExportAudio: exportAudioEnabled,
        exportAudioVolume,
        exportTheme:
          exportTheme === 'light' || exportTheme === 'dark'
            ? exportTheme
            : 'dark',
        exportLanguage: normalizeExportLanguage(exportLanguage),
      };

      setExportErrorMessage(null);
      setExportState('checking');
      setExportProgress(0);
      setExportBlobUrl(null);

      try {
        const { canRenderMediaOnWeb, renderMediaOnWeb } =
          await import('@remotion/web-renderer');

        let check = await canRenderMediaOnWeb({
          width,
          height,
          container: 'mp4',
          videoCodec: 'h264',
          muted: renderMuted,
        });

        if (
          !canProceedWithExport(check) &&
          includeExportAudio &&
          !renderMuted &&
          hasAudioRenderBlocker(check.issues)
        ) {
          check = await canRenderMediaOnWeb({
            width,
            height,
            container: 'mp4',
            videoCodec: 'h264',
            muted: true,
          });
          if (canProceedWithExport(check)) {
            renderMuted = true;
            exportAudioEnabled = false;
            inputProps.includeExportAudio = false;
          }
        }

        const canExport = canProceedWithExport(check);
        setCanRenderOnWeb(canExport);

        if (!canExport) {
          const issueSummary = summarizeRenderIssues(check.issues);
          console.warn('[Export Video] Browser cannot render MP4:', check.issues);
          setExportErrorMessage(
            issueSummary ||
              'Video export is not supported in this browser. Try Chrome 94+, Firefox 130+, or Safari 26+.'
          );
          setExportState('error');
          return;
        }

        if (!check.canRender) {
          console.info(
            '[Export Video] Continuing without WebGL (export compositions use 2D rendering only).'
          );
        }

        setExportState('rendering');
        abortRef.current = new AbortController();

        const { getBlob } = await renderMediaOnWeb({
          signal: abortRef.current.signal,
          composition: {
            id: COMPOSITION_ID,
            component: AlgorithmVideo,
            durationInFrames,
            fps: VIDEO_FPS,
            width,
            height,
          },
          inputProps,
          muted: renderMuted,
          videoBitrate: 'very-high',
          hardwareAcceleration: 'prefer-software',
          licenseKey: 'free-license',
          onProgress: ({ progress }) => {
            setExportProgress(progress);
          },
        });

        const blob = await getBlob();
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setExportBlobUrl(url);
        setExportFileName(
          `${algorithmName || 'visualization'}-visualization.mp4`
        );
        setExportState('preview');
        setExportProgress(1);
      } catch (err) {
        if (err?.name === 'AbortError') {
          resetExportSession();
          return;
        }
        console.error('[Export Video]', err);
        setExportErrorMessage(
          err instanceof Error ? err.message : String(err ?? 'Export failed')
        );
        setExportState('error');
        setExportProgress(0);
      } finally {
        abortRef.current = null;
      }
    },
    [resetExportSession]
  );

  return {
    beginExportFlow,
    exportVideo,
    exportState,
    exportProgress,
    exportBlobUrl,
    exportFileName,
    exportErrorMessage,
    cancelExport,
    closePreview,
    downloadVideo,
    canRenderOnWeb,
  };
}
