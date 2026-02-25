import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function globalSetup() {
  const projectRoot = path.join(__dirname, '../..');
  const mainJsPath = path.join(projectRoot, '.vite/build/main.js');
  const preloadJsPath = path.join(projectRoot, '.vite/build/preload.js');
  const rendererDir = path.join(projectRoot, '.vite/renderer');

  // Check if full build exists (main, preload, AND renderer)
  const hasMainBuild = fs.existsSync(mainJsPath) && fs.existsSync(preloadJsPath);
  const hasRendererBuild = fs.existsSync(rendererDir);

  if (!hasMainBuild || !hasRendererBuild) {
    console.log('\n==============================================');
    console.log('Building app for tests...');
    console.log('==============================================\n');

    try {
      execSync('pnpm run build:test', {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      console.log('\nBuild completed successfully.\n');
    } catch (error) {
      console.error('\n==============================================');
      console.error('ERROR: Build failed!');
      console.error('==============================================');
      console.error('Could not build the app for testing.');
      console.error('Try running manually: pnpm run build:test');
      console.error('==============================================\n');
      throw new Error('Build failed. See above for details.');
    }
  } else {
    console.log('Using existing build at .vite/');
  }
}

export default globalSetup;
