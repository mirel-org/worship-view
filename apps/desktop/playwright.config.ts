import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: [['html'], ['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    trace: 'on-first-retry',
  },
});
