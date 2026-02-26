import { test, expect } from '../fixtures/browser-fixture';
import {
  openCommandPalette,
  closeCommandPalette,
  openCreateSongDialog,
  addSong,
  searchSongInPalette,
} from '../helpers/song-helpers';

const TEST_SONG_NAME = 'Amazing Grace Test Song';
const TEST_SONG_CONTENT = `Verse
Amazing grace how sweet the sound
That saved a wretch like me

I once was lost but now am found
Was blind but now I see
---
Chorus
Through many dangers toils and snares
I have already come

Tis grace has brought me safe thus far
And grace will lead me home
---
Verse Chorus Verse`;

test.describe('Song CRUD', () => {
  test('can add a new song', async ({ appPage }) => {
    // Add a song via command palette
    await addSong(appPage, TEST_SONG_NAME, TEST_SONG_CONTENT);

    // Search for it in the command palette (need >= 7 chars)
    await searchSongInPalette(appPage, 'amazing grace');

    // Verify the song appears in the results
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: TEST_SONG_NAME });
    await expect(songItem).toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('validates empty song name', async ({ appPage }) => {
    await openCreateSongDialog(appPage);

    // Fill content but leave name empty
    await appPage.locator('#song-content').fill(TEST_SONG_CONTENT);

    // The Add Song button should be disabled when name is empty
    const addButton = appPage.locator('button:has-text("Adaugă cântec")');
    await expect(addButton).toBeDisabled();

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();
  });

  test('validates empty song content', async ({ appPage }) => {
    await openCreateSongDialog(appPage);

    // Fill name but leave content empty
    await appPage.locator('#song-name').fill('Some Song');

    // The Add Song button should be disabled when content is empty
    const addButton = appPage.locator('button:has-text("Adaugă cântec")');
    await expect(addButton).toBeDisabled();

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();
  });

  test('can edit a song name', async ({ appPage }) => {
    // First add a song
    await addSong(appPage, TEST_SONG_NAME, TEST_SONG_CONTENT);

    // Search for it in the command palette
    await searchSongInPalette(appPage, 'amazing grace');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: TEST_SONG_NAME });
    await expect(songItem).toBeVisible();

    // Hover to reveal action buttons, then click edit
    await songItem.hover();
    await appPage.locator(`button[aria-label="Editează ${TEST_SONG_NAME}"]`).click();

    // Wait for edit dialog
    await expect(appPage.locator('text=Editează cântec')).toBeVisible({ timeout: 5000 });

    // Change the name
    const nameInput = appPage.locator('#song-name');
    await nameInput.clear();
    await nameInput.fill('Updated Grace Song');

    // Save
    await appPage.locator('button:has-text("Salvează")').click();
    await expect(appPage.locator('text=Editează cântec')).not.toBeVisible({ timeout: 10000 });

    // Search for the updated name in the command palette
    await searchSongInPalette(appPage, 'updated grace');
    const updatedSong = appPage.locator('[cmdk-item]').filter({ hasText: 'Updated Grace Song' });
    await expect(updatedSong).toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('can delete a song', async ({ appPage }) => {
    const songName = 'Song To Delete Test';
    const songContent = `Verse
This song will be deleted soon
It is just a test

---
Verse`;

    // Add a song
    await addSong(appPage, songName, songContent);

    // Search for it in the command palette
    await searchSongInPalette(appPage, 'song to delete');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: songName });
    await expect(songItem).toBeVisible();

    // Hover and click delete
    await songItem.hover();
    await appPage.locator(`button[aria-label="Șterge ${songName}"]`).click();

    // Confirm deletion in the dialog
    await expect(appPage.locator('text=Șterge cântec')).toBeVisible({ timeout: 5000 });
    await expect(
      appPage.locator(`text=Sigur doriți să ștergeți "${songName}"?`),
    ).toBeVisible();
    await appPage.locator('button:has-text("Șterge")').last().click();

    // Wait for dialog to close
    await expect(appPage.locator('text=Șterge cântec')).not.toBeVisible({ timeout: 5000 });

    // Search again — song should no longer appear
    await searchSongInPalette(appPage, 'song to delete');
    await expect(
      appPage.locator('[cmdk-item]').filter({ hasText: songName }),
    ).not.toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('can cancel adding a song', async ({ appPage }) => {
    await openCreateSongDialog(appPage);

    // Fill in data
    await appPage.locator('#song-name').fill('Cancelled Song');
    await appPage.locator('#song-content').fill(`Verse\nSome test lyrics here\n---\nVerse`);

    // Cancel instead of saving
    await appPage.locator('button:has-text("Anulează")').click();
    await expect(appPage.locator('text=Adaugă cântec nou')).not.toBeVisible();

    // Verify the song was NOT added
    await searchSongInPalette(appPage, 'cancelled song');
    await expect(
      appPage.locator('[cmdk-item]').filter({ hasText: 'Cancelled Song' }),
    ).not.toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('can cancel deleting a song', async ({ appPage }) => {
    const songName = 'Song Cancel Delete Test';
    const songContent = `Verse
Do not delete me please
I want to stay here

---
Verse`;

    // Add a song
    await addSong(appPage, songName, songContent);

    // Search for it
    await searchSongInPalette(appPage, 'song cancel delete');
    const songItem = appPage.locator('[cmdk-item]').filter({ hasText: songName });
    await expect(songItem).toBeVisible();

    // Open delete dialog
    await songItem.hover();
    await appPage.locator(`button[aria-label="Șterge ${songName}"]`).click();
    await expect(appPage.locator('text=Șterge cântec')).toBeVisible({ timeout: 5000 });

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();
    await expect(appPage.locator('text=Șterge cântec')).not.toBeVisible();

    // Song should still be findable
    await searchSongInPalette(appPage, 'song cancel delete');
    await expect(
      appPage.locator('[cmdk-item]').filter({ hasText: songName }),
    ).toBeVisible();

    await closeCommandPalette(appPage);
  });

  test('add dialog resets fields on reopen', async ({ appPage }) => {
    // Open add dialog and fill data
    await openCreateSongDialog(appPage);
    await appPage.locator('#song-name').fill('Temporary Name');
    await appPage.locator('#song-content').fill('Temporary content');

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();

    // Reopen the dialog
    await openCreateSongDialog(appPage);

    // Fields should be empty
    await expect(appPage.locator('#song-name')).toHaveValue('');
    await expect(appPage.locator('#song-content')).toHaveValue('');

    // Cancel
    await appPage.locator('button:has-text("Anulează")').click();
  });
});
