import type { Page } from '@playwright/test';
import { expect } from '../fixtures/electron-fixture';

/**
 * Import files via the Settings > Import Songs dialog.
 *
 * Opens Settings, navigates to the Import Songs tab, sets files on the
 * hidden file input, clicks Import, waits for results, then closes the dialog.
 */
export async function importFiles(
  page: Page,
  files: Array<{ name: string; content: string }>,
) {
  // Open settings
  await page.locator('[data-testid="settings-button"]').click();
  await expect(page.locator('text=Import Songs')).toBeVisible({ timeout: 5000 });

  // Click the Import Songs tab
  await page.locator('[role="tab"]:has-text("Importă cântece")').click();

  // Set files on the hidden input
  await page.locator('#file-input').setInputFiles(
    files.map((f) => ({
      name: f.name,
      mimeType: 'text/xml',
      buffer: Buffer.from(f.content, 'utf-8'),
    })),
  );

  // Wait for files to appear in the selected list
  await expect(
    page.locator('text=Selected Files'),
  ).toBeVisible({ timeout: 5000 });

  // Click the Import Songs action button (not the tab trigger which has role="tab")
  await page.locator('button:not([role="tab"]):has-text("Importă cântece")').click();

  // Wait for results to appear
  await page.locator('text=processed').waitFor({ timeout: 10000 });

  // Close settings dialog
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="settings-button"]')).toBeVisible({ timeout: 5000 });
}
