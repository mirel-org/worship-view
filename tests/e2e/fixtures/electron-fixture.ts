import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';

type ElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
  onboardingWindow: Page;
  audienceWindow: Page;
};

/**
 * Set up localStorage flags for an onboarding test, reload, and wait for setup to complete.
 *
 * @param window - The Playwright Page (Electron window)
 * @param flags - Which onboarding gates to skip (cause to fail)
 */
export async function setupOnboardingTest(
  window: Page,
  flags: {
    skipApiKey?: boolean;
    skipAuth?: boolean;
    skipPassphraseConfirm?: boolean;
    skipOrganization?: boolean;
  },
): Promise<void> {
  // Clear all previous state and set test mode + requested flags
  try {
    await window.evaluate((f) => {
      localStorage.clear();
      localStorage.setItem('jazz-test-mode', 'true');
      if (f.skipApiKey) localStorage.setItem('test-skip-api-key', 'true');
      if (f.skipAuth) localStorage.setItem('test-skip-auth', 'true');
      if (f.skipPassphraseConfirm) localStorage.setItem('test-skip-passphrase-confirm', 'true');
      if (f.skipOrganization) localStorage.setItem('test-skip-organization', 'true');
    }, flags);
  } catch {
    // localStorage access may fail on restricted pages — continue anyway
  }

  // Reload to apply the localStorage changes
  await window.reload();
  await window.waitForLoadState('domcontentloaded');

  // Wait for TestAppWrapper async setup to complete (loading indicator disappears)
  await window.waitForSelector('#test-loading', { state: 'detached', timeout: 30000 });
}

export const test = base.extend<ElectronFixtures>({
  electronApp: async ({}, use) => {
    const mainPath = path.join(__dirname, '../../../.vite/build/main.js');

    const electronApp = await electron.launch({
      args: [mainPath, '--no-sandbox'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    await use(electronApp);
    await electronApp.close();
  },

  mainWindow: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();

    // Wait for the window to load its initial content
    await window.waitForLoadState('domcontentloaded');

    // Clear all previous state, then set test mode
    // This may fail on about:blank or other restricted pages, so we catch that specific error
    try {
      await window.evaluate(() => {
        localStorage.clear();
        // Enable test mode - this tells the app to use JazzTestProvider
        localStorage.setItem('jazz-test-mode', 'true');
        // Satisfy the Onboarding API key gate (atomWithStorage stores JSON-stringified values)
        localStorage.setItem('jazz-api-key', JSON.stringify('test-api-key'));
      });
    } catch {
      // localStorage access failed on restricted page - continue anyway
    }

    // Reload to apply the localStorage changes
    await window.reload();
    await window.waitForLoadState('domcontentloaded');

    // Wait for the app to fully render (JazzTestProvider creates account async)
    await window.waitForSelector('[role="tab"]', { timeout: 30000 });

    await use(window);
  },

  onboardingWindow: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();

    // Wait for the window to load its initial content
    await window.waitForLoadState('domcontentloaded');

    // Clear all previous state, then set only jazz-test-mode.
    // Individual tests call setupOnboardingTest() with the flags they need.
    try {
      await window.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('jazz-test-mode', 'true');
      });
    } catch {
      // localStorage access failed on restricted page - continue anyway
    }

    await use(window);
  },

  audienceWindow: async ({ electronApp, mainWindow }, use) => {
    // Get the first display ID from the Electron IPC
    const displayId = await mainWindow.evaluate(async () => {
      const displays = await (window as any).myAPI.getDisplays();
      return displays[0]?.id?.toString();
    });

    if (!displayId) {
      throw new Error('No displays returned from myAPI.getDisplays()');
    }

    // Pre-set display-settings in localStorage to mark that display as "audience".
    // This matches the format in settings.display.hooks.ts (defaultInput structure).
    await mainWindow.evaluate((id) => {
      const settings = {
        [id]: [
          { value: 'none', checked: false, label: 'None' },
          { value: 'stage', checked: false, label: 'Stage' },
          { value: 'audience', checked: true, label: 'Audience' },
        ],
      };
      localStorage.setItem('display-settings', JSON.stringify(settings));
    }, displayId);

    // Count windows before reload so we can detect the new child window
    const windowsBefore = electronApp.windows().length;

    // Reload for the app to pick up the display-settings from localStorage.
    // Frame.tsx will open a child window via window.open() for each audience display.
    await mainWindow.reload();
    await mainWindow.waitForLoadState('domcontentloaded');

    // Wait for the app to fully render (JazzTestProvider async setup)
    await mainWindow.waitForSelector('[role="tab"]', { timeout: 30000 });

    // Wait for the audience child window to appear (opened by Frame.tsx via window.open())
    let audiencePage: Page | undefined;
    for (let i = 0; i < 50; i++) {
      const allWindows = electronApp.windows();
      if (allWindows.length > windowsBefore) {
        // The new window is the audience child window
        audiencePage = allWindows[allWindows.length - 1];
        break;
      }
      await mainWindow.waitForTimeout(200);
    }

    if (!audiencePage) {
      throw new Error(
        'Audience child window did not appear within 10 seconds. ' +
        `Windows count: ${electronApp.windows().length}, expected > ${windowsBefore}`
      );
    }

    // Wait for the audience window to have content rendered
    await audiencePage.waitForLoadState('domcontentloaded');
    await audiencePage.waitForSelector('.bg-black', { timeout: 10000 });

    await use(audiencePage);
  },
});

export { expect } from '@playwright/test';
