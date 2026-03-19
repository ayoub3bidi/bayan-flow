/**
 * Copyright (c) 2025 Ayoub Abidi
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
} from './constants.js';
import { ALGORITHM_TYPES } from '../constants/index.js';

const COMPOSITION_ID = 'AlgorithmVideo';

/**
 * Hook for exporting algorithm visualization as MP4 via @remotion/web-renderer.
 * State: idle | orientation | checking | rendering | preview | done | error
 * Dynamically imports @remotion/web-renderer on first export.
 *
 * @returns {{ beginExportFlow: Function, exportVideo: Function, exportState: string, exportProgress: number, exportBlobUrl: string | null, exportFileName: string, cancelExport: Function, closePreview: Function, downloadVideo: Function, canRenderOnWeb: boolean | null }}
 */
export function useVideoExporter() {
  const [exportState, setExportState] = useState('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportBlobUrl, setExportBlobUrl] = useState(null);
  const [exportFileName, setExportFileName] = useState('visualization.mp4');
  const [canRenderOnWeb, setCanRenderOnWeb] = useState(null);
  const blobRef = useRef(null);
  const abortRef = useRef(null);

  const cancelExport = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const beginExportFlow = useCallback(() => {
    setExportState('orientation');
  }, []);

  const closePreview = useCallback(() => {
    if (exportBlobUrl) {
      URL.revokeObjectURL(exportBlobUrl);
    }
    blobRef.current = null;
    setExportBlobUrl(null);
    setExportState('idle');
    setExportProgress(0);
  }, [exportBlobUrl]);

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
    }) => {
      if (!steps?.length) {
        setExportState('error');
        return;
      }

      const isVertical = orientation === 'vertical';
      const width = isVertical ? VIDEO_WIDTH_VERTICAL : VIDEO_WIDTH;
      const height = isVertical ? VIDEO_HEIGHT_VERTICAL : VIDEO_HEIGHT;

      const framesPerStep = VIDEO_EXPORT_FRAMES_PER_STEP;
      const mainDurationInFrames = steps.length * framesPerStep;
      const durationInFrames =
        mainDurationInFrames + COMPLEXITY_DURATION_FRAMES;

      const inputProps = {
        steps,
        algorithmType: algorithmType ?? ALGORITHM_TYPES.SORTING,
        algorithmName: algorithmName ?? '',
        algorithmKey: algorithmKey ?? '',
        framesPerStep,
        gridSize,
      };

      setExportState('checking');
      setExportProgress(0);
      setExportBlobUrl(null);

      try {
        const { canRenderMediaOnWeb, renderMediaOnWeb } =
          await import('@remotion/web-renderer');

        const check = await canRenderMediaOnWeb({
          width,
          height,
          container: 'mp4',
          videoCodec: 'h264',
          muted: true,
        });

        setCanRenderOnWeb(check.canRender);

        if (!check.canRender) {
          setExportState('error');
          return;
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
          muted: true,
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
          setExportState('idle');
          setExportProgress(0);
          return;
        }
        console.error('[Export Video]', err);
        setExportState('error');
        setExportProgress(0);
        setTimeout(() => setExportState('idle'), 3000);
      } finally {
        abortRef.current = null;
      }
    },
    []
  );

  return {
    beginExportFlow,
    exportVideo,
    exportState,
    exportProgress,
    exportBlobUrl,
    exportFileName,
    cancelExport,
    closePreview,
    downloadVideo,
    canRenderOnWeb,
  };
}
