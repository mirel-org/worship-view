import { test, expect } from '../fixtures/browser-fixture';
import type { Page } from '@playwright/test';
import { addSong, selectSongFromPalette } from '../helpers/song-helpers';

const SONG = 'Mobile Song';
// Four long lines (two 2-line slides): the default style shows 4 lines at 410%
const CONTENT = `Verse
Mare e Domnul și vrednic de laudă
În cetatea Dumnezeului nostru

Pe muntele Lui cel sfânt și frumos
Bucuria întregului pământ
---
Chorus
Slavă, slavă, slavă Lui
Ce a făcut cer și pământ
---
Verse Chorus`;

async function present(page: Page) {
  await addSong(page, SONG, CONTENT);
  await selectSongFromPalette(page, 'mobile song', SONG);
  await page.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ }).first().click();
  await page.getByTestId('enable-button').click();
  await expect(page.getByTestId('presentation-mode')).toContainText(/mare e domnul/i);
}

async function swipe(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  for (let i = 1; i <= 5; i++) {
    const point = { x: from.x + ((to.x - from.x) * i) / 5, y: from.y + ((to.y - from.y) * i) / 5 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Every piece of text is fully on screen and the lyrics do not cover the slide counter. */
async function textFitsOnScreen(page: Page) {
  return page.getByTestId('presentation-content').evaluate((root) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const texts = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(
      (el) => el.childElementCount === 0 && el.textContent?.trim() && !el.closest('button'),
    );
    const counter = Array.from(root.querySelectorAll<HTMLElement>('div')).find((el) =>
      /^\d+\/\d+$/.test(el.textContent?.trim() ?? ''),
    );
    const counterRect = counter?.getBoundingClientRect();
    return texts.every((el) => {
      const r = el.getBoundingClientRect();
      const onScreen = r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1;
      const coversCounter =
        !!counterRect &&
        el !== counter &&
        r.left < counterRect.right && counterRect.left < r.right &&
        r.top < counterRect.bottom && counterRect.top < r.bottom;
      return onScreen && !coversCounter;
    });
  });
}

const counter = (page: Page, text: string) =>
  page.getByTestId('presentation-mode').getByText(text, { exact: true });

test.describe('Mobile presentation mode (portrait phone, drawn in landscape)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('is rotated to landscape and the text fits the screen', async ({ appPage }) => {
    await present(appPage);
    await expect(appPage.getByTestId('presentation-mode')).toHaveAttribute('data-rotated', 'true');
    await expect.poll(() => textFitsOnScreen(appPage)).toBe(true);
    // The landscape content box spans the long side of the phone
    const box = await appPage.getByTestId('presentation-content').boundingBox();
    expect(Math.round(box!.width)).toBe(390);
    expect(Math.round(box!.height)).toBe(844);
  });

  test('swipes and taps move between slides; the middle shows the exit button', async ({ appPage }) => {
    await present(appPage);
    await expect(counter(appPage, '1/2')).toBeVisible();

    // Rotated: swiping "left" in the presentation is an upward swipe on the phone
    await swipe(appPage, { x: 195, y: 600 }, { x: 195, y: 250 });
    await expect(counter(appPage, '2/2')).toBeVisible();
    await swipe(appPage, { x: 195, y: 250 }, { x: 195, y: 600 });
    await expect(counter(appPage, '1/2')).toBeVisible();

    // Tap near the bottom of the phone = right side of the presentation = next
    await appPage.touchscreen.tap(195, 800);
    await expect(counter(appPage, '2/2')).toBeVisible();
    await appPage.touchscreen.tap(195, 40);
    await expect(counter(appPage, '1/2')).toBeVisible();

    const exit = appPage.getByRole('button', { name: 'Ieși din modul prezentare' });
    await expect(exit).toHaveCSS('opacity', '0');
    await appPage.touchscreen.tap(195, 422);
    await expect(exit).toHaveCSS('opacity', '1');
    await expect(exit).toContainText('Ieși');
    await exit.tap();
    await expect(appPage.getByTestId('presentation-mode')).toHaveCount(0);
  });
});

test.describe('Mobile presentation mode (landscape phone)', () => {
  test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });

  test('is not rotated, fits the screen and swipes left for the next slide', async ({ appPage }) => {
    await present(appPage);
    await expect(appPage.getByTestId('presentation-mode')).toHaveAttribute('data-rotated', 'false');
    await expect.poll(() => textFitsOnScreen(appPage)).toBe(true);

    await swipe(appPage, { x: 650, y: 195 }, { x: 200, y: 195 });
    await expect(counter(appPage, '2/2')).toBeVisible();
    await swipe(appPage, { x: 200, y: 195 }, { x: 650, y: 195 });
    await expect(counter(appPage, '1/2')).toBeVisible();
  });
});

test.describe('Presentation mode on a laptop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the text style size when the text already fits', async ({ appPage }) => {
    await present(appPage);
    await expect(appPage.getByTestId('presentation-mode')).toHaveAttribute('data-rotated', 'false');
    // Default style: 410% of 16px, unchanged by fit-to-screen
    await expect
      .poll(() =>
        appPage
          .getByTestId('presentation-mode')
          .getByText(/mare e domnul/i)
          .first()
          .evaluate((el) => getComputedStyle(el).fontSize),
      )
      .toBe('65.6px');
    expect(await textFitsOnScreen(appPage)).toBe(true);
  });
});
