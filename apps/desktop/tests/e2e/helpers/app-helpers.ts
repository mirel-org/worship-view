import { Page, ElectronApplication } from '@playwright/test';

/**
 * Wait for the app to be fully loaded and ready
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

/**
 * Get all windows from the Electron app
 */
export async function getAllWindows(electronApp: ElectronApplication): Promise<Page[]> {
  return electronApp.windows();
}

/**
 * Check if the myAPI is exposed on the window
 */
export async function isApiExposed(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return typeof (window as any).myAPI !== 'undefined';
  });
}

/**
 * Get the window title
 */
export async function getWindowTitle(page: Page): Promise<string> {
  return page.title();
}

/**
 * Check if context isolation is enabled (window.require should not exist)
 */
export async function isContextIsolationEnabled(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return typeof (window as any).require === 'undefined';
  });
}

/**
 * Set localStorage value
 */
export async function setLocalStorage(page: Page, key: string, value: unknown): Promise<void> {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key, value });
}

/**
 * Get localStorage value
 */
export async function getLocalStorage(page: Page, key: string): Promise<unknown> {
  return page.evaluate((key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, key);
}
