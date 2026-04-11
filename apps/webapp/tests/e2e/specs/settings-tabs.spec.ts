import { test, expect } from '../fixtures/browser-fixture';

async function openSettings(page: import('@playwright/test').Page) {
  await page.locator('[data-testid="settings-button"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
}

test.describe('Settings Tab Content', () => {
  test('cantece tab renders content', async ({ appPage }) => {
    await openSettings(appPage);
    await appPage.getByRole('tab', { name: 'Cântece', exact: true }).click();

    await expect(appPage.locator('input[placeholder="Caută cântece..."]')).toBeVisible();
    await expect(appPage.getByText('Previzualizare', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Nu există cântece în bibliotecă.', { exact: true })).toBeVisible();
  });
});
