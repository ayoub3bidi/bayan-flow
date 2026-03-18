/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ANIMATION_SPEEDS } from '../constants/index.js';

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const DEFAULT_FRAMES_PER_STEP = 6;

/**
 * Frames per step used for video export. Keeps a comfortable viewing pace
 * so users can read the step description and follow the animation (~1.5 s per step at 30fps).
 */
export const VIDEO_EXPORT_FRAMES_PER_STEP = 45;

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
