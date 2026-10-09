import { test, expect } from '../fixtures/electron-fixture';
import { addSong, selectSongFromPalette } from '../helpers/song-helpers';
import type { Page } from '@playwright/test';

async function openSettingsTab(page: Page, tab: string) {
  if (!(await page.locator('[role="dialog"]').isVisible())) {
    await page.locator('[data-testid="settings-button"]').click();
  }
  await page.locator('[role="tab"]').filter({ hasText: tab }).first().click();
}

async function selectOption(page: Page, trigger: string, option: string) {
  await page.locator(trigger).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.locator(trigger)).toContainText(option);
}

const clock = (audience: Page) => audience.getByTestId('clock-overlay');

async function enableClock(page: Page) {
  await openSettingsTab(page, 'Ceas');
  const row = page.locator('div.rounded-lg.border').filter({ hasText: 'Afișează ceasul' });
  await row.locator('button').click();
}

test.describe('Text style letter spacing', () => {
  test('letter spacing from the active style is used on the audience screen', async ({ mainWindow, audienceWindow }) => {
    await openSettingsTab(mainWindow, 'Stiluri text');
    await expect(mainWindow.locator('#style-letter-spacing')).toHaveValue('0');
    await mainWindow.locator('#style-letter-spacing').fill('0.2');
    await mainWindow.getByRole('button', { name: 'Salvează' }).click();
    await expect(mainWindow.getByRole('button', { name: 'Salvează' })).toBeHidden();
    await mainWindow.keyboard.press('Escape');

    await addSong(mainWindow, 'Spacing Song', 'Verse\nAmazing grace how sweet the sound\n---\nVerse');
    await selectSongFromPalette(mainWindow, 'spacing song', 'Spacing Song');
    await mainWindow.locator('[data-testid="song-slide-item"]').filter({ hasText: /\S+/ }).first().click();

    const line = audienceWindow.getByText(/amazing grace/i).first();
    await expect(line).toBeVisible({ timeout: 5000 });
    const ratio = await line.evaluate((el) => {
      const css = getComputedStyle(el);
      return parseFloat(css.letterSpacing) / parseFloat(css.fontSize);
    });
    expect(ratio).toBeCloseTo(0.2, 2);
  });
});

test.describe('Clock size and colour', () => {
  test('clock follows the style colour by default and supports a custom colour and bigger sizes', async ({ mainWindow, audienceWindow }) => {
    await enableClock(mainWindow);
    await expect(clock(audienceWindow)).toBeVisible({ timeout: 5000 });
    // Default: colour of the active text style (white)
    await expect(clock(audienceWindow)).toHaveCSS('color', 'rgb(255, 255, 255)');

    await selectOption(mainWindow, '#clock-font-size', '2500%');
    await selectOption(mainWindow, '#clock-color-mode', 'Personalizată');
    await mainWindow.locator('#clock-custom-color').fill('#ff3300');
    // Wide digits are the hardest case for fitting on screen
    await mainWindow.clock.setFixedTime(new Date(2026, 9, 9, 20, 8, 0));
    await expect(clock(audienceWindow)).toHaveText('20:08');

    await expect(clock(audienceWindow)).toHaveCSS('color', 'rgb(255, 51, 0)');

    // 2500% = 400px, reduced on small projectors so it fits whatever the digits are
    const viewport = await audienceWindow.evaluate(() => ({ w: innerWidth, h: innerHeight }));
    const size = await clock(audienceWindow).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeLessThanOrEqual(Math.min(400, viewport.w * 0.36, viewport.h * 0.55) + 0.5);
    expect(size).toBeGreaterThan(144); // bigger than the previous maximum (900%)

    // Fully on screen at the largest size
    const box = await clock(audienceWindow).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.w);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.h);

    // The wider 12h format must fit as well
    await selectOption(mainWindow, '#clock-format', '12 ore (2:30 PM)');
    await expect(clock(audienceWindow)).toHaveText('8:08 PM');
    const box12 = await clock(audienceWindow).boundingBox();
    expect(box12!.x + box12!.width).toBeLessThanOrEqual(viewport.w);
    expect(box12!.y).toBeGreaterThanOrEqual(0);
  });

  test('clock size and colour are kept after a restart', async ({ mainWindow }) => {
    await enableClock(mainWindow);
    await selectOption(mainWindow, '#clock-font-size', '1500%');
    await selectOption(mainWindow, '#clock-color-mode', 'Personalizată');
    await mainWindow.locator('#clock-custom-color').fill('#00aaff');
    await mainWindow.keyboard.press('Escape');

    await mainWindow.reload();
    await mainWindow.waitForSelector('[role="tab"]', { timeout: 30000 });
    await openSettingsTab(mainWindow, 'Ceas');
    await expect(mainWindow.locator('#clock-font-size')).toContainText('1500%');
    await expect(mainWindow.locator('#clock-color-mode')).toContainText('Personalizată');
    await expect(mainWindow.locator('#clock-custom-color')).toHaveValue('#00aaff');
  });

  test('clock can be centred horizontally and vertically, staying on screen', async ({ mainWindow, audienceWindow }) => {
    await enableClock(mainWindow);
    await selectOption(mainWindow, '#clock-font-size', '2500%');
    const viewport = await audienceWindow.evaluate(() => ({ w: innerWidth, h: innerHeight }));

    const positions = [
      { label: 'Sus, pe mijloc', check: (b: { y: number; height: number }) => b.y < viewport.h / 2 },
      { label: 'Centru', check: (b: { y: number; height: number }) => Math.abs(b.y + b.height / 2 - viewport.h / 2) <= 2 },
      { label: 'Jos, pe mijloc', check: (b: { y: number; height: number }) => b.y + b.height > viewport.h / 2 },
    ];
    for (const position of positions) {
      await selectOption(mainWindow, '#clock-position', position.label);
      await expect
        .poll(async () => {
          const b = (await clock(audienceWindow).boundingBox())!;
          const centredX = Math.abs(b.x + b.width / 2 - viewport.w / 2) <= 2;
          const onScreen = b.x >= 0 && b.y >= 0 && b.x + b.width <= viewport.w && b.y + b.height <= viewport.h;
          return centredX && onScreen && position.check(b);
        }, { message: position.label })
        .toBe(true);
    }
  });
});
