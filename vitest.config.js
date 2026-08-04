import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      //? tone is only ever loaded via dynamic import (lazy Tone.js) and is globally
      //? mocked in the setup file, so it must be resolved through Vite's graph.
      //? rolldown-vite's oxc-resolver caches fs access while walking node_modules,
      //? which intermittently fails the bare `tone` specifier at transform time
      //? (vite:import-analysis normalizeUrl). Point directly at the package entry
      //? so resolution is deterministic and never traverses node_modules.
      tone: path.resolve(__dirname, 'node_modules/tone/build/esm/index.js'),
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
      VITE_SUPABASE_URL: 'https://test-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    css: true,
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
        'supabase/functions/**',
        '**/*.test.js',
        '**/*.test.jsx',
      ],
    },
  },
});
