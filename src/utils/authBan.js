/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isAccountBannedError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message.toLowerCase()
      : '';

  if (message.includes('user is banned') || message.includes('banned')) {
    return true;
  }

  const status =
    'status' in error && typeof error.status === 'number' ? error.status : null;

  return status === 403;
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isSignInBlockedError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message
      : '';

  const code =
    'code' in error && typeof error.code === 'string' ? error.code : '';

  return (
    message.includes('Sign-in is temporarily unavailable') ||
    message.includes('signup is disabled') ||
    message.includes('User not allowed') ||
    message.includes('Invalid payload sent to hook') ||
    code === 'unexpected_failure'
  );
}
