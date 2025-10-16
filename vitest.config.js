import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const rawPythonPlugin = () => {
  return {
    name: 'raw-python',
    load(id) {
      if (id.endsWith('.py?raw')) {
        const filePath = id.replace('?raw', '');
        try {
          const content = readFileSync(filePath, 'utf-8');
          return `export default ${JSON.stringify(content)};`;
        } catch (error) {
          console.error(error);
          console.warn(`Could not read Python file: ${filePath}`);
          return `export default '';`;
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
  },
});
