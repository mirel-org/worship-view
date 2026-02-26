import { test as base, Page } from '@playwright/test';

type WebappFixtures = {
  appPage: Page;
  onboardingPage: Page;
};

/**
 * Set up localStorage flags for an onboarding test, reload, and wait for setup to complete.
 *
 * @param page - The Playwright Page
 * @param flags - Which onboarding gates to skip (cause to fail)
 */
export async function setupOnboardingTest(
  page: Page,
  flags: {
    skipApiKey?: boolean;
    skipAuth?: boolean;
    skipPassphraseConfirm?: boolean;
    skipOrganization?: boolean;
  },
): Promise<void> {
  await page.evaluate((f) => {
    localStorage.clear();
    localStorage.setItem('jazz-test-mode', 'true');
    if (f.skipApiKey) localStorage.setItem('test-skip-api-key', 'true');
    if (f.skipAuth) localStorage.setItem('test-skip-auth', 'true');
    if (f.skipPassphraseConfirm) localStorage.setItem('test-skip-passphrase-confirm', 'true');
    if (f.skipOrganization) localStorage.setItem('test-skip-organization', 'true');
  }, flags);

  // Reload to apply the localStorage changes
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Wait for TestAppWrapper async setup to complete (loading indicator disappears)
  await page.waitForSelector('#test-loading', { state: 'detached', timeout: 30000 });
}

export const test = base.extend<WebappFixtures>({
  appPage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Clear all previous state, then set test mode
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('jazz-test-mode', 'true');
      localStorage.setItem('jazz-api-key', JSON.stringify('test-api-key'));
    });

    // Reload to apply the localStorage changes
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for the app to fully render (JazzTestProvider creates account async)
    await page.waitForSelector('[role="tab"]', { timeout: 30000 });

    await use(page);
  },

  onboardingPage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('jazz-test-mode', 'true');
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
