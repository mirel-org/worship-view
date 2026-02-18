import type { Page } from '@playwright/test';
import { expect } from '../fixtures/electron-fixture';

/**
 * Navigate to the Songs tab where the Media panel is visible.
 */
export async function navigateToSongsTab(page: Page) {
  const songsTab = page.locator('[role="tab"]').filter({ hasText: 'Melodii' });
  await songsTab.click();
  await expect(songsTab).toHaveAttribute('data-state', 'active');
}

/**
 * Get the Media panel section (identified by the "Media" heading).
 */
export function getMediaPanel(page: Page) {
  return page.locator('span:has-text("Media")').locator('..').locator('..').locator('..');
}

/**
 * Upload a media file via the Media panel's file input.
 * Creates a synthetic file buffer and sets it on the hidden input.
 */
export async function uploadMediaFile(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  // Click the Upload button to ensure the panel is active
  const uploadButton = page.locator('button:has-text("Upload")');
  await expect(uploadButton).toBeVisible({ timeout: 5000 });

  // Set the file on the hidden input
  const fileInput = page.locator('input[type="file"][accept=".mp4,.mov,.png,.jpg,.jpeg"]');
  await fileInput.setInputFiles({
    name: file.name,
    mimeType: file.mimeType,
    buffer: file.buffer,
  });
}

/**
 * Create a minimal valid PNG buffer for testing.
 * This is a 1x1 pixel transparent PNG.
 */
export function createTestPngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64',
  );
}

/**
 * Create a minimal valid MP4 buffer for testing.
 * This is a tiny valid MP4 (ftyp box only).
 */
export function createTestMp4Buffer(): Buffer {
  // Minimal ftyp box: size(4) + 'ftyp'(4) + brand(4) + version(4) = 16 bytes minimum
  const buf = Buffer.alloc(24);
  buf.writeUInt32BE(24, 0); // box size
  buf.write('ftyp', 4); // box type
  buf.write('isom', 8); // major brand
  buf.writeUInt32BE(0, 12); // minor version
  buf.write('isom', 16); // compatible brand
  buf.write('avc1', 20); // compatible brand
  return buf;
}

/**
 * Wait for a media item to appear in the list by name.
 */
export async function waitForMediaItem(page: Page, name: string, timeout = 10000) {
  const item = page.locator('li').filter({ hasText: name });
  await expect(item).toBeVisible({ timeout });
  return item;
}

/**
 * Click a media item in the list by name.
 */
export async function selectMediaItem(page: Page, name: string) {
  const item = await waitForMediaItem(page, name);
  await item.click();
}

/**
 * Delete a media item by hovering, clicking the trash icon, and confirming.
 */
export async function deleteMediaItem(page: Page, name: string) {
  const item = await waitForMediaItem(page, name);
  await item.hover();
  // Click the trash button within the item to open confirmation dialog
  await item.locator('button').click();

  // Confirm deletion in the dialog
  await expect(page.locator('text=Delete Media')).toBeVisible({ timeout: 5000 });
  await page.locator('button:has-text("Delete")').last().click();

  // Wait for dialog to close
  await expect(page.locator('text=Delete Media')).not.toBeVisible({ timeout: 5000 });
}
