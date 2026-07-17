/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { captureEvent } from './analytics';

// ─── Algorithm Lifecycle ──────────────────────────────────────────────────────

/** Algorithm visualization viewed */
export const ALGORITHM_VIEWED = 'algorithm_viewed';

/** Algorithm visualization playback completed */
export const ALGORITHM_COMPLETED = 'algorithm_completed';

/** New input generated for algorithm */
export const ALGORITHM_REGENERATED = 'algorithm_regenerated';

// ─── User Engagement ──────────────────────────────────────────────────────────

/** Playback speed changed */
export const SPEED_CHANGED = 'speed_changed';

/** Manual step forward or backward */
export const MANUAL_STEPPING = 'manual_stepping';

/** Fullscreen mode toggled */
export const FULLSCREEN_TOGGLED = 'fullscreen_toggled';

/** Sound effects toggled */
export const SOUND_TOGGLED = 'sound_toggled';

// ─── Feature Usage ────────────────────────────────────────────────────────────

/** Python code panel opened */
export const CODE_PANEL_OPENED = 'code_panel_opened';

/** Algorithm insight panel opened */
export const INSIGHT_PANEL_OPENED = 'insight_panel_opened';

/** Video export started */
export const VIDEO_EXPORT_STARTED = 'video_export_started';

/** Video export completed */
export const VIDEO_EXPORT_COMPLETED = 'video_export_completed';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Sign-in button clicked */
export const SIGN_IN_CLICKED = 'sign_in_clicked';

/** Sign-in completed successfully */
export const SIGN_IN_COMPLETED = 'sign_in_completed';

/** Algorithm added to favorites */
export const FAVORITE_ADDED = 'favorite_added';

/** Algorithm removed from favorites */
export const FAVORITE_REMOVED = 'favorite_removed';

/** Study note saved */
export const NOTE_SAVED = 'note_saved';

// ─── Conversion ───────────────────────────────────────────────────────────────

/** Upgrade modal viewed */
export const UPGRADE_MODAL_VIEWED = 'upgrade_modal_viewed';

/** Upgrade button clicked */
export const UPGRADE_CLICKED = 'upgrade_clicked';

// ─── Navigation ───────────────────────────────────────────────────────────────

/** Category tab changed */
export const CATEGORY_CHANGED = 'category_changed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Capture an algorithm viewed event.
 * @param {string} algorithmKey
 * @param {string} category
 */
export function trackAlgorithmViewed(algorithmKey, category) {
  captureEvent(ALGORITHM_VIEWED, { algorithm_key: algorithmKey, category });
}

/**
 * Capture an algorithm completed event.
 * @param {string} algorithmKey
 * @param {string} category
 * @param {number} [durationMs]
 */
export function trackAlgorithmCompleted(algorithmKey, category, durationMs) {
  captureEvent(ALGORITHM_COMPLETED, {
    algorithm_key: algorithmKey,
    category,
    duration_ms: durationMs,
  });
}

/**
 * Capture an algorithm regenerated event.
 * @param {string} algorithmKey
 * @param {string} category
 */
export function trackAlgorithmRegenerated(algorithmKey, category) {
  captureEvent(ALGORITHM_REGENERATED, {
    algorithm_key: algorithmKey,
    category,
  });
}

/**
 * Capture a speed changed event.
 * @param {string} fromSpeed
 * @param {string} toSpeed
 */
export function trackSpeedChanged(fromSpeed, toSpeed) {
  captureEvent(SPEED_CHANGED, { from_speed: fromSpeed, to_speed: toSpeed });
}

/**
 * Capture a manual stepping event.
 * @param {string} algorithmKey
 * @param {'forward'|'backward'} direction
 */
export function trackManualStepping(algorithmKey, direction) {
  captureEvent(MANUAL_STEPPING, {
    algorithm_key: algorithmKey,
    direction,
  });
}

/**
 * Capture a fullscreen toggled event.
 * @param {boolean} isFullscreen
 */
export function trackFullscreenToggled(isFullscreen) {
  captureEvent(FULLSCREEN_TOGGLED, { is_fullscreen: isFullscreen });
}

/**
 * Capture a sound toggled event.
 * @param {boolean} isEnabled
 */
export function trackSoundToggled(isEnabled) {
  captureEvent(SOUND_TOGGLED, { is_enabled: isEnabled });
}

/**
 * Capture a code panel opened event.
 * @param {string} algorithmKey
 */
export function trackCodePanelOpened(algorithmKey) {
  captureEvent(CODE_PANEL_OPENED, { algorithm_key: algorithmKey });
}

/**
 * Capture an insight panel opened event.
 * @param {string} algorithmKey
 */
export function trackInsightPanelOpened(algorithmKey) {
  captureEvent(INSIGHT_PANEL_OPENED, { algorithm_key: algorithmKey });
}

/**
 * Capture a video export started event.
 * @param {'horizontal'|'vertical'} orientation
 * @param {string} algorithmKey
 */
export function trackVideoExportStarted(orientation, algorithmKey) {
  captureEvent(VIDEO_EXPORT_STARTED, {
    orientation,
    algorithm_key: algorithmKey,
  });
}

/**
 * Capture a video export completed event.
 * @param {number} durationMs
 */
export function trackVideoExportCompleted(durationMs) {
  captureEvent(VIDEO_EXPORT_COMPLETED, { duration_ms: durationMs });
}

/**
 * Capture a sign-in clicked event.
 * @param {'modal'|'navbar'|'menu'} source
 */
export function trackSignInClicked(source) {
  captureEvent(SIGN_IN_CLICKED, { source });
}

/**
 * Capture a sign-in completed event.
 */
export function trackSignInCompleted() {
  captureEvent(SIGN_IN_COMPLETED);
}

/**
 * Capture a favorite added event.
 * @param {string} algorithmKey
 */
export function trackFavoriteAdded(algorithmKey) {
  captureEvent(FAVORITE_ADDED, { algorithm_key: algorithmKey });
}

/**
 * Capture a favorite removed event.
 * @param {string} algorithmKey
 */
export function trackFavoriteRemoved(algorithmKey) {
  captureEvent(FAVORITE_REMOVED, { algorithm_key: algorithmKey });
}

/**
 * Capture a note saved event.
 * @param {string} algorithmKey
 * @param {number} noteLength
 */
export function trackNoteSaved(algorithmKey, noteLength) {
  captureEvent(NOTE_SAVED, {
    algorithm_key: algorithmKey,
    note_length: noteLength,
  });
}

/**
 * Capture an upgrade modal viewed event.
 * @param {string} trigger
 */
export function trackUpgradeModalViewed(trigger) {
  captureEvent(UPGRADE_MODAL_VIEWED, { trigger });
}

/**
 * Capture an upgrade clicked event.
 * @param {string} planSelected
 * @param {string} trigger
 */
export function trackUpgradeClicked(planSelected, trigger) {
  captureEvent(UPGRADE_CLICKED, { plan_selected: planSelected, trigger });
}

/**
 * Capture a category changed event.
 * @param {string} fromCategory
 * @param {string} toCategory
 */
export function trackCategoryChanged(fromCategory, toCategory) {
  captureEvent(CATEGORY_CHANGED, {
    from_category: fromCategory,
    to_category: toCategory,
  });
}
