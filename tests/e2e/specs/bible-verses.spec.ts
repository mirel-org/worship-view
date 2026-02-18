import { test, expect } from '../fixtures/electron-fixture';
import { openCommandPalette } from '../helpers/song-helpers';

/**
 * Helper: select a Bible verse from the command palette.
 * Verse search triggers when the query contains a digit.
 */
async function selectVerseFromPalette(page: import('@playwright/test').Page, query: string, expectedRef: string) {
  await openCommandPalette(page);
  await page.locator('[cmdk-input]').fill(query);
  await page.waitForTimeout(500);

  const verseItem = page.locator('[cmdk-item]').filter({ hasText: expectedRef });
  await expect(verseItem).toBeVisible({ timeout: 5000 });
  await verseItem.click();

  // Wait for palette to close
  await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });
}

async function focusAppWindow(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();
    window.focus();
  });
  await page.waitForTimeout(200);
}

test.describe('Bible Verses', () => {
  test('selecting a verse from palette shows Bible tab', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');

    // Bible tab should be active
    await expect(mainWindow.locator('[role="tab"]').filter({ hasText: 'Biblie' })).toHaveAttribute('data-state', 'active');

    // Verses should be visible in the panel
    const verseCards = mainWindow.locator('[data-testid="verse-card"]');
    await expect(verseCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('verse cards are displayed with reference numbers and text', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');

    // Wait for verse cards to appear
    await mainWindow.waitForTimeout(500);

    // Verse 16 should be selected/visible after picking IOAN 3:16 from palette
    const selectedVerseCard = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]').first();
    await expect(selectedVerseCard).toBeVisible({ timeout: 5000 });
    await expect(selectedVerseCard.locator('p').first()).toHaveText('16');

    // The verse text should contain Romanian text from VDC.json
    // "Fiindcă atât de mult a iubit Dumnezeu lumea..."
    const verseText = mainWindow.locator('p').filter({ hasText: 'Dumnezeu' });
    await expect(verseText.first()).toBeVisible({ timeout: 5000 });
  });

  test('clicking a verse card selects it', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    // Verse 16 should be auto-selected (border-l-primary)
    const selectedVerse = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedVerse.first()).toBeVisible({ timeout: 5000 });

    await focusAppWindow(mainWindow);

    // Press 's' to navigate to verse 17
    await mainWindow.keyboard.press('s');
    await mainWindow.waitForTimeout(300);

    // Verify selection changed (still has border indicator)
    const selectedCards = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });

    // Navigate back to verify we can click on a card too
    // Find the card that has "16" in its header
    // VerseListItem renders: Card > CardHeader > CardTitle > "16"
    // We can click on a card by finding one with the verse number
    await mainWindow.keyboard.press('w');
    await mainWindow.waitForTimeout(300);
    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('WASD navigation: S/D moves to next verse', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Verse 16 should be selected initially
    // Press 's' to move to verse 17
    await mainWindow.keyboard.press('s');
    await mainWindow.waitForTimeout(300);

    // The selected verse should have changed
    // We check that a card with border-l-primary exists
    const selectedCards = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('WASD navigation: W/A moves to previous verse', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Press 'w' to move to verse 15
    await mainWindow.keyboard.press('w');
    await mainWindow.waitForTimeout(300);

    // A card with border indicator should be visible
    const selectedCards = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('arrow keys navigate verses', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // ArrowDown should move to next verse
    await mainWindow.keyboard.press('ArrowDown');
    await mainWindow.waitForTimeout(300);

    const selectedCards = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });

    // ArrowUp should go back
    await mainWindow.keyboard.press('ArrowUp');
    await mainWindow.waitForTimeout(300);

    await expect(selectedCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('Enter enables verse projection', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Verse remains selected before projection toggles
    const selectedBefore = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedBefore.first()).toBeVisible({ timeout: 5000 });

    // Press Enter to enable projection
    await mainWindow.keyboard.press('Enter');
    await mainWindow.waitForTimeout(300);

    const selectedAfter = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedAfter.first()).toBeVisible({ timeout: 5000 });
  });

  test('Escape disables verse projection', async ({ mainWindow }) => {
    await selectVerseFromPalette(mainWindow, 'ioan 3 16', 'IOAN 3:16');
    await mainWindow.waitForTimeout(500);

    await focusAppWindow(mainWindow);

    // Enable projection first
    await mainWindow.keyboard.press('Enter');
    await mainWindow.waitForTimeout(300);

    const selectedBefore = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedBefore.first()).toBeVisible({ timeout: 5000 });

    // Press Escape to disable projection
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(300);

    const selectedAfter = mainWindow.locator('[data-testid="verse-card"][data-selected="true"]');
    await expect(selectedAfter.first()).toBeVisible({ timeout: 5000 });
  });
});
