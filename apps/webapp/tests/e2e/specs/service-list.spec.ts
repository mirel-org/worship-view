import { test, expect } from '../fixtures/browser-fixture';
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
  test('can add a song to the service list', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Search for the song in the command palette
    await searchSongInPalette(appPage, 'service list test');

    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await expect(songItem).toBeVisible({ timeout: 5000 });

    // Hover to reveal the add-to-service-list button
    await songItem.hover();
    await appPage.locator(`button[aria-label="Adaugă ${SONG_NAME} la lista de melodii"]`).click();
    await appPage.waitForTimeout(500);

    // Close the command palette
    await closeCommandPalette(appPage);

    // Verify the song appears in the service list (left panel)
    const serviceListItem = appPage.locator('li').filter({ hasText: SONG_NAME });
    await expect(serviceListItem).toBeVisible({ timeout: 5000 });
  });

  test('service list song is clickable to select', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Add song to service list via palette
    await searchSongInPalette(appPage, 'service list test');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await appPage.locator(`button[aria-label="Adaugă ${SONG_NAME} la lista de melodii"]`).click();
    await appPage.waitForTimeout(500);
    await closeCommandPalette(appPage);

    // Click the song name in the service list
    const serviceListSong = appPage.locator('li').filter({ hasText: SONG_NAME }).locator('span.flex-1');
    await serviceListSong.click();
    await appPage.waitForTimeout(500);

    // Slides panel should now show slides for this song
    // Filter for content slides (non-empty text) since the app adds empty boundary slides
    const slides = appPage.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ });
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
  });

  test('can remove a song from service list', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Add song to service list
    await searchSongInPalette(appPage, 'service list test');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await appPage.locator(`button[aria-label="Adaugă ${SONG_NAME} la lista de melodii"]`).click();
    await appPage.waitForTimeout(500);
    await closeCommandPalette(appPage);

    // Verify the song is in the service list
    const serviceListItem = appPage.locator('li').filter({ hasText: SONG_NAME });
    await expect(serviceListItem).toBeVisible({ timeout: 5000 });

    // Hover the service list item and click the remove button
    await serviceListItem.hover();
    await appPage.locator(`button[aria-label="Elimină ${SONG_NAME} din lista de melodii"]`).click();
    await appPage.waitForTimeout(500);

    // Song should be gone from service list
    await expect(serviceListItem).not.toBeVisible({ timeout: 5000 });

    // Empty state text should appear
    await expect(appPage.locator('text=Niciun cântec în lista de melodii')).toBeVisible();
  });

  test('service list persists after tab switch', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Add song to service list
    await searchSongInPalette(appPage, 'service list test');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: SONG_NAME });
    await songItem.hover();
    await appPage.locator(`button[aria-label="Adaugă ${SONG_NAME} la lista de melodii"]`).click();
    await appPage.waitForTimeout(500);
    await closeCommandPalette(appPage);

    // Verify song is in service list
    await expect(appPage.locator('li').filter({ hasText: SONG_NAME })).toBeVisible({ timeout: 5000 });

    // Switch to Bible tab
    await appPage.locator('[role="tab"]').filter({ hasText: 'Biblie' }).click();
    await appPage.waitForTimeout(500);

    // Switch back to Songs tab
    await appPage.locator('[role="tab"]').filter({ hasText: 'Melodii' }).click();
    await appPage.waitForTimeout(500);

    // Song should still be in the service list
    await expect(appPage.locator('li').filter({ hasText: SONG_NAME })).toBeVisible({ timeout: 5000 });
  });

  test('empty state shows when no songs in service list', async ({ appPage }) => {
    // Initially, service list should be empty
    await expect(appPage.locator('text=Niciun cântec în lista de melodii')).toBeVisible({ timeout: 5000 });
  });
});
