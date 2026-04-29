import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), legacy()],
  publicDir: 'public',
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
});
