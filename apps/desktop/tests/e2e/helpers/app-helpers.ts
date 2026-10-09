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

/**
 * Below the 1024px breakpoint the sidebar is a drawer opened from the header
 * menu button. Opens it when needed so sidebar items can be clicked at any
 * window size (CI displays can be smaller than the requested window).
 */
export async function revealSidebar(page: Page): Promise<void> {
  const menuButton = page.getByRole('button', { name: 'Deschide meniul' });
  if (!(await menuButton.isVisible())) return;
  const panel = page.locator('.sidebar-panel');
  if ((await panel.getAttribute('data-open')) !== 'true') {
    await menuButton.click();
  }
  await panel.evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished)),
  );
}

/**
 * Resizes the window showing `page` (not just the first Electron window: the
 * audience window may be listed first). The OS may clamp the size to the
 * display, so the resulting content width is returned.
 */
export async function setMainWindowSize(
  electronApp: ElectronApplication,
  page: Page,
  width: number,
  height: number,
): Promise<number> {
  const win = await electronApp.browserWindow(page);
  return win.evaluate(
    (browserWindow, size) => {
      browserWindow.setSize(size.width, size.height);
      return browserWindow.getContentBounds().width;
    },
    { width, height },
  );
}

/** Closes the sidebar drawer (narrow windows) by clicking its backdrop. */
export async function hideSidebar(page: Page): Promise<void> {
  const panel = page.locator('.sidebar-panel');
  if ((await panel.getAttribute('data-open')) !== 'true') return;
  const backdrop = page.locator('.sidebar-backdrop');
  const box = await backdrop.boundingBox();
  if (!box) return;
  await page.mouse.click(box.x + box.width - 10, box.y + box.height / 2);
  await panel.evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished)),
  );
}
