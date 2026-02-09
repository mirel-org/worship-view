import type { Page } from '@playwright/test';
import { expect } from '../fixtures/electron-fixture';

/**
 * Helper: open the command palette via F1.
 */
export async function openCommandPalette(page: Page) {
  await page.keyboard.press('F1');
  await expect(page.locator('[cmdk-input]')).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: close the command palette via Escape.
 */
export async function closeCommandPalette(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Helper: open the "Create new song" dialog via the command palette.
 */
export async function openCreateSongDialog(page: Page) {
  await openCommandPalette(page);
  const createCmd = page.locator('[cmdk-item]').filter({ hasText: 'Create new song' });
  await createCmd.click();
  await expect(page.locator('text=Add New Song')).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: add a song via the command palette -> Create new song dialog.
 */
export async function addSong(page: Page, name: string, content: string) {
  await openCreateSongDialog(page);

  await page.locator('#song-name').fill(name);
  await page.locator('#song-content').fill(content);

  await page.locator('button:has-text("Add Song")').click();

  await expect(page.locator('text=Add New Song')).not.toBeVisible({ timeout: 10000 });
}

/**
 * Helper: search for a song in the command palette.
 * Songs require >= 7 characters to appear (MIN_SONG_SEARCH_LENGTH).
 */
export async function searchSongInPalette(page: Page, query: string) {
  await openCommandPalette(page);
  await page.locator('[cmdk-input]').fill(query);
  // Give search results time to populate
  await page.waitForTimeout(500);
}

/**
 * Helper: select a song from the command palette search results.
 * This searches for the song, clicks it, and waits for the palette to close.
 */
export async function selectSongFromPalette(page: Page, searchQuery: string, songName: string) {
  await searchSongInPalette(page, searchQuery);
  const songItem = page.locator('[cmdk-item]').filter({ hasText: songName });
  await expect(songItem).toBeVisible({ timeout: 5000 });
  await songItem.click();
  // Wait for the command palette to close
  await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Helper: select a Bible verse from the command palette.
 * Verse search triggers when the query contains a digit.
 */
export async function selectVerseFromPalette(page: Page, query: string, expectedRef: string) {
  await openCommandPalette(page);
  await page.locator('[cmdk-input]').fill(query);
  await page.waitForTimeout(500);

  const verseItem = page.locator('[cmdk-item]').filter({ hasText: expectedRef });
  await expect(verseItem).toBeVisible({ timeout: 5000 });
  await verseItem.click();

  await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
}
