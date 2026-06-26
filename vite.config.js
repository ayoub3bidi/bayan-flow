import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSDELIVR_ORIGIN = 'https://cdn.jsdelivr.net';

const isProductionMainBuild =
  (process.env.VITE_GIT_BRANCH ?? '').trim() === 'main';

/**
 * @param {string | undefined} configuredBase
 * @returns {string | null}
 */
function resolvePyodideCspOrigin(configuredBase) {
  const configured = (configuredBase ?? '').trim().replace(/\/$/, '');
  if (!configured) {
    return null;
  }

  try {
    const origin = new URL(configured).origin;
    return origin === JSDELIVR_ORIGIN ? null : origin;
  } catch {
    return null;
  }
}

/**
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

// https://vite.dev/config/
export default defineConfig({
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
        const origin = resolvePyodideCspOrigin(
          process.env.VITE_PYODIDE_CDN_BASE
        );
        if (!origin) {
          return;
        }

        const headersPath = path.join(__dirname, 'dist', '_headers');
        if (!fs.existsSync(headersPath)) {
          return;
        }

        let content = fs.readFileSync(headersPath, 'utf8');
        content = appendOriginToCspDirective(content, 'connect-src', origin);
        content = appendOriginToCspDirective(content, 'script-src', origin);
        fs.writeFileSync(headersPath, content);
      },
    },
  ],
});
