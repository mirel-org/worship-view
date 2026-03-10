import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { resolve } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

// Compute the latest mtime across workspace package source files.
// Vite's dep optimizer cache hash is based on config + lockfile only,
// so changes to workspace packages (which get pre-bundled) won't
// invalidate it. By embedding this timestamp in optimizeDeps config,
// we force re-optimization whenever a package source file changes.
function getWorkspaceSourceTimestamp() {
  let max = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.[tj]sx?$/.test(entry.name))
        max = Math.max(max, statSync(full).mtimeMs);
    }
  };
  for (const pkg of ['core', 'schema', 'ui']) {
    try { walk(resolve(__dirname, `../../packages/${pkg}/src`)); } catch {}
  }
  return max.toString();
}

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  base: './',
  root: resolve(__dirname, 'src/renderer'),
  build: {
    outDir: resolve(__dirname, '.vite/renderer/app_window'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
  },
  resolve: {
    alias: {
      '@assets': resolve(__dirname, '../../assets'),
      '@ipc': resolve(__dirname, 'src/ipc'),
      // Force pdfjs-dist to resolve from core's node_modules (v4.x)
      // instead of the hoisted root node_modules (v5.x which needs Uint8Array.toHex)
      'pdfjs-dist': resolve(__dirname, '../../packages/core/node_modules/pdfjs-dist'),
    },
  },
  server: {
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  optimizeDeps: {
    exclude: ['@automerge/automerge'],
    esbuildOptions: {
      define: {
        __WORKSPACE_TS__: getWorkspaceSourceTimestamp(),
      },
    },
  },
});
