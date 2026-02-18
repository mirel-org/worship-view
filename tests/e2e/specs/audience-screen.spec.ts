import { test, expect } from '../fixtures/electron-fixture';
import { addSong, selectSongFromPalette, selectVerseFromPalette } from '../helpers/song-helpers';

const SONG_NAME = 'Amazing Grace Audience';
const SONG_CONTENT = `Verse
Amazing grace how sweet the sound
That saved a wretch like me
---
Chorus
Through many dangers toils and snares
I have already come
---
Verse Chorus`;

/**
 * Get content slides in the main slides panel.
 * Filters for slides with non-empty text content.
 */
function getContentSlides(page: import('@playwright/test').Page) {
  return page.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ });
}

async function focusAppWindow(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();
    window.focus();
  });
  await page.waitForTimeout(200);
}

test.describe('Audience Screen', () => {
  test('enable/disable button toggles', async ({ mainWindow }) => {
    const enableBtn = mainWindow.locator('[data-testid="enable-button"]');
    await expect(enableBtn).toBeVisible({ timeout: 5000 });

    const liveBadge = enableBtn.locator('span').last();
    const initialClass = await liveBadge.getAttribute('class');

    // Click to disable
    await enableBtn.click();
    const disabledClass = await liveBadge.getAttribute('class');
    expect(disabledClass).not.toBe(initialClass);

    // Click to enable again
    await enableBtn.click();
    const enabledClass = await liveBadge.getAttribute('class');
    expect(enabledClass).toBe(initialClass);
  });

  test('song projection shows on audience screen', async ({ mainWindow, audienceWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'amazing grace audience', SONG_NAME);

    // Wait for slides to appear and click the first content slide
    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
    await slides.first().click();
    await mainWindow.waitForTimeout(300);

    // Real audience child window should contain the song text
    // Note: SongSlide uses CSS uppercase but textContent returns original case
    await expect(audienceWindow.locator('body')).toContainText(/amazing grace/i, { timeout: 5000 });
  });

  test('song slide navigation updates audience screen', async ({ mainWindow, audienceWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'amazing grace audience', SONG_NAME);

    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide
    await slides.first().click();
    await mainWindow.waitForTimeout(300);

    await expect(audienceWindow.locator('body')).toContainText(/amazing grace/i, { timeout: 5000 });

    // Press 's' to navigate to next slide
    await mainWindow.keyboard.press('s');
    await mainWindow.waitForTimeout(500);

    // Audience window should now show chorus text
    await expect(audienceWindow.locator('body')).toContainText(/through many dangers/i, { timeout: 5000 });
  });

  test('slide counter shows for songs', async ({ mainWindow, audienceWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'amazing grace audience', SONG_NAME);

    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
    await slides.first().click();
    await mainWindow.waitForTimeout(300);

    // Audience window should contain a slide counter like "1/2"
    await expect(audienceWindow.locator('body')).toContainText(/\d+\/\d+/, { timeout: 5000 });
  });

  test('Escape clears song from audience screen', async ({ mainWindow, audienceWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'amazing grace audience', SONG_NAME);

    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
    await slides.first().click();
    await mainWindow.waitForTimeout(300);

    await expect(audienceWindow.locator('body')).toContainText(/amazing grace/i, { timeout: 5000 });

    // Press Escape to clear
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(500);

    // Song text should no longer appear in the audience window
    await expect(audienceWindow.locator('body')).not.toContainText(/amazing grace/i, { timeout: 5000 });
  });

  test('verse projection shows on audience screen after Enter', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    // Ensure keyboard focus without clicking top-left controls.
    await focusAppWindow(mainWindow);

    // Press Enter to enable verse projection
    await mainWindow.keyboard.press('Enter');
    await mainWindow.waitForTimeout(300);

    // Audience window should contain verse text and reference
    await expect(audienceWindow.locator('body')).toContainText('Dumnezeu', { timeout: 5000 });
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:16', { timeout: 5000 });
  });

  test('verse not shown on audience screen without Enter', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    // Without pressing Enter, verse projection is disabled
    await expect(audienceWindow.locator('body')).not.toContainText('Dumnezeu', { timeout: 3000 });
  });

  test('Escape clears verse from audience screen', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Enable verse projection
    await mainWindow.keyboard.press('Enter');
    await mainWindow.waitForTimeout(300);

    await expect(audienceWindow.locator('body')).toContainText('Dumnezeu', { timeout: 5000 });

    // Press Escape to clear
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(500);

    // Verse should no longer appear
    await expect(audienceWindow.locator('body')).not.toContainText('Dumnezeu', { timeout: 5000 });
  });

  test('song to verse transition on audience screen', async ({ mainWindow, audienceWindow }) => {
    // First, set up a song
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'amazing grace audience', SONG_NAME);

    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });
    await slides.first().click();
    await mainWindow.waitForTimeout(300);

    await expect(audienceWindow.locator('body')).toContainText(/amazing grace/i, { timeout: 5000 });

    // Now select a verse — this should switch projection type
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Enable verse projection
    await mainWindow.keyboard.press('Enter');
    await mainWindow.waitForTimeout(300);

    // Audience should now show verse instead of song
    await expect(audienceWindow.locator('body')).toContainText('Dumnezeu', { timeout: 5000 });
    await expect(audienceWindow.locator('body')).not.toContainText(/amazing grace/i, { timeout: 3000 });
  });
});
