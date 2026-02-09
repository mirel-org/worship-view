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

    // Get initial state
    const initialText = await enableButton.textContent();

    // Click to toggle
    await enableButton.click();

    // Verify state changed
    const newText = await enableButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('tab navigation works', async ({ mainWindow }) => {
    // Find tab elements
    const tabs = mainWindow.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Click Songs tab
    const songsTab = mainWindow.locator('[role="tab"]:has-text("Songs")');
    await songsTab.click();
    await expect(songsTab).toHaveAttribute('data-state', 'active');

    // Click Bible tab
    const bibleTab = mainWindow.locator('[role="tab"]:has-text("Bible")');
    await bibleTab.click();
    await expect(bibleTab).toHaveAttribute('data-state', 'active');

    // Click Prayer tab
    const prayerTab = mainWindow.locator('[role="tab"]:has-text("Prayer")');
    await prayerTab.click();
    await expect(prayerTab).toHaveAttribute('data-state', 'active');
  });

  test('settings button is present', async ({ mainWindow }) => {
    const settingsButton = mainWindow.locator('[data-testid="settings-button"]');
    await expect(settingsButton).toBeVisible();
    await expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
  });
});
