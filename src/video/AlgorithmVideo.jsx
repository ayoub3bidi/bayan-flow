/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { ALGORITHM_TYPES } from '../constants/index.js';
import ComplexityScene from './ComplexityScene.jsx';
import {
  DEFAULT_VIDEO_WATERMARK,
  DEFAULT_EXPORT_AUDIO_VOLUME,
} from './constants.js';
import {
  VIDEO_SCENE_RENDERERS,
  VIDEO_TITLE_FALLBACK,
} from '../registry/videoSceneRegistry.jsx';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import { DEFAULT_COMPLEXITY_DATASET } from '../registry/complexityDatasetRegistry.js';
import VideoWatermarkOverlay from './VideoWatermarkOverlay.jsx';
import ExportAudioTracks from './ExportAudioTracks.jsx';
import { resolveStepDescription } from '../utils/resolveStepDescription.js';
import { getVideoExportTheme } from './videoExportTheme.js';
import i18n from '../i18n/index.js';
import { normalizeExportLanguage } from './exportLanguage.js';

/**
 * Root Remotion composition: title bar, step counter + description, then full-frame visualization.
 * Shows complexity analysis for the last 10 seconds.
 * Receives inputProps: steps, algorithmType, algorithmName, algorithmKey, framesPerStep, gridSize,
 * watermark (partial), includeExportAudio, exportAudioVolume, exportTheme ('light' | 'dark'),
 * exportLanguage ('en' | 'fr' | 'ar') for step label and description keys.
 */
function AlgorithmVideo({
  steps = [],
  algorithmType = ALGORITHM_TYPES.SORTING,
  algorithmName = '',
  algorithmKey = '',
  framesPerStep = 6,
  gridSize = 15,
  watermark: watermarkInput,
  includeExportAudio = false,
  exportAudioVolume = DEFAULT_EXPORT_AUDIO_VOLUME,
  exportTheme = 'dark',
  exportLanguage: exportLanguageInput = 'en',
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vTheme = getVideoExportTheme(exportTheme);
  const lng = normalizeExportLanguage(exportLanguageInput);
  const textDir = i18n.dir(lng);
  const mainDurationInFrames = steps.length * framesPerStep;
  const isComplexitySegment = steps.length > 0 && frame >= mainDurationInFrames;

  const complexityDataset =
    CATEGORY_CONFIG[algorithmType]?.complexityDataset ??
    DEFAULT_COMPLEXITY_DATASET;

  const watermark = {
    ...DEFAULT_VIDEO_WATERMARK,
    ...watermarkInput,
  };
  if (watermarkInput?.opacity != null && watermarkInput.cornerOpacity == null) {
    watermark.cornerOpacity = watermarkInput.opacity;
  }

  let body;

  if (isComplexitySegment) {
    body = (
      <ComplexityScene
        algorithmKey={algorithmKey}
        complexityDataset={complexityDataset}
        algorithmName={algorithmName}
        exportTheme={exportTheme}
      />
    );
  } else if (!steps.length) {
    body = (
      <AbsoluteFill
        style={{
          backgroundColor: vTheme.emptyBg,
          alignItems: 'center',
          justifyContent: 'center',
          color: vTheme.emptyText,
          fontSize: 18,
          direction: textDir,
        }}
      >
        {i18n.t('videoExport.noSteps', { lng })}
      </AbsoluteFill>
    );
  } else {
    const stepIndex = Math.min(
      Math.floor(frame / framesPerStep),
      Math.max(0, steps.length - 1)
    );
    const step = steps[stepIndex] ?? steps[0];
    const description = resolveStepDescription(step?.description ?? '', lng);
    const stepLabel = i18n.t('info.step', {
      lng,
      current: stepIndex + 1,
      total: steps.length,
    });
    const renderMainScene = VIDEO_SCENE_RENDERERS[algorithmType];
    const titleFallback = VIDEO_TITLE_FALLBACK[algorithmType] ?? 'Algorithm';

    const minSide = Math.min(width, height);
    const titleFontSize = Math.max(26, Math.round(minSide * 0.034));
    const stepFontSize = Math.max(20, Math.round(minSide * 0.026));
    const descFontSize = Math.max(18, Math.round(minSide * 0.023));
    const headerPadV = Math.round(height * 0.02);
    const headerPadH = Math.round(width * 0.045);
    const footerPadV = Math.round(height * 0.024);
    const footerPadH = Math.round(width * 0.045);

    body = (
      <AbsoluteFill
        style={{
          backgroundColor: vTheme.shellBg,
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            padding: `${headerPadV}px ${headerPadH}px`,
            backgroundColor: vTheme.headerBg,
            borderBottom: `3px solid ${vTheme.accentBorder}`,
            color: vTheme.headerText,
            textAlign: 'center',
            direction: textDir,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              textShadow: vTheme.titleShadow,
            }}
          >
            {algorithmName || titleFallback}
          </h1>
        </header>

        {/* Step + description under title; visualization uses all remaining space (no overlap). */}
        <div
          style={{
            flexShrink: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: `${Math.round(minSide * 0.012)}px ${footerPadH}px ${Math.round(
              minSide * 0.014
            )}px`,
            boxSizing: 'border-box',
            direction: textDir,
          }}
        >
          <div
            style={{
              width: 'min(92%, 1120px)',
              maxWidth: '100%',
              padding: `${footerPadV}px ${footerPadH}px`,
              backgroundColor: vTheme.captionBg,
              border: `1px solid ${vTheme.captionBorder}`,
              borderRadius: Math.max(10, Math.round(minSide * 0.016)),
              boxShadow: vTheme.captionShadow,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: Math.round(minSide * 0.012),
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: stepFontSize,
                fontWeight: 700,
                color: vTheme.stepAccent,
                letterSpacing: textDir === 'rtl' ? 0 : '0.04em',
              }}
            >
              {stepLabel}
            </div>
            {description ? (
              <p
                style={{
                  margin: 0,
                  width: '100%',
                  maxWidth: '100%',
                  fontSize: descFontSize,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  color: vTheme.descText,
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  textShadow: vTheme.descShadow,
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            width: '100%',
            direction: 'ltr',
          }}
        >
          {renderMainScene
            ? renderMainScene({ steps, framesPerStep, gridSize, exportTheme })
            : null}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ position: 'relative' }}>
      {body}
      <VideoWatermarkOverlay
        enabled={watermark.enabled}
        text={watermark.text}
        imageUrl={watermark.imageUrl}
        cornerOpacity={watermark.cornerOpacity}
        diagonalOpacity={watermark.diagonalOpacity}
        showDiagonal={watermark.showDiagonal}
        showCornerBadge={watermark.showCornerBadge}
        position={watermark.position}
        exportTheme={exportTheme}
      />
      <ExportAudioTracks
        enabled={includeExportAudio}
        algorithmType={algorithmType}
        algorithmKey={algorithmKey}
        steps={steps}
        framesPerStep={framesPerStep}
        mainDurationInFrames={mainDurationInFrames}
        volume={exportAudioVolume}
      />
    </AbsoluteFill>
  );
}

export default AlgorithmVideo;
