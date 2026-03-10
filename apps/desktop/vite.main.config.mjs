import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/main/index.ts'),
      output: {
        entryFileNames: 'main.js',
      },
      // Mark Node.js built-ins and googleapis as external
      // They will be loaded from node_modules at runtime
      external: [
        'electron',
        'googleapis',
        'fs',
        'path',
        'crypto',
        'stream',
        'util',
        'url',
        'http',
        'https',
        'zlib',
        'events',
        'buffer',
        'os',
        'net',
        'tls',
        'child_process',
        'adm-zip',
      ],
    },
    outDir: '.vite/build',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@assets': resolve(__dirname, '../../assets'),
    },
  },
});

