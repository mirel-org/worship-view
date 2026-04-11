import { test, expect } from '../fixtures/electron-fixture';

async function openSettings(page: import('@playwright/test').Page) {
  await page.locator('[data-testid="settings-button"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
}

test.describe('Settings Tab Content', () => {
  test('mod auto tab renders content', async ({ mainWindow }) => {
    await openSettings(mainWindow);
    await mainWindow.getByRole('tab', { name: 'Mod Auto', exact: true }).click();

    await expect(mainWindow.getByRole('heading', { name: 'Mod Auto' })).toBeVisible();
    await expect(mainWindow.locator('label:has-text("Cheie API Soniox")')).toBeVisible();
    await expect(mainWindow.getByText('Activează Mod Auto', { exact: true })).toBeVisible();
  });

  test('cantece tab renders content', async ({ mainWindow }) => {
    await openSettings(mainWindow);
    await mainWindow.getByRole('tab', { name: 'Cântece', exact: true }).click();

    await expect(mainWindow.locator('input[placeholder="Caută cântece..."]')).toBeVisible();
    await expect(mainWindow.getByText('Previzualizare', { exact: true })).toBeVisible();
    await expect(mainWindow.getByText('Nu există cântece în bibliotecă.', { exact: true })).toBeVisible();
  });
});
