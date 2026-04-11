import { test, expect } from '../fixtures/browser-fixture';
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
  test('F1 opens command palette', async ({ appPage }) => {
    await appPage.keyboard.press('F1');
    await expect(appPage.locator('[cmdk-input]')).toBeVisible({ timeout: 5000 });
  });

  test('F2 opens command palette', async ({ appPage }) => {
    await appPage.keyboard.press('F2');
    await expect(appPage.locator('[cmdk-input]')).toBeVisible({ timeout: 5000 });
  });

  test('Escape closes command palette', async ({ appPage }) => {
    await openCommandPalette(appPage);
    await appPage.keyboard.press('Escape');
    await expect(appPage.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
  });

  test('shows commands when search is empty', async ({ appPage }) => {
    await openCommandPalette(appPage);

    // Default commands should be visible when search is empty
    await expect(appPage.locator('[cmdk-item]').filter({ hasText: 'Creează cântec nou' })).toBeVisible();
    await expect(appPage.locator('[cmdk-item]').filter({ hasText: 'Deschide setările' })).toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('song search requires >= 7 characters', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Type only 6 characters — should NOT show song results
    await openCommandPalette(appPage);
    await appPage.locator('[cmdk-input]').fill('palett');
    await appPage.waitForTimeout(500);

    // Song should not appear with only 6 chars
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).not.toBeVisible();

    // Type 7+ characters — songs should appear
    await appPage.locator('[cmdk-input]').fill('palette search');
    await appPage.waitForTimeout(500);

    await expect(songItem).toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('Bible verse search with reference', async ({ appPage }) => {
    // Bible verse search triggers when query contains a digit
    // VDC.json uses Romanian book names: "ioan" = John
    await openCommandPalette(appPage);
    await appPage.locator('[cmdk-input]').fill('ioan 3 16');
    await appPage.waitForTimeout(500);

    // A verse result should appear
    const verseItem = appPage.getByRole('option', { name: 'IOAN 3:16', exact: true });
    await expect(verseItem).toBeVisible({ timeout: 5000 });

    await closeCommandPalette(appPage);
  });

  test('selecting a song switches to Songs tab', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Switch to Bible tab first
    await appPage.locator('[role="tab"]').filter({ hasText: 'Biblie' }).click();
    await appPage.waitForTimeout(300);
    await expect(appPage.locator('[role="tab"]').filter({ hasText: 'Biblie' })).toHaveAttribute('data-state', 'active');

    // Open palette — commands are shown and cmdk auto-selects the first command.
    // Then type a song query — commands disappear, song appears.
    await searchSongInPalette(appPage, 'palette search');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Click the song to select it
    await songItem.click();

    // Palette should close
    await expect(appPage.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Songs tab should now be active
    await expect(appPage.locator('[role="tab"]').filter({ hasText: 'Melodii' })).toHaveAttribute('data-state', 'active', { timeout: 5000 });

    const songHeader = appPage.locator('span').filter({ hasText: SONG_NAME });
    await expect(songHeader.first()).toBeVisible({ timeout: 5000 });
  });

  test('selecting a verse switches to Bible tab', async ({ appPage }) => {
    // Start on Songs tab (default)
    await expect(appPage.locator('[role="tab"]').filter({ hasText: 'Melodii' })).toHaveAttribute('data-state', 'active');

    // Search for a verse and select it
    await openCommandPalette(appPage);
    await appPage.locator('[cmdk-input]').fill('ioan 3 16');
    await appPage.waitForTimeout(500);

    const verseItem = appPage.getByRole('option', { name: 'IOAN 3:16', exact: true });
    await expect(verseItem).toBeVisible({ timeout: 5000 });
    await verseItem.click();

    // Palette should close
    await expect(appPage.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Bible tab should now be active
    await expect(appPage.locator('[role="tab"]').filter({ hasText: 'Biblie' })).toHaveAttribute('data-state', 'active');
  });

  test('command palette preview shows song content', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Search for the song
    await searchSongInPalette(appPage, 'palette search');

    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Hover/navigate to the song to trigger preview (cmdk auto-highlights first match)
    // The preview panel (right side) should show the song name and content
    await appPage.waitForTimeout(500);

    // Preview panel should show the song name
    const previewName = appPage.locator('h4').filter({ hasText: SONG_NAME });
    await expect(previewName).toBeVisible({ timeout: 5000 });

    // Preview should show song slide content
    const previewSlides = appPage.locator('[data-testid="command-preview-slide"]');
    await expect(previewSlides.first()).toBeVisible({ timeout: 5000 });

    await closeCommandPalette(appPage);
  });
});
