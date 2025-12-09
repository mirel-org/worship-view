import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  root: resolve(__dirname, 'src/renderer'),
  build: {
    outDir: '.vite/renderer/app_window',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
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
  server: {
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  define: {
    'process.env.WORKERS_API_URL': JSON.stringify(
      process.env.WORKERS_API_URL || 'http://localhost:8787'
    ),
  },
});

