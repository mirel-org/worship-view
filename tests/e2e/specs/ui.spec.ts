import { test, expect } from '../fixtures/electron-fixture';

test.describe('UI Interactions', () => {
  test('app renders with content', async ({ mainWindow }) => {
    // Verify the app renders with meaningful content
    const appDiv = mainWindow.locator('#app');
    await expect(appDiv).toBeVisible();

    const appContent = await appDiv.innerHTML();
    expect(appContent.length).toBeGreaterThan(100);
  });

  test('enable button toggles state', async ({ mainWindow }) => {
    const enableButton = mainWindow.locator('[data-testid="enable-button"]');
    await expect(enableButton).toBeVisible();

    // The LIVE badge changes class on toggle (bg-muted when off, bg-destructive when on)
    const liveBadge = enableButton.locator('span').last();
    const initialClass = await liveBadge.getAttribute('class');

    // Click to toggle
    await enableButton.click();

    // Verify style changed
    const newClass = await liveBadge.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('tab navigation works', async ({ mainWindow }) => {
    // Find tab elements
    const tabs = mainWindow.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Click Melodii (Songs) tab
    const songsTab = mainWindow.locator('[role="tab"]:has-text("Melodii")');
    await songsTab.click();
    await expect(songsTab).toHaveAttribute('data-state', 'active');

    // Click Biblie (Bible) tab
    const bibleTab = mainWindow.locator('[role="tab"]:has-text("Biblie")');
    await bibleTab.click();
    await expect(bibleTab).toHaveAttribute('data-state', 'active');
  });

  test('settings button is present', async ({ mainWindow }) => {
    const settingsButton = mainWindow.locator('[data-testid="settings-button"]');
    await expect(settingsButton).toBeVisible();
    await expect(settingsButton).toHaveAttribute('aria-label', 'Setări');
  });
});
