/**
 * @fileoverview Constants for personal learning features (favorites, notes).
 */

/** @typedef {'FAVORITE_SLOT_LIMIT_REACHED'} PersonalLearningErrorCode */

export const FREE_TIER_FAVORITE_SLOT_LIMIT = 20;
export const PRO_TIER_FAVORITE_SLOT_LIMIT = 100;
export const NOTE_MAX_PLAIN_TEXT_LENGTH = 10000;
export const NOTE_MAX_HTML_LENGTH = 50000;

export const PERSONAL_LEARNING_ERRORS = {
  FAVORITE_SLOT_LIMIT_REACHED: 'FAVORITE_SLOT_LIMIT_REACHED',
};
