/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export const extractYoutubeVideoId = url =>
  url?.match(/(?:embed\/|youtu\.be\/|v=)([^/?&]+)/)?.[1] ?? null;
