import { test, expect } from '../fixtures/browser-fixture';
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
  test('selecting a song shows slides panel', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);

    // Select the song from the command palette
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    // Slides should appear with song text
    const slides = getContentSlides(appPage);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });

    // Should have slide text from the song
    const slideTexts = await slides.allTextContents();
    const allText = slideTexts.join(' ').toUpperCase();
    expect(allText).toContain('AMAZING GRACE');
  });

  test('clicking a slide selects it', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    // Wait for content slides to appear
    const slides = getContentSlides(appPage);
    await expect(slides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide
    await slides.first().click();
    await appPage.waitForTimeout(300);
    await expect(slides.first()).toHaveAttribute('data-selected', 'true');

    // Click the second content slide (if available)
    const slideCount = await slides.count();
    if (slideCount >= 2) {
      await slides.nth(1).click();
      await appPage.waitForTimeout(300);
      await expect(slides.nth(1)).toHaveAttribute('data-selected', 'true');
      // First content slide should no longer be selected
      await expect(slides.first()).toHaveAttribute('data-selected', 'false');
    }
  });

  test('WASD navigation: S/D moves to next slide', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(appPage);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide to select it
    await contentSlides.first().click();
    await appPage.waitForTimeout(300);
    await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true');

    // Press 's' to move to next slide
    await appPage.keyboard.press('s');
    await appPage.waitForTimeout(300);

    // Second content slide should now be selected
    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('WASD navigation: W/A moves to previous slide', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(appPage);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide and navigate forward
    await contentSlides.first().click();
    await appPage.waitForTimeout(300);

    await appPage.keyboard.press('s');
    await appPage.waitForTimeout(300);

    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });

      // Press 'w' to go back
      await appPage.keyboard.press('w');
      await appPage.waitForTimeout(300);

      await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('arrow key navigation works', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    const contentSlides = getContentSlides(appPage);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide
    await contentSlides.first().click();
    await appPage.waitForTimeout(300);

    // ArrowDown should move to next slide
    await appPage.keyboard.press('ArrowDown');
    await appPage.waitForTimeout(300);

    const slideCount = await contentSlides.count();
    if (slideCount >= 2) {
      await expect(contentSlides.nth(1)).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });

      // ArrowUp should go back
      await appPage.keyboard.press('ArrowUp');
      await appPage.waitForTimeout(300);

      await expect(contentSlides.first()).toHaveAttribute('data-selected', 'true', {
        timeout: 5000,
      });
    }
  });

  test('navigation wraps across parts', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    const allSlides = getAllSlides(appPage);
    const contentSlides = getContentSlides(appPage);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Click the first content slide to start from a known position
    await contentSlides.first().click();
    await appPage.waitForTimeout(300);

    // The song arrangement is: Verse, Chorus, Verse, Chorus
    // Each part has 1 content slide + empty slides at boundaries
    // Navigate through content slides using 's'
    const contentCount = await contentSlides.count();

    for (let i = 0; i < contentCount - 1; i++) {
      await appPage.keyboard.press('s');
      await appPage.waitForTimeout(200);
    }

    // The last content slide should be selected
    await expect(contentSlides.nth(contentCount - 1)).toHaveAttribute(
      'data-selected',
      'true',
      { timeout: 5000 },
    );
  });

  test('Escape clears song selection', async ({ appPage }) => {
    await addSong(appPage, SONG_NAME, SONG_CONTENT);
    await selectSongFromPalette(appPage, 'slide navigation', SONG_NAME);

    // Content slides should be visible
    const contentSlides = getContentSlides(appPage);
    await expect(contentSlides.first()).toBeVisible({ timeout: 10000 });

    // Press Escape to clear song selection
    await appPage.keyboard.press('Escape');
    await appPage.waitForTimeout(500);

    // Slides should disappear (no song selected means no slides)
    await expect(contentSlides).toHaveCount(0, { timeout: 5000 });
  });
});
