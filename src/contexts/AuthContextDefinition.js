/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { createContext } from 'react';

/** @typedef {import('@supabase/supabase-js').User} SupabaseUser */
/** @typedef {import('@supabase/supabase-js').Session} SupabaseSession */

/**
 * @typedef {Object} AuthProfileView
 * @property {string} displayName
 * @property {string} email
 * @property {string} avatarSrc
 * @property {'google' | 'profile' | 'generated'} avatarSource
 * @property {'free' | 'pro'} plan
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {SupabaseUser | null} user
 * @property {SupabaseSession | null} session
 * @property {AuthProfileView | null} profile
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {boolean} isConfigured
 * @property {() => Promise<void>} signInWithGoogle
 * @property {() => Promise<void>} signOut
 */

export const AuthContext = createContext(
  /** @type {AuthContextValue | undefined} */ (undefined)
);
