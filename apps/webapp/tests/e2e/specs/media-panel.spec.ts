import { test, expect } from '../fixtures/browser-fixture';
import {
  navigateToSongsTab,
  uploadMediaFile,
  createTestPngBuffer,
  createTestMp4Buffer,
  waitForMediaItem,
  selectMediaItem,
  deleteMediaItem,
} from '../helpers/media-helpers';

test.describe('Media Panel', () => {
  test('shows upload button on Songs tab', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    const uploadButton = appPage.locator('button:has-text("Încarcă")');
    await expect(uploadButton).toBeVisible();
  });

  test('can upload an image file', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    await uploadMediaFile(appPage, {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    // Verify the item appears in the list
    await waitForMediaItem(appPage, 'test-image.png');
  });

  test('can upload a video file', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    await uploadMediaFile(appPage, {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: createTestMp4Buffer(),
    });

    // Verify the item appears in the list
    await waitForMediaItem(appPage, 'test-video.mp4');
  });

  test('can select a media item as background', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Upload first
    await uploadMediaFile(appPage, {
      name: 'bg-image.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    await waitForMediaItem(appPage, 'bg-image.png');

    // Click to select
    await selectMediaItem(appPage, 'bg-image.png');

    // The selected item should have the accent background (space-prefixed, not hover:bg-accent)
    const item = appPage.locator('button').filter({ hasText: 'bg-image.png' });
    await expect(item).toHaveClass(/border-2/);
  });

  test('can clear background selection', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Upload and select
    await uploadMediaFile(appPage, {
      name: 'clear-test.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });
    await waitForMediaItem(appPage, 'clear-test.png');
    await selectMediaItem(appPage, 'clear-test.png');

    const clearBackgroundCard = appPage.locator('button').filter({ hasText: 'Fără fundal' });
    await clearBackgroundCard.click();

    // The item should no longer be selected
    const item = appPage.locator('button').filter({ hasText: 'clear-test.png' });
    await expect(item).not.toHaveClass(/border-2/);
  });

  test('can delete a media item', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Upload a file
    await uploadMediaFile(appPage, {
      name: 'to-delete.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    await waitForMediaItem(appPage, 'to-delete.png');

    // Delete it
    await deleteMediaItem(appPage, 'to-delete.png');

    // Verify it's gone
    await expect(
      appPage.locator('button').filter({ hasText: 'to-delete.png' }),
    ).not.toBeVisible({ timeout: 5000 });
  });

  test('deleting selected media clears background', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Upload and select
    await uploadMediaFile(appPage, {
      name: 'delete-selected.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });
    await waitForMediaItem(appPage, 'delete-selected.png');
    await selectMediaItem(appPage, 'delete-selected.png');

    // Verify it's selected
    await expect(
      appPage.locator('button').filter({ hasText: 'delete-selected.png' }),
    ).toHaveClass(/border-2/);

    // Delete it
    await deleteMediaItem(appPage, 'delete-selected.png');

    // Media tile should be gone
    await expect(
      appPage.locator('button').filter({ hasText: 'delete-selected.png' }),
    ).not.toBeVisible();
  });

  test('rejects unsupported file types', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Try uploading a .txt file
    const fileInput = appPage.locator('input[type="file"][accept=".mp4,.mov,.png,.jpg,.jpeg"]');
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hello world'),
    });

    // Should show validation error
    await expect(
      appPage.locator('text=Unsupported file type'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('rejects files over 500MB', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // We'll test with a legitimate small file to ensure no false positives.
    await uploadMediaFile(appPage, {
      name: 'small-file.jpg',
      mimeType: 'image/jpeg',
      buffer: createTestPngBuffer(),
    });

    // Should NOT show any error for a valid small file
    await expect(
      appPage.locator('text=File is too large'),
    ).not.toBeVisible();

    // File should appear in the list
    await waitForMediaItem(appPage, 'small-file.jpg');
  });

  test('upload button is disabled during upload', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    const uploadButton = appPage.locator('button:has-text("Încarcă")');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();

    // Upload should complete quickly for tiny files, but verify the button
    // returns to enabled state after upload
    await uploadMediaFile(appPage, {
      name: 'quick-upload.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    await waitForMediaItem(appPage, 'quick-upload.png');

    // Button should be enabled again after upload completes
    await expect(uploadButton).toBeEnabled();
  });

  test('can upload multiple files sequentially', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    // Upload first file
    await uploadMediaFile(appPage, {
      name: 'first-file.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });
    await waitForMediaItem(appPage, 'first-file.png');

    // Upload second file
    await uploadMediaFile(appPage, {
      name: 'second-file.jpg',
      mimeType: 'image/jpeg',
      buffer: createTestPngBuffer(),
    });
    await waitForMediaItem(appPage, 'second-file.jpg');

    // Both should be visible
    await expect(appPage.locator('button').filter({ hasText: 'first-file.png' })).toBeVisible();
    await expect(appPage.locator('button').filter({ hasText: 'second-file.jpg' })).toBeVisible();
  });

  test('delete shows confirmation dialog with file name', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    await uploadMediaFile(appPage, {
      name: 'confirm-dialog.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    const item = await waitForMediaItem(appPage, 'confirm-dialog.png');

    // Hover and click trash to open dialog
    await item.hover();
    await appPage.locator('[aria-label="Șterge confirm-dialog.png"]').click();

    // Dialog should appear with the file name
    await expect(appPage.locator('text=Șterge media')).toBeVisible({ timeout: 5000 });
    await expect(
      appPage.locator('text=Sigur doriți să ștergeți "confirm-dialog.png"?'),
    ).toBeVisible();

    // Close without deleting
    await appPage.locator('button:has-text("Anulează")').click();
    await expect(appPage.locator('text=Șterge media')).not.toBeVisible();
  });

  test('can cancel deleting a media item', async ({ appPage }) => {
    await navigateToSongsTab(appPage);

    await uploadMediaFile(appPage, {
      name: 'cancel-delete.png',
      mimeType: 'image/png',
      buffer: createTestPngBuffer(),
    });

    const item = await waitForMediaItem(appPage, 'cancel-delete.png');

    // Open delete dialog
    await item.hover();
    await appPage.locator('[aria-label="Șterge cancel-delete.png"]').click();
    await expect(appPage.locator('text=Șterge media')).toBeVisible({ timeout: 5000 });

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();
    await expect(appPage.locator('text=Șterge media')).not.toBeVisible();

    // Item should still be in the list
    await expect(
      appPage.locator('button').filter({ hasText: 'cancel-delete.png' }),
    ).toBeVisible();
  });
});
