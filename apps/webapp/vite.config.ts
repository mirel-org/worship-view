import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@assets': resolve(__dirname, '../../assets'),
    },
  },
  optimizeDeps: {
    exclude: ['@automerge/automerge'],
  },
});
