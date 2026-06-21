import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProductionMainBuild =
  (process.env.VITE_GIT_BRANCH ?? '').trim() === 'main';

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
  ],
});
