import { test, expect } from '../fixtures/electron-fixture';
import {
  addSong,
  searchSongInPalette,
  closeCommandPalette,
} from '../helpers/song-helpers';

const SONG_NAME = 'Service List Test Song';
const SONG_CONTENT = `Verse
Praise the Lord all ye nations
Praise him all ye people
---
Chorus
For his merciful kindness is great
And the truth of the Lord endures forever
---
Verse Chorus`;

test.describe('Service List', () => {
  test('can add a song to the service list', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Search for the song in the command palette
    await searchSongInPalette(mainWindow, 'service list test');

    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Hover to reveal the add-to-service-list button
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Add ${SONG_NAME} to service list"]`).click();
    await mainWindow.waitForTimeout(500);

    // Close the command palette
    await closeCommandPalette(mainWindow);

    // Verify the song appears in the service list (left panel)
    const serviceListItem = mainWindow.locator('li').filter({ hasText: SONG_NAME });
    await expect(serviceListItem).toBeVisible({ timeout: 5000 });
  });

  test('service list song is clickable to select', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Add song to service list via palette
    await searchSongInPalette(mainWindow, 'service list test');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Add ${SONG_NAME} to service list"]`).click();
    await mainWindow.waitForTimeout(500);
    await closeCommandPalette(mainWindow);

    // Click the song name in the service list
    const serviceListSong = mainWindow.locator('li').filter({ hasText: SONG_NAME }).locator('span.flex-1');
    await serviceListSong.click();
    await mainWindow.waitForTimeout(500);

    // Slides panel should now show slides for this song
    // Filter for content slides (non-empty text) since the app adds empty boundary slides
    const slides = mainWindow.locator('.bg-black').filter({ hasText: /.+/ }).filter({
      has: mainWindow.locator('.font-montserrat'),
    });
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
  });

  test('can remove a song from service list', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Add song to service list
    await searchSongInPalette(mainWindow, 'service list test');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Add ${SONG_NAME} to service list"]`).click();
    await mainWindow.waitForTimeout(500);
    await closeCommandPalette(mainWindow);

    // Verify the song is in the service list
    const serviceListItem = mainWindow.locator('li').filter({ hasText: SONG_NAME });
    await expect(serviceListItem).toBeVisible({ timeout: 5000 });

    // Hover the service list item and click the remove button
    await serviceListItem.hover();
    await mainWindow.locator(`button[aria-label="Remove ${SONG_NAME} from service list"]`).click();
    await mainWindow.waitForTimeout(500);

    // Song should be gone from service list
    await expect(serviceListItem).not.toBeVisible({ timeout: 5000 });

    // Empty state text should appear
    await expect(mainWindow.locator('text=No songs in service list')).toBeVisible();
  });

  test('service list persists after tab switch', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Add song to service list
    await searchSongInPalette(mainWindow, 'service list test');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Add ${SONG_NAME} to service list"]`).click();
    await mainWindow.waitForTimeout(500);
    await closeCommandPalette(mainWindow);

    // Verify song is in service list
    await expect(mainWindow.locator('li').filter({ hasText: SONG_NAME })).toBeVisible({ timeout: 5000 });

    // Switch to Bible tab
    await mainWindow.locator('[role="tab"]').filter({ hasText: 'Bible' }).click();
    await mainWindow.waitForTimeout(500);

    // Switch back to Songs tab
    await mainWindow.locator('[role="tab"]').filter({ hasText: 'Songs' }).click();
    await mainWindow.waitForTimeout(500);

    // Song should still be in the service list
    await expect(mainWindow.locator('li').filter({ hasText: SONG_NAME })).toBeVisible({ timeout: 5000 });
  });

  test('empty state shows when no songs in service list', async ({ mainWindow }) => {
    // Initially, service list should be empty
    await expect(mainWindow.locator('text=No songs in service list')).toBeVisible({ timeout: 5000 });
  });
});
