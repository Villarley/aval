import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mi-billetera/shared': path.resolve(
        rootDir,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
  server: {
    port: 5173,
  },
});
