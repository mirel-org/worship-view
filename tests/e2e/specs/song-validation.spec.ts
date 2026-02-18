import { test, expect } from '../fixtures/electron-fixture';
import { openCreateSongDialog } from '../helpers/song-helpers';

/**
 * Helper: fill the Add Song dialog and click save. Returns the error locator.
 */
async function fillAndSave(mainWindow: any, content: string) {
  await openCreateSongDialog(mainWindow);
  await mainWindow.locator('#song-name').fill('Test Song');
  await mainWindow.locator('#song-content').fill(content);
  await mainWindow.locator('button:has-text("Adaugă cântec")').click();
  return mainWindow.locator('[data-testid="song-validation-error"]');
}

/**
 * Helper: fill the Add Song dialog and wait for live validation to appear.
 */
async function fillAndWaitForLiveValidation(mainWindow: any, content: string) {
  await openCreateSongDialog(mainWindow);
  await mainWindow.locator('#song-name').fill('Test Song');
  await mainWindow.locator('#song-content').fill(content);
  // Wait for debounced validation (500ms + buffer)
  await mainWindow.waitForTimeout(800);
}

test.describe('Song Content Validation — Errors', () => {
  test('missing separator blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, 'Verse\nSome lyrics here');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Lipseste separatorul');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('missing arrangement blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, 'Verse\nSome lyrics\n---\n');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Lipseste aranjamentul');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('empty part key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, '\nSome lyrics\n---\nVerse');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Cheie de parte goala');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('space in part key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse One\nSome lyrics here\n---\nVerse One',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('contine spatii');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('trailing whitespace on part key blocks save', async ({
    mainWindow,
  }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse \nSome lyrics here\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('spatii la inceput sau la sfarsit');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('undefined arrangement key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nSome lyrics here\n---\nVerse Chorus',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('parte nedefinita "Chorus"');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('empty part content blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, 'Verse\n\n---\nVerse');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('nu are continut de versuri');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('duplicate part keys blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nFirst lyrics\n---\nVerse\nSecond lyrics\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Cheie de parte duplicata "Verse"');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('slide with more than 2 lines blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nLine one\nLine two\nLine three\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('mai mult de 2 linii');
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('arrangement with trailing whitespace blocks save', async ({
    mainWindow,
  }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nSome lyrics here\n---\nVerse ',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText(
      'Aranjamentul are spatii sau linii noi la inceput/sfarsit',
    );
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('arrangement with trailing newline blocks save', async ({
    mainWindow,
  }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nSome lyrics here\n---\nVerse\n',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText(
      'Aranjamentul are spatii sau linii noi la inceput/sfarsit',
    );
    await expect(mainWindow.locator('text=Adaugă cântec nou')).toBeVisible();
    await mainWindow.locator('button:has-text("Anulează")').click();
  });
});

test.describe('Song Content Validation — Warnings', () => {
  test('unused part shows warning but allows save', async ({ mainWindow }) => {
    await fillAndWaitForLiveValidation(
      mainWindow,
      'Verse\nSome lyrics\n---\nBridge\nBridge lyrics\n---\nVerse',
    );

    await expect(
      mainWindow.locator('[data-testid="song-validation-warnings"]'),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      mainWindow.locator('[data-testid="song-validation-errors"]'),
    ).not.toBeVisible();

    // Save should succeed
    await mainWindow.locator('button:has-text("Adaugă cântec")').click();
    await expect(mainWindow.locator('text=Adaugă cântec nou')).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('malformed separator shows warning', async ({ mainWindow }) => {
    await fillAndWaitForLiveValidation(
      mainWindow,
      'Verse\nSome lyrics\n----\nmore lyrics\n---\nVerse',
    );

    const warnings = mainWindow.locator(
      '[data-testid="song-validation-warnings"]',
    );
    await expect(warnings).toBeVisible({ timeout: 3000 });
    await expect(warnings).toContainText('Separator invalid');

    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('leading/trailing whitespace on lyrics shows warning', async ({
    mainWindow,
  }) => {
    await fillAndWaitForLiveValidation(
      mainWindow,
      'Verse\n  Some lyrics with leading spaces\n---\nVerse',
    );

    const warnings = mainWindow.locator(
      '[data-testid="song-validation-warnings"]',
    );
    await expect(warnings).toBeVisible({ timeout: 3000 });
    await expect(warnings).toContainText('spatii la inceput/sfarsit');

    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('extra consecutive blank lines shows warning', async ({
    mainWindow,
  }) => {
    await fillAndWaitForLiveValidation(
      mainWindow,
      'Verse\nSome lyrics\n\n\nMore lyrics\n---\nVerse',
    );

    const warnings = mainWindow.locator(
      '[data-testid="song-validation-warnings"]',
    );
    await expect(warnings).toBeVisible({ timeout: 3000 });
    await expect(warnings).toContainText('Linie goala consecutiva in plus');

    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('leading/trailing blank lines in part content shows warning', async ({
    mainWindow,
  }) => {
    await fillAndWaitForLiveValidation(
      mainWindow,
      'Verse\n\nSome lyrics\n---\nVerse',
    );

    const warnings = mainWindow.locator(
      '[data-testid="song-validation-warnings"]',
    );
    await expect(warnings).toBeVisible({ timeout: 3000 });
    await expect(warnings).toContainText('linii goale la inceputul continutului');

    await mainWindow.locator('button:has-text("Anulează")').click();
  });
});

test.describe('Song Content Validation — UX', () => {
  test('error messages disappear when content is corrected', async ({
    mainWindow,
  }) => {
    await openCreateSongDialog(mainWindow);
    await mainWindow.locator('#song-name').fill('Test Song');

    // Enter invalid content (no separator)
    await mainWindow.locator('#song-content').fill('Verse\nSome lyrics');

    await expect(
      mainWindow.locator('[data-testid="song-validation-errors"]'),
    ).toBeVisible({ timeout: 3000 });

    // Fix the content
    await mainWindow.locator('#song-content').fill(
      'Verse\nSome lyrics here\n---\nVerse',
    );

    // Errors should disappear after debounce
    await expect(
      mainWindow.locator('[data-testid="song-validation-errors"]'),
    ).not.toBeVisible({ timeout: 3000 });

    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('save error clears on content edit', async ({ mainWindow }) => {
    // Trigger a save error
    const error = await fillAndSave(mainWindow, 'Verse\nNo separator here');
    await expect(error).toBeVisible({ timeout: 5000 });

    // Edit content — the stale save error should clear immediately
    await mainWindow.locator('#song-content').fill(
      'Verse\nSome lyrics\n---\nVerse',
    );
    await expect(error).not.toBeVisible();

    await mainWindow.locator('button:has-text("Anulează")').click();
  });

  test('valid content with 2-line slides saves successfully', async ({
    mainWindow,
  }) => {
    await openCreateSongDialog(mainWindow);
    await mainWindow.locator('#song-name').fill('Two Line Slide Song');
    await mainWindow.locator('#song-content').fill(
      'Verse\nLine one\nLine two\n\nLine three\nLine four\n---\nVerse',
    );

    await mainWindow.locator('button:has-text("Adaugă cântec")').click();
    await expect(mainWindow.locator('text=Adaugă cântec nou')).not.toBeVisible({
      timeout: 10000,
    });
  });
});
