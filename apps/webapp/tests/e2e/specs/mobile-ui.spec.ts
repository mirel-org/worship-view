import { test, expect } from '../fixtures/browser-fixture';
import type { Locator, Page } from '@playwright/test';
import {
  addSong,
  closeCommandPalette,
  openCommandPalette,
  searchSongInPalette,
  selectVerseFromPalette,
} from '../helpers/song-helpers';

const CONTENT = 'Verse\nLine one of the song\n---\nVerse';

/** The element is fully inside the visible screen. */
async function isOnScreen(locator: Locator) {
  const box = await locator.boundingBox();
  const vp = locator.page().viewportSize()!;
  return !!box && box.x >= -1 && box.y >= -1 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1;
}

async function openSettingsSection(page: Page, label: string) {
  if (!(await page.locator('[role="dialog"]').isVisible())) {
    await page.locator('[data-testid="settings-button"]').click();
  }
  await page.getByTestId('settings-section-select').click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function addSongsToList(page: Page, names: string[]) {
  for (const name of names) await addSong(page, name, CONTENT);
  for (const name of names) {
    await searchSongInPalette(page, name.toLowerCase());
    // Touch screens show the row actions without hover
    const add = page.locator(`button[aria-label="Adaugă ${name} la lista de melodii"]`);
    await expect(add).toHaveCSS('opacity', '1');
    await add.click();
    await closeCommandPalette(page);
  }
}

for (const width of [390, 360]) {
  test.describe(`Phone ${width}px`, () => {
    test.use({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });

    test('header fits the screen', async ({ appPage }) => {
      for (const control of [
        appPage.getByRole('button', { name: 'Deschide meniul' }),
        appPage.getByTestId('enable-button'),
        appPage.getByRole('button', { name: 'Deschide paleta de comenzi' }),
        appPage.getByRole('tab', { name: 'Biblie' }),
        appPage.locator('[data-testid="settings-button"]'),
      ]) {
        await expect(control).toBeVisible();
        expect(await isOnScreen(control)).toBe(true);
      }
      expect(await appPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}

test.describe('Phone UI', () => {
  test.use({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });

  test('empty songs tab offers search and the service lists', async ({ appPage }) => {
    await expect(appPage.getByTestId('no-song-selected')).toBeVisible();
    await appPage.getByRole('button', { name: 'Caută o cântare' }).click();
    await expect(appPage.locator('[cmdk-input]')).toBeVisible();
    await appPage.keyboard.press('Escape');
    await appPage.getByRole('button', { name: 'Liste de serviciu' }).click();
    await expect(appPage.locator('.sidebar-panel')).toHaveAttribute('data-open', 'true');
  });

  test('service list songs can be reordered and removed with taps', async ({ appPage }) => {
    await addSongsToList(appPage, ['Alfa Song', 'Beta Song', 'Gama Song']);
    await appPage.getByRole('button', { name: 'Liste de serviciu' }).click();
    await appPage.getByText('Lista de melodii', { exact: true }).click();
    const rows = appPage.locator('li').filter({ has: appPage.locator('span.flex-1') });
    const order = () => rows.locator('span.flex-1').allInnerTexts();
    await expect.poll(order).toEqual(['Alfa Song', 'Beta Song', 'Gama Song']);

    // The drag grip is replaced by move buttons on touch screens
    await expect(appPage.getByLabel('Trageți pentru a reordona').first()).toBeHidden();
    await expect(appPage.getByRole('button', { name: 'Mută Alfa Song mai sus' })).toBeDisabled();
    await appPage.getByRole('button', { name: 'Mută Alfa Song mai jos' }).tap();
    await expect.poll(order).toEqual(['Beta Song', 'Alfa Song', 'Gama Song']);
    await appPage.getByRole('button', { name: 'Mută Gama Song mai sus' }).tap();
    await expect.poll(order).toEqual(['Beta Song', 'Gama Song', 'Alfa Song']);

    const remove = appPage.getByRole('button', { name: 'Elimină Gama Song din listă' });
    await expect(remove).toHaveCSS('opacity', '1');
    await remove.tap();
    await expect.poll(order).toEqual(['Beta Song', 'Alfa Song']);
  });

  test('settings use a section picker that does not run under the close button', async ({ appPage }) => {
    await appPage.locator('[data-testid="settings-button"]').click();
    const picker = appPage.getByTestId('settings-section-select');
    await expect(picker).toBeVisible();
    await expect(appPage.locator('[role="dialog"] [role="tablist"]')).toBeHidden();
    const close = appPage.getByRole('button', { name: 'Close' });
    const [p, c] = [(await picker.boundingBox())!, (await close.boundingBox())!];
    expect(p.x + p.width).toBeLessThanOrEqual(c.x);

    await openSettingsSection(appPage, 'Telecomandă');
    await expect(appPage.getByRole('heading', { name: 'Telecomandă' })).toBeVisible();
  });

  test('text styles and organizations open as list, then full-width editor', async ({ appPage }) => {
    await openSettingsSection(appPage, 'Stiluri text');
    const styleItem = appPage.getByRole('button', { name: /Implicit/ }).first();
    await expect(styleItem).toBeVisible();
    await expect(appPage.locator('#style-name')).toBeHidden();
    await styleItem.click();
    for (const field of ['#style-name', '#style-font', '#style-size', '#style-letter-spacing']) {
      await appPage.locator(field).scrollIntoViewIfNeeded();
      expect(await isOnScreen(appPage.locator(field)), field).toBe(true);
    }
    await appPage.getByRole('button', { name: 'Stiluri text', exact: true }).click();
    await expect(styleItem).toBeVisible();

    await openSettingsSection(appPage, 'Organizații');
    await appPage.getByRole('button', { name: /Test Organization/ }).first().click();
    for (const name of ['Redenumește', 'Șterge']) {
      const button = appPage.getByRole('button', { name, exact: true });
      await button.scrollIntoViewIfNeeded();
      expect(await isOnScreen(button), name).toBe(true);
    }
  });

  test('settings song list actions are visible without hover', async ({ appPage }) => {
    await addSong(appPage, 'Touch Song', CONTENT);
    await openSettingsSection(appPage, 'Cântece');
    await expect(appPage.getByRole('button', { name: 'Editează Touch Song' }).or(appPage.locator('[aria-label^="Editează"]')).first()).toHaveCSS('opacity', '1');
  });

  test('add song dialog keeps its buttons on screen with the keyboard open', async ({ appPage }) => {
    // A shorter viewport stands in for the on-screen keyboard
    await appPage.setViewportSize({ width: 390, height: 460 });
    await openCommandPalette(appPage);
    await appPage.locator('[cmdk-item]').filter({ hasText: 'Creează cântec nou' }).click();
    for (const name of ['Adaugă cântec', 'Anulează']) {
      const button = appPage.getByRole('button', { name, exact: true });
      await expect(button).toBeVisible();
      // Polled: the dialog zooms in when it opens
      await expect.poll(() => isOnScreen(button), { message: name }).toBe(true);
    }
  });

  test('Bible verses use a smaller text size on phones', async ({ appPage }) => {
    await selectVerseFromPalette(appPage, 'ioan 3 16', 'IOAN 3:16');
    const verse = appPage.getByText(/Fiindcă atât de mult a iubit/).first();
    await expect(verse).toHaveCSS('font-size', '16px');
  });
});
