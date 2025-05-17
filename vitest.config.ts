
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/lib/test-setup.tsx'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/lib/test-setup.tsx'],
    },
  },
});
