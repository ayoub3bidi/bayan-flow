/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ANIMATION_SPEEDS } from '../constants/index.js';

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

/** Vertical (9:16) dimensions for shorts/reels */
export const VIDEO_WIDTH_VERTICAL = 1080;
export const VIDEO_HEIGHT_VERTICAL = 1920;
export const DEFAULT_FRAMES_PER_STEP = 6;

/**
 * Frames per step used for video export. Keeps a comfortable viewing pace
 * so users can read the step description and follow the animation (~1.5 s per step at 30fps).
 */
export const VIDEO_EXPORT_FRAMES_PER_STEP = 45;

/**
 * Duration of the complexity analysis segment at the end of the video (10 seconds).
 */
export const COMPLEXITY_DURATION_FRAMES = 10 * VIDEO_FPS;

/**
 * Map app animation speed (ms delay) to video frames per step.
 * Slower speed = more frames per step = longer visible time per step in video.
 */
export const SPEED_TO_FRAMES_MAP = {
  [ANIMATION_SPEEDS.SLOW]: 12,
  [ANIMATION_SPEEDS.MEDIUM]: 8,
  [ANIMATION_SPEEDS.FAST]: 5,
  [ANIMATION_SPEEDS.VERY_FAST]: 3,
};

/** Default Remotion inputProps.watermark — overridden per export from UI. */
export const DEFAULT_VIDEO_WATERMARK = {
  enabled: true,
  text: 'Bayan Flow',
  imageUrl: null,
  /** Small corner label */
  cornerOpacity: 0.9,
  /** Large centered watermark (still translucent) */
  diagonalOpacity: 0.24,
  showDiagonal: true,
  /** Duplicate label in corner — off by default when large watermark is shown */
  showCornerBadge: false,
  position: 'br',
};

/**
 * Frames per export SFX clip — must cover Tone-rendered WAV length (see scripts/render-tone-export-sfx.mjs).
 */
export const EXPORT_SFX_DURATION_FRAMES_BY_KIND = {
  compare: 14,
  swap: 14,
  pivot: 20,
  complete: 80,
  passComplete: 24,
  visit: 10,
  frontier: 10,
  targetFound: 40,
  pathFound: 100,
  noResult: 35,
  edgeConsider: 10,
  edgeSelect: 16,
  cycle: 24,
  matrixConsider: 10,
  matrixUpdate: 16,
  componentComplete: 40,
  // Legacy names for old bundled inputs/tests.
  sorted: 80,
  nodeVisit: 10,
};

export const DEFAULT_EXPORT_AUDIO_VOLUME = 0.85;
