/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { getProfile } from '@/services/profileService';

/**
 * @param {string} userId
 * @returns {Promise<'free' | 'pro'>}
 */
export async function getUserPlan(userId) {
  const profile = await getProfile(userId);
  return profile?.plan === 'pro' ? 'pro' : 'free';
}
