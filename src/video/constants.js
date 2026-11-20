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
 * Duration of the complexity analysis segment at the end of the video (5 seconds).
 */
export const COMPLEXITY_DURATION_FRAMES = 5 * VIDEO_FPS;

/** Longest video an export may produce (shorts up to long-form lessons). */
export const MAX_EXPORT_SECONDS = 10 * 60;

/** Fastest export pace (0.2 s per step) used to squeeze long runs under the limit. */
export const MIN_EXPORT_FRAMES_PER_STEP = DEFAULT_FRAMES_PER_STEP;

/**
 * Pace and length of an export: the comfortable 1.5 s/step pace when it fits,
 * otherwise as fast as needed to stay within MAX_EXPORT_SECONDS.
 *
 * @param {number} stepCount
 * @returns {{ framesPerStep: number, durationSec: number, exceedsLimit: boolean }}
 */
export function getExportTiming(stepCount) {
  const steps = Math.max(0, stepCount || 0);
  const maxMainFrames =
    MAX_EXPORT_SECONDS * VIDEO_FPS - COMPLEXITY_DURATION_FRAMES;
  const fitting = steps > 0 ? Math.floor(maxMainFrames / steps) : Infinity;
  const framesPerStep = Math.max(
    MIN_EXPORT_FRAMES_PER_STEP,
    Math.min(VIDEO_EXPORT_FRAMES_PER_STEP, fitting)
  );
  return {
    framesPerStep,
    durationSec:
      (steps * framesPerStep + COMPLEXITY_DURATION_FRAMES) / VIDEO_FPS,
    exceedsLimit: fitting < MIN_EXPORT_FRAMES_PER_STEP,
  };
}

/**
 * Map app animation speed (ms delay) to video frames per step.
 * Slower speed = more frames per step = longer visible time per step in video.
 */
export const SPEED_TO_FRAMES_MAP = {
  [ANIMATION_SPEEDS.SLOW]: 12,
  [ANIMATION_SPEEDS.MEDIUM]: 8,
  [ANIMATION_SPEEDS.FAST]: 5,
  [ANIMATION_SPEEDS.VERY_FAST]: 3,
  [ANIMATION_SPEEDS.ULTRA_FAST]: 2,
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
