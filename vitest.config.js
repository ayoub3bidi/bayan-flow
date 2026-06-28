import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure directory imports resolve to index.js for ES modules
    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['module', 'main'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    env: {
      VITE_GOOGLE_WEB_CLIENT_ID: '123456789-test.apps.googleusercontent.com',
    },
    css: true,
    //? Run tests sequentially to reduce memory pressure
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'scripts/**',
        '**/*.test.js',
        '**/*.test.jsx',
      ],
    },
  },
});
