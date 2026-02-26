import { test, expect } from '../fixtures/browser-fixture';

test.describe('UI Interactions', () => {
  test('app renders with content', async ({ appPage }) => {
    // Verify the app renders with meaningful content
    const appDiv = appPage.locator('#app');
    await expect(appDiv).toBeVisible();

    const appContent = await appDiv.innerHTML();
    expect(appContent.length).toBeGreaterThan(100);
  });

  test('tab navigation works', async ({ appPage }) => {
    // Find tab elements
    const tabs = appPage.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Click Melodii (Songs) tab
    const songsTab = appPage.locator('[role="tab"]:has-text("Melodii")');
    await songsTab.click();
    await expect(songsTab).toHaveAttribute('data-state', 'active');

    // Click Biblie (Bible) tab
    const bibleTab = appPage.locator('[role="tab"]:has-text("Biblie")');
    await bibleTab.click();
    await expect(bibleTab).toHaveAttribute('data-state', 'active');
  });

  test('settings button is present', async ({ appPage }) => {
    const settingsButton = appPage.locator('[data-testid="settings-button"]');
    await expect(settingsButton).toBeVisible();
    await expect(settingsButton).toHaveAttribute('aria-label', 'Setări');
  });
});
