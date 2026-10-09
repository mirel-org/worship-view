import { test as base, expect } from '../fixtures/electron-fixture';
import { addSong, selectSongFromPalette, selectVerseFromPalette } from '../helpers/song-helpers';
import { revealSidebar, setMainWindowSize } from '../helpers/app-helpers';
import type { Page } from '@playwright/test';

// Keys sent by a Logitech R400: PageDown / PageUp (next / previous),
// F5 then Esc (slideshow button), "." or "b" (blank screen).

const test = base.extend({
  mainWindow: async ({ mainWindow }, use) => {
    await mainWindow.evaluate(() => localStorage.setItem('test-seed-presentations', 'true'));
    await mainWindow.reload();
    await mainWindow.getByRole('tab', { name: 'Prezentări' }).waitFor();
    await use(mainWindow);
  },
});

const SONG_NAME = 'Remote Song';
const SONG_CONTENT = `Verse
First slide line
---
Chorus
Second slide line
---
Verse Chorus`;

async function focusApp(page: Page) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.focus();
  });
}

async function projectSong(main: Page, audience: Page) {
  await addSong(main, SONG_NAME, SONG_CONTENT);
  await selectSongFromPalette(main, 'remote song', SONG_NAME);
  const slides = main.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ });
  await slides.first().click();
  await expect(audience.locator('body')).toContainText(/first slide line/i, { timeout: 5000 });
  await focusApp(main);
}

test.describe('Presenter remote (Logitech R400)', () => {
  test('PageDown / PageUp move between song slides without scrolling the app', async ({ mainWindow, audienceWindow }) => {
    await projectSong(mainWindow, audienceWindow);
    const scrollBefore = await mainWindow.evaluate(() => document.scrollingElement?.scrollTop ?? 0);

    await mainWindow.keyboard.press('PageDown');
    await expect(audienceWindow.locator('body')).toContainText(/second slide line/i);
    await mainWindow.keyboard.press('PageUp');
    await expect(audienceWindow.locator('body')).toContainText(/first slide line/i);

    expect(await mainWindow.evaluate(() => document.scrollingElement?.scrollTop ?? 0)).toBe(scrollBefore);
  });

  test('PageDown / PageUp move between Bible verses', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await focusApp(mainWindow);
    await mainWindow.keyboard.press('Enter');
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:16');

    await mainWindow.keyboard.press('PageDown');
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:17');
    await mainWindow.keyboard.press('PageUp');
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:16');
  });

  for (const width of [1280, 1000]) {
  test(`PageDown / PageUp move between presentation slides (${width}px window)`, async ({ electronApp, mainWindow, audienceWindow }) => {
    if (width !== 1280) {
      await setMainWindowSize(electronApp, mainWindow, width, 760);
      await expect(mainWindow.getByRole('button', { name: 'Deschide meniul' })).toBeVisible();
    }
    await mainWindow.getByRole('tab', { name: 'Prezentări' }).click();
    // Small CI displays turn the sidebar into a drawer
    await revealSidebar(mainWindow);
    await mainWindow.getByRole('button', { name: 'Presentation Shortcuts' }).click();
    await expect(audienceWindow.getByText('1/2', { exact: true })).toBeVisible();
    await focusApp(mainWindow);

    await mainWindow.keyboard.press('PageDown');
    await expect(audienceWindow.getByText('2/2', { exact: true })).toBeVisible();
    await mainWindow.keyboard.press('PageUp');
    await expect(audienceWindow.getByText('1/2', { exact: true })).toBeVisible();
  });
  }

  test('blank screen button hides and restores the same slide, keeping the clock', async ({ mainWindow, audienceWindow }) => {
    // Clock on, to check it stays visible on the blank screen
    await mainWindow.locator('[data-testid="settings-button"]').click();
    await mainWindow.locator('[role="tab"]').filter({ hasText: 'Ceas' }).click();
    await mainWindow.locator('div.rounded-lg.border').filter({ hasText: 'Afișează ceasul' }).locator('button').click();
    await mainWindow.keyboard.press('Escape');

    await projectSong(mainWindow, audienceWindow);
    await mainWindow.keyboard.press('PageDown');
    await expect(audienceWindow.locator('body')).toContainText(/second slide line/i);
    const clock = audienceWindow.getByTestId('clock-overlay');
    await expect(clock).toHaveCount(0);

    for (const key of ['.', 'b']) {
      await mainWindow.keyboard.press(key);
      await expect(audienceWindow.locator('body')).not.toContainText(/slide line/i);
      await expect(audienceWindow.locator('[data-blanked="true"]')).toHaveCount(1);
      await expect(clock).toBeVisible();

      await mainWindow.keyboard.press(key);
      await expect(audienceWindow.locator('body')).toContainText(/second slide line/i);
    }

    // F5 (slideshow button) also ends the blank screen
    await mainWindow.keyboard.press('.');
    await expect(audienceWindow.locator('body')).not.toContainText(/slide line/i);
    await mainWindow.keyboard.press('F5');
    await expect(audienceWindow.locator('body')).toContainText(/second slide line/i);

  });

  test('slideshow button (Esc then F5) hides and restores a Bible verse', async ({ mainWindow, audienceWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await focusApp(mainWindow);
    await mainWindow.keyboard.press('F5');
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:16');

    await mainWindow.keyboard.press('Escape');
    await expect(audienceWindow.locator('body')).not.toContainText('IOAN 3:16');
    await mainWindow.keyboard.press('F5');
    await expect(audienceWindow.locator('body')).toContainText('IOAN 3:16');
  });

  test('settings show which keys the remote sends, without triggering actions', async ({ mainWindow, audienceWindow }) => {
    await projectSong(mainWindow, audienceWindow);
    await mainWindow.locator('[data-testid="settings-button"]').click();
    await mainWindow.locator('[role="tab"]').filter({ hasText: 'Telecomandă' }).click();

    await mainWindow.keyboard.press('PageDown');
    await mainWindow.keyboard.press('.');
    const log = mainWindow.getByTestId('remote-key-log');
    await expect(log.locator('li').nth(0)).toContainText('.');
    await expect(log.locator('li').nth(0)).toContainText('Ecran negru');
    await expect(log.locator('li').nth(1)).toContainText('PageDown');
    await expect(log.locator('li').nth(1)).toContainText('Slide următor');

    // While Settings is open the keys are only shown, not acted on
    await expect(audienceWindow.locator('body')).toContainText(/first slide line/i);
    await expect(audienceWindow.locator('[data-blanked="true"]')).toHaveCount(0);
  });
});
