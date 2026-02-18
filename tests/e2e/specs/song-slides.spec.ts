import { test, expect } from '../fixtures/electron-fixture';
import { addSong, selectSongFromPalette } from '../helpers/song-helpers';

const SONG_NAME = 'Slide Navigation Test Song';
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
 * Get a locator for song slide items that contain visible text.
 * The app adds empty slides at the start/end of the song, so we filter those out.
 * Slides are bg-black divs containing font-montserrat text divs.
 */
function getContentSlides(page: import('@playwright/test').Page) {
  return page
    .locator('[data-testid="song-slide-item"]')
    .filter({ hasText: /\S+/ });
}

/**
 * Get a locator for ALL slide items (including empty ones).
 */
function getAllSlides(page: import('@playwright/test').Page) {
  return page.locator('[data-testid="song-slide-item"]');
}

test.describe('Song Slides', () => {
  test('selecting a song shows slides panel', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);

    // Select the song from the command palette
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    // Slides should appear with song text
    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });

    // Should have slide text from the song
    const slideTexts = await slides.allTextContents();
    const allText = slideTexts.join(' ').toUpperCase();
    expect(allText).toContain('AMAZING GRACE');
  });

  test('clicking a slide selects it', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    // Wait for content slides to appear
    const slides = getContentSlides(mainWindow);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide
    await slides.first().click();
    await mainWindow.waitForTimeout(300);
    await expect(slides.first()).toHaveAttribute('data-selected', 'true');

    // Click the second content slide (if available)
    const slideCount = await slides.count();
    if (slideCount >= 2) {
      await slides.nth(1).click();
      await mainWindow.waitForTimeout(300);
      await expect(slides.nth(1)).toHaveAttribute('data-selected', 'true');
      // First content slide should no longer be selected
      await expect(slides.first()).toHaveAttribute('data-selected', 'false');
    }
  });

  test('WASD navigation: S/D moves to next slide', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(mainWindow);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide to select it
    await contentSlides.first().click();
    await mainWindow.waitForTimeout(300);
    await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true');

    // Press 's' to move to next slide
    await mainWindow.keyboard.press('s');
    await mainWindow.waitForTimeout(300);

    // Second content slide should now be selected
    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('WASD navigation: W/A moves to previous slide', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(mainWindow);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide and navigate forward
    await contentSlides.first().click();
    await mainWindow.waitForTimeout(300);

    await mainWindow.keyboard.press('s');
    await mainWindow.waitForTimeout(300);

    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });

      // Press 'w' to go back
      await mainWindow.keyboard.press('w');
      await mainWindow.waitForTimeout(300);

      await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('arrow key navigation works', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(mainWindow);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide
    await contentSlides.first().click();
    await mainWindow.waitForTimeout(300);

    // ArrowDown should move to next slide
    await mainWindow.keyboard.press('ArrowDown');
    await mainWindow.waitForTimeout(300);

    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });

      // ArrowUp should go back
      await mainWindow.keyboard.press('ArrowUp');
      await mainWindow.waitForTimeout(300);

      await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('navigation wraps across parts', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    const allSlides = getAllSlides(mainWindow);
    const contentSlides = getContentSlides(mainWindow);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide to start from a known position
    await contentSlides.first().click();
    await mainWindow.waitForTimeout(300);

    // The song arrangement is: Verse, Chorus, Verse, Chorus
    // Each part has 1 content slide + empty slides at boundaries
    // Navigate through content slides using 's'
    const contentCount = await contentSlides.count();

    for (let i = 0; i < contentCount - 1; i++) {
      await mainWindow.keyboard.press('s');
      await mainWindow.waitForTimeout(200);
    }

    // The last content slide should be selected
    await expect(contentSlides.nth(contentCount - 1)).toHaveAttribute(
      'data-selected',
      'true',
      { timeout: 5000 },
    );
  });

  test('Escape clears song selection', async ({ mainWindow }) => {
    await addSong(mainWindow, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(mainWindow, 'slide navigation', SONG_NAME);

    // Content slides should be visible
    const contentSlides = getContentSlides(mainWindow);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Press Escape to clear song selection
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(500);

    // Slides should disappear (no song selected means no slides)
    await expect(contentSlides).toHaveCount(0, { timeout: 5000 });
  });
});
