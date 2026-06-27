import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  assertVideoExportCspDirectives,
  extractCspFromHeadersFile,
} from './scripts/cspHeaders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSDELIVR_ORIGIN = 'https://cdn.jsdelivr.net';

/**
 * Collect Pyodide CDN origins that must appear in the generated CSP.
 * @param {string | undefined} configuredBase
 * @returns {string[]}
 */
function collectPyodideCspOrigins(configuredBase) {
  const origins = new Set([JSDELIVR_ORIGIN]);
  const configured = (configuredBase ?? '').trim().replace(/\/$/, '');

  if (configured) {
    try {
      origins.add(new URL(configured).origin);
    } catch {
      throw new Error(
        `VITE_PYODIDE_CDN_BASE must be an absolute URL; received "${configuredBase}".`
      );
    }
  }

  return [...origins];
}

/**
 * Append a CSP origin to the first matching directive when not already present.
 * @param {string} content
 * @param {'connect-src' | 'script-src'} directive
 * @param {string} origin
 * @returns {string}
 */
function appendOriginToCspDirective(content, directive, origin) {
  const pattern = new RegExp(`(${directive} [^;]+)`);
  return content.replace(pattern, match => {
    if (match.includes(origin)) {
      return match;
    }
    return `${match} ${origin}`;
  });
}

/**
 * Prefer Vite-loaded env values while still honoring CI/process overrides.
 * @param {Record<string, string>} env
 * @param {string} key
 * @returns {string | undefined}
 */
function readBuildEnv(env, key) {
  const fromFiles = env[key]?.trim();
  if (fromFiles) {
    return fromFiles;
  }
  return process.env[key]?.trim() || undefined;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gitBranch = readBuildEnv(env, 'VITE_GIT_BRANCH') ?? '';
  const isProductionMainBuild = gitBranch === 'main';
  const pyodideCdnBase = readBuildEnv(env, 'VITE_PYODIDE_CDN_BASE');
  // Fail fast so CSP and runtime Pyodide CDN stay aligned.
  collectPyodideCspOrigins(pyodideCdnBase);

  return {
    plugins: [
      react(),
      {
        name: 'html-seo-robots',
        transformIndexHtml(html) {
          if (isProductionMainBuild) {
            return html;
          }

          return html.replace(
            '<meta name="robots" content="index, follow" />',
            '<meta name="robots" content="noindex, nofollow" />'
          );
        },
      },
      {
        name: 'headers-pyodide-csp',
        apply: 'build',
        closeBundle() {
          const headersPath = path.join(__dirname, 'dist', '_headers');
          if (!fs.existsSync(headersPath)) {
            return;
          }

          let content = fs.readFileSync(headersPath, 'utf8');
          for (const origin of collectPyodideCspOrigins(pyodideCdnBase)) {
            content = appendOriginToCspDirective(
              content,
              'connect-src',
              origin
            );
            content = appendOriginToCspDirective(content, 'script-src', origin);
          }
          fs.writeFileSync(headersPath, content);

          const csp = extractCspFromHeadersFile(content);
          assertVideoExportCspDirectives(csp, 'dist/_headers');
        },
      },
    ],
  };
});
