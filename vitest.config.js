import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const rawPythonPlugin = () => {
  return {
    name: 'raw-python',
    resolveId(id) {
      if (id.includes('.py?raw')) {
        return id;
      }
    },
    load(id) {
      if (id.includes('.py?raw')) {
        const filePath = id.replace('?raw', '');
        try {
          const content = readFileSync(filePath, 'utf-8');
          return `export default ${JSON.stringify(content)};`;
        } catch (error) {
          console.error('Error reading Python file:', error);
          // Return mock content for tests
          return `export default "def mock_algorithm(): pass";`;
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), rawPythonPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
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
      exclude: ['node_modules/', 'src/test/'],
    },
    server: {
      deps: {
        inline: ['**/*.py'],
      },
    },
    alias: {
      // Mock Python raw imports at the alias level
      '../algorithms/python/bubble_sort.py?raw': new URL(
        './src/test/mocks/bubble_sort.js',
        import.meta.url
      ).pathname,
      '../algorithms/python/quick_sort.py?raw': new URL(
        './src/test/mocks/quick_sort.js',
        import.meta.url
      ).pathname,
      '../algorithms/python/merge_sort.py?raw': new URL(
        './src/test/mocks/merge_sort.js',
        import.meta.url
      ).pathname,
    },
  },
  assetsInclude: ['**/*.py'],
});
