import { test, expect } from '../fixtures/electron-fixture';
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
  test('can add a new song', async ({ mainWindow }) => {
    // Add a song via command palette
    await addSong(mainWindow, TEST_SONG_NAME, TEST_SONG_CONTENT);

    // Search for it in the command palette (need >= 7 chars)
    await searchSongInPalette(mainWindow, 'amazing grace');

    // Verify the song appears in the results
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: TEST_SONG_NAME });
    await expect(songItem).toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('validates empty song name', async ({ mainWindow }) => {
    await openCreateSongDialog(mainWindow);

    // Fill content but leave name empty
    await mainWindow.locator('#song-content').fill(TEST_SONG_CONTENT);

    // The Add Song button should be disabled when name is empty
    const addButton = mainWindow.locator('button:has-text("Add Song")');
    await expect(addButton).toBeDisabled();

    // Cancel
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('validates empty song content', async ({ mainWindow }) => {
    await openCreateSongDialog(mainWindow);

    // Fill name but leave content empty
    await mainWindow.locator('#song-name').fill('Some Song');

    // The Add Song button should be disabled when content is empty
    const addButton = mainWindow.locator('button:has-text("Add Song")');
    await expect(addButton).toBeDisabled();

    // Cancel
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('can edit a song name', async ({ mainWindow }) => {
    // First add a song
    await addSong(mainWindow, TEST_SONG_NAME, TEST_SONG_CONTENT);

    // Search for it in the command palette
    await searchSongInPalette(mainWindow, 'amazing grace');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: TEST_SONG_NAME });
    await expect(songItem).toBeVisible();

    // Hover to reveal action buttons, then click edit
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Edit ${TEST_SONG_NAME}"]`).click();

    // Wait for edit dialog
    await expect(mainWindow.locator('text=Edit Song')).toBeVisible({ timeout: 5000 });

    // Change the name
    const nameInput = mainWindow.locator('#song-name');
    await nameInput.clear();
    await nameInput.fill('Updated Grace Song');

    // Save
    await mainWindow.locator('button:has-text("Save")').click();
    await expect(mainWindow.locator('text=Edit Song')).not.toBeVisible({ timeout: 10000 });

    // Search for the updated name in the command palette
    await searchSongInPalette(mainWindow, 'updated grace');
    const updatedSong = mainWindow.locator('[cmdk-item]').filter({ hasText: 'Updated Grace Song' });
    await expect(updatedSong).toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('can delete a song', async ({ mainWindow }) => {
    const songName = 'Song To Delete Test';
    const songContent = `Verse
This song will be deleted soon
It is just a test

---
Verse`;

    // Add a song
    await addSong(mainWindow, songName, songContent);

    // Search for it in the command palette
    await searchSongInPalette(mainWindow, 'song to delete');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: songName });
    await expect(songItem).toBeVisible();

    // Hover and click delete
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Delete ${songName}"]`).click();

    // Confirm deletion in the dialog
    await expect(mainWindow.locator('text=Delete Song')).toBeVisible({ timeout: 5000 });
    await expect(
      mainWindow.locator(`text=Are you sure you want to delete "${songName}"?`),
    ).toBeVisible();
    await mainWindow.locator('button:has-text("Delete")').last().click();

    // Wait for dialog to close
    await expect(mainWindow.locator('text=Delete Song')).not.toBeVisible({ timeout: 5000 });

    // Search again — song should no longer appear
    await searchSongInPalette(mainWindow, 'song to delete');
    await expect(
      mainWindow.locator('[cmdk-item]').filter({ hasText: songName }),
    ).not.toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('can cancel adding a song', async ({ mainWindow }) => {
    await openCreateSongDialog(mainWindow);

    // Fill in data
    await mainWindow.locator('#song-name').fill('Cancelled Song');
    await mainWindow.locator('#song-content').fill(`Verse\nSome test lyrics here\n---\nVerse`);

    // Cancel instead of saving
    await mainWindow.locator('button:has-text("Cancel")').click();
    await expect(mainWindow.locator('text=Add New Song')).not.toBeVisible();

    // Verify the song was NOT added
    await searchSongInPalette(mainWindow, 'cancelled song');
    await expect(
      mainWindow.locator('[cmdk-item]').filter({ hasText: 'Cancelled Song' }),
    ).not.toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('can cancel deleting a song', async ({ mainWindow }) => {
    const songName = 'Song Cancel Delete Test';
    const songContent = `Verse
Do not delete me please
I want to stay here

---
Verse`;

    // Add a song
    await addSong(mainWindow, songName, songContent);

    // Search for it
    await searchSongInPalette(mainWindow, 'song cancel delete');
    const songItem = mainWindow.locator('[cmdk-item]').filter({ hasText: songName });
    await expect(songItem).toBeVisible();

    // Open delete dialog
    await songItem.hover();
    await mainWindow.locator(`button[aria-label="Delete ${songName}"]`).click();
    await expect(mainWindow.locator('text=Delete Song')).toBeVisible({ timeout: 5000 });

    // Cancel
    await mainWindow.locator('button:has-text("Cancel")').click();
    await expect(mainWindow.locator('text=Delete Song')).not.toBeVisible();

    // Song should still be findable
    await searchSongInPalette(mainWindow, 'song cancel delete');
    await expect(
      mainWindow.locator('[cmdk-item]').filter({ hasText: songName }),
    ).toBeVisible();

    await closeCommandPalette(mainWindow);
  });

  test('add dialog resets fields on reopen', async ({ mainWindow }) => {
    // Open add dialog and fill data
    await openCreateSongDialog(mainWindow);
    await mainWindow.locator('#song-name').fill('Temporary Name');
    await mainWindow.locator('#song-content').fill('Temporary content');

    // Cancel
    await mainWindow.locator('button:has-text("Cancel")').click();

    // Reopen the dialog
    await openCreateSongDialog(mainWindow);

    // Fields should be empty
    await expect(mainWindow.locator('#song-name')).toHaveValue('');
    await expect(mainWindow.locator('#song-content')).toHaveValue('');

    // Cancel
    await mainWindow.locator('button:has-text("Cancel")').click();
  });
});
