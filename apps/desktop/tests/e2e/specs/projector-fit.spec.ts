import { test, expect } from '../fixtures/electron-fixture';
import type { Page } from '@playwright/test';
import { addSong, selectSongFromPalette, selectVerseFromPalette } from '../helpers/song-helpers';

/** All projected text is inside the window and clear of the corner badges. */
function textFits(audience: Page) {
  return audience.evaluate(() => {
    const vw = innerWidth;
    const vh = innerHeight;
    const badges = Array.from(document.querySelectorAll('[data-fit-avoid]')).map((el) => el.getBoundingClientRect());
    const texts = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(
      (el) => el.childElementCount === 0 && el.textContent?.trim() && !el.closest('[data-fit-avoid]'),
    );
    return texts.length > 0 && texts.every((el) => {
      const r = el.getBoundingClientRect();
      const onScreen = r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1;
      const hitsBadge = badges.some((b) => r.left < b.right && b.left < r.right && r.top < b.bottom && b.top < r.bottom);
      return onScreen && !hitsBadge;
    });
  });
}

test.describe('Projector window text fitting', () => {
  test('a very long verse is shrunk to fit a small projector window', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'estera 8 9', 'ESTERA 8:9');
    await mainWindow.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
    await mainWindow.keyboard.press('Enter');
    await expect(audienceWindow.locator('body')).toContainText('ESTERA 8:9');
    await expect.poll(() => textFits(audienceWindow), { timeout: 5000 }).toBe(true);
  });

  test('text that already fits keeps the text style size', async ({ mainWindow, audienceWindow }) => {
    await addSong(mainWindow, 'Short Song', 'Verse\nMare e Domnul\n---\nVerse');
    await selectSongFromPalette(mainWindow, 'short song', 'Short Song');
    await mainWindow.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ }).first().click();
    const line = audienceWindow.getByText('Mare e Domnul').first();
    await expect(line).toBeVisible();
    await mainWindow.waitForTimeout(800);
    await expect(line).toHaveCSS('font-size', '65.6px');
    expect(await textFits(audienceWindow)).toBe(true);
  });
});
