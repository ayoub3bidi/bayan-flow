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
  VIDEO_EXPORT_FRAMES_PER_STEP,
} from './constants.js';
import { ALGORITHM_TYPES } from '../constants/index.js';

const COMPOSITION_ID = 'AlgorithmVideo';

/**
 * Hook for exporting algorithm visualization as MP4 via @remotion/web-renderer.
 * State: idle | checking | rendering | done | error
 * Dynamically imports @remotion/web-renderer on first export.
 *
 * @returns {{ exportVideo: Function, exportState: string, exportProgress: number, cancelExport: Function, canRenderOnWeb: boolean | null }}
 */
export function useVideoExporter() {
  const [exportState, setExportState] = useState('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [canRenderOnWeb, setCanRenderOnWeb] = useState(null);
  const abortRef = useRef(null);

  const cancelExport = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const exportVideo = useCallback(
    async ({
      steps,
      algorithmType,
      algorithmName,
      speed: _speed,
      gridSize = 15,
    }) => {
      if (!steps?.length) {
        setExportState('error');
        return;
      }

      const framesPerStep = VIDEO_EXPORT_FRAMES_PER_STEP;
      const durationInFrames = steps.length * framesPerStep;

      const inputProps = {
        steps,
        algorithmType: algorithmType ?? ALGORITHM_TYPES.SORTING,
        algorithmName: algorithmName ?? '',
        framesPerStep,
        gridSize,
      };

      setExportState('checking');
      setExportProgress(0);

      try {
        const { canRenderMediaOnWeb, renderMediaOnWeb } =
          await import('@remotion/web-renderer');

        const check = await canRenderMediaOnWeb({
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
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
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          },
          inputProps,
          muted: true,
          videoBitrate: 'high',
          hardwareAcceleration: 'prefer-software',
          licenseKey: 'free-license',
          onProgress: ({ progress }) => {
            setExportProgress(progress);
          },
        });

        const blob = await getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${algorithmName || 'visualization'}-visualization.mp4`;
        a.click();
        URL.revokeObjectURL(url);

        setExportState('done');
        setExportProgress(1);
        setTimeout(() => {
          setExportState('idle');
          setExportProgress(0);
        }, 2000);
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
    exportVideo,
    exportState,
    exportProgress,
    cancelExport,
    canRenderOnWeb,
  };
}
