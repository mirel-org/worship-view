import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: undefined,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npx vite --port 5199',
    port: 5199,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
