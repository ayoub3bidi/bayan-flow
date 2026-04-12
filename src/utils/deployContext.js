/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * Deployment context derived from Vite env (set at build time on Netlify).
 * @see netlify.toml [context.production.environment] VITE_GIT_BRANCH
 */

/**
 * True when this build targets the production site (main branch).
 * Used to show content that should not appear on dev/preview/deploy-preview builds.
 */
export function isProductionMainBranch() {
  return (import.meta.env.VITE_GIT_BRANCH ?? '').trim() === 'main';
}
