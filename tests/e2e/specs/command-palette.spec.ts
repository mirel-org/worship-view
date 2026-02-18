import { test, expect } from '../fixtures/electron-fixture';
import {
  openCommandPalette,
  closeCommandPalette,
  addSong,
  searchSongInPalette,
} from '../helpers/song-helpers';

const SONG_NAME = 'Palette Search Test Song';
const SONG_CONTENT = `Verse
O come let us adore him
O come let us adore him
---
Chorus
Christ the Lord we praise your name
Forever and ever amen
---
Verse Chorus`;

test.describe('Command Palette', () => {
  test('F1 opens command palette', async ({ mainWindow }) => {
    await mainWindow.keyboard.press('F1');
    await expect(mainWindow.locator('[cmdk-input]')).toBeVisible({ timeout: 5000 });
  });

  test('F2 opens command palette', async ({ mainWindow }) => {
    await mainWindow.keyboard.press('F2');
    await expect(mainWindow.locator('[cmdk-input]')).toBeVisible({ timeout: 5000 });
  });

  test('Escape closes command palette', async ({ mainWindow }) => {
    await openCommandPalette(mainWindow);
    await mainWindow.keyboard.press('Escape');
    await expect(mainWindow.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
  });

  test('shows commands when search is empty', async ({ mainWindow }) => {
    await openCommandPalette(mainWindow);

    // Default commands should be visible when search is empty
    await expect(mainWindow.locator('[cmdk-item]').filter({ hasText: 'Creează cântec nou' })).toBeVisible();
    await expect(mainWindow.locator('[cmdk-item]').filter({ hasText: 'Golește lista de melodii' })).toBeVisible();
    await expect(mainWindow.locator('[cmdk-item]').filter({ hasText: 'Deschide setările' })).toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('song search requires >= 7 characters', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Type only 6 characters — should NOT show song results
    await openCommandPalette(mainWindow);
    await mainWindow.locator('[cmdk-input]').fill('palett');
    await mainWindow.waitForTimeout(500);

    // Song should not appear with only 6 chars
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).not.toBeVisible();

    // Type 7+ characters — songs should appear
    await mainWindow.locator('[cmdk-input]').fill('palette search');
    await mainWindow.waitForTimeout(500);

    await expect(songItem).toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('Bible verse search with reference', async ({ mainWindow }) => {
    // Bible verse search triggers when query contains a digit
    // VDC.json uses Romanian book names: "ioan" = John
    await openCommandPalette(mainWindow);
    await mainWindow.locator('[cmdk-input]').fill('ioan 3 16');
    await mainWindow.waitForTimeout(500);

    // A verse result should appear
    const verseItem = mainWindow.locator('[cmdk-item]').filter({ hasText: 'IOAN 3:16' });
    await expect(verseItem).toBeVisible({ timeout: 5000 });

    await closeCommandPalette(mainWindow);
  });

  test('selecting a song switches to Songs tab', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Switch to Bible tab first
    await mainWindow.locator('[role="tab"]').filter({ hasText: 'Biblie' }).click();
    await mainWindow.waitForTimeout(300);
    await expect(mainWindow.locator('[role="tab"]').filter({ hasText: 'Biblie' })).toHaveAttribute('data-state', 'active');

    // Now search and select the song via Enter key (more reliable than click for cmdk)
    await searchSongInPalette(mainWindow, 'palette search');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Use Enter to select (the first matching item is auto-highlighted by cmdk)
    await mainWindow.keyboard.press('Enter');

    // Palette should close
    await expect(mainWindow.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Songs tab should now be active
    await expect(mainWindow.locator('[role="tab"]').filter({ hasText: 'Melodii' })).toHaveAttribute('data-state', 'active', { timeout: 5000 });
  });

  test('selecting a verse switches to Bible tab', async ({ mainWindow }) => {
    // Start on Songs tab (default)
    await expect(mainWindow.locator('[role="tab"]').filter({ hasText: 'Melodii' })).toHaveAttribute('data-state', 'active');

    // Search for a verse and select it
    await openCommandPalette(mainWindow);
    await mainWindow.locator('[cmdk-input]').fill('ioan 3 16');
    await mainWindow.waitForTimeout(500);

    const verseItem = mainWindow.locator('[cmdk-item]').filter({ hasText: 'IOAN 3:16' });
    await expect(verseItem).toBeVisible({ timeout: 5000 });
    await verseItem.click();

    // Palette should close
    await expect(mainWindow.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Bible tab should now be active
    await expect(mainWindow.locator('[role="tab"]').filter({ hasText: 'Biblie' })).toHaveAttribute('data-state', 'active');
  });

  test('command palette preview shows song content', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Search for the song
    await searchSongInPalette(mainWindow, 'palette search');

    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Hover/navigate to the song to trigger preview (cmdk auto-highlights first match)
    // The preview panel (right side) should show the song name and content
    await mainWindow.waitForTimeout(500);

    // Preview panel should show the song name
    const previewName = mainWindow.locator('h4').filter({ hasText: SONG_NAME });
    await expect(previewName).toBeVisible({ timeout: 5000 });

    // Preview should show song slide content
    const previewSlides = mainWindow.locator('[data-testid="command-preview-slide"]');
    await expect(previewSlides.first()).toBeVisible({ timeout: 5000 });

    await closeCommandPalette(mainWindow);
  });
});
