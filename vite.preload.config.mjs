import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/preload/index.tsx'),
      output: {
        entryFileNames: 'preload.js',
      },
    },
    outDir: '.vite/build',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@assets': resolve(__dirname, 'assets'),
      '@common': resolve(__dirname, 'src/common'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@ipc': resolve(__dirname, 'src/ipc'),
      '@src': resolve(__dirname, 'src'),
    },
  },
});

