/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Avatar, Style } from '@dicebear/core';
import notionists from '@dicebear/styles/notionists.json';

/** @type {Style | null} */
let notionistsStyle = null;

function getNotionistsStyle() {
  if (!notionistsStyle) {
    notionistsStyle = new Style(notionists);
  }
  return notionistsStyle;
}

/**
 * @typedef {'google' | 'profile' | 'generated'} AvatarSource
 */

/**
 * @typedef {'google' | 'generated'} AvatarPreference
 */

/**
 * @typedef {Object} ResolvedAvatar
 * @property {string} src
 * @property {AvatarSource} source
 */

/**
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
function isHttpUrl(url) {
  return typeof url === 'string' && /^https:\/\//.test(url.trim());
}

/**
 * Deterministic DiceBear avatar (client-side SVG data URI).
 * @param {string} seed
 * @param {number} [size]
 * @returns {string}
 */
export function generateAvatarDataUri(seed, size = 64) {
  const normalizedSeed = (seed ?? 'bayan-flow').trim() || 'bayan-flow';
  return new Avatar(getNotionistsStyle(), {
    seed: normalizedSeed,
    size,
  }).toDataUri();
}

/**
 * Deterministic seed for DiceBear avatars.
 * @param {string | null | undefined} email
 * @returns {string}
 */
function resolveAvatarSeed(email) {
  return (email ?? 'bayan-flow').trim() || 'bayan-flow';
}

/**
 * Resolve avatar URL: preference → Google/session metadata → DB profile → DiceBear fallback.
 * @param {{ metadataUrl?: string | null, profileUrl?: string | null, email?: string | null, size?: number, avatarPreference?: AvatarPreference | null }} params
 * @returns {ResolvedAvatar}
 */
export function resolveUserAvatar({
  metadataUrl,
  profileUrl,
  email,
  size = 64,
  avatarPreference = 'google',
}) {
  if (avatarPreference === 'generated') {
    return {
      src: generateAvatarDataUri(resolveAvatarSeed(email), size),
      source: 'generated',
    };
  }

  if (isHttpUrl(metadataUrl)) {
    return { src: metadataUrl.trim(), source: 'google' };
  }

  if (isHttpUrl(profileUrl)) {
    return { src: profileUrl.trim(), source: 'profile' };
  }

  return {
    src: generateAvatarDataUri(resolveAvatarSeed(email), size),
    source: 'generated',
  };
}

/**
 * @param {import('@supabase/supabase-js').User | null | undefined} user
 * @returns {string | null}
 */
export function getMetadataAvatarUrl(user) {
  const metadata = user?.user_metadata ?? {};
  const url = metadata.avatar_url ?? metadata.picture;
  return isHttpUrl(url) ? url.trim() : null;
}

/**
 * @param {import('@supabase/supabase-js').User | null | undefined} user
 * @param {{ display_name?: string | null, email?: string | null } | null | undefined} profileRow
 * @returns {string}
 */
export function resolveDisplayName(user, profileRow) {
  if (profileRow?.display_name?.trim()) {
    return profileRow.display_name.trim();
  }

  const metadata = user?.user_metadata ?? {};
  const fromMetadata = metadata.full_name ?? metadata.name;
  if (typeof fromMetadata === 'string' && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  const email = user?.email ?? profileRow?.email ?? '';
  const localPart = email.split('@')[0]?.trim();
  if (localPart) {
    return localPart;
  }
  return 'User';
}
