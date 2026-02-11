import { test, expect } from '../fixtures/electron-fixture';
import { openCreateSongDialog } from '../helpers/song-helpers';

/**
 * Helper: fill the Add Song dialog and click save. Returns the error locator.
 */
async function fillAndSave(mainWindow: any, content: string) {
  await openCreateSongDialog(mainWindow);
  await mainWindow.locator('#song-name').fill('Test Song');
  await mainWindow.locator('#song-content').fill(content);
  await mainWindow.locator('button:has-text("Add Song")').click();
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
    await expect(error).toContainText('Missing separator');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('missing arrangement blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, 'Verse\nSome lyrics\n---\n');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Missing arrangement');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('empty part key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, '\nSome lyrics\n---\nVerse');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Empty part key');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('space in part key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse One\nSome lyrics here\n---\nVerse One',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('contains spaces');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('trailing whitespace on part key blocks save', async ({
    mainWindow,
  }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse \nSome lyrics here\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('trailing or leading whitespace');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('undefined arrangement key blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nSome lyrics here\n---\nVerse Chorus',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('undefined part "Chorus"');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('empty part content blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(mainWindow, 'Verse\n\n---\nVerse');
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('has no lyrics content');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('duplicate part keys blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nFirst lyrics\n---\nVerse\nSecond lyrics\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('Duplicate part key "Verse"');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('slide with more than 2 lines blocks save', async ({ mainWindow }) => {
    const error = await fillAndSave(
      mainWindow,
      'Verse\nLine one\nLine two\nLine three\n---\nVerse',
    );
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('more than 2 lines');
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
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
      'Arrangement has trailing or leading whitespace',
    );
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
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
      'Arrangement has trailing or leading whitespace',
    );
    await expect(mainWindow.locator('text=Add New Song')).toBeVisible();
    await mainWindow.locator('button:has-text("Cancel")').click();
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
    await mainWindow.locator('button:has-text("Add Song")').click();
    await expect(mainWindow.locator('text=Add New Song')).not.toBeVisible({
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
    await expect(warnings).toContainText('Malformed separator');

    await mainWindow.locator('button:has-text("Cancel")').click();
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
    await expect(warnings).toContainText('leading/trailing whitespace');

    await mainWindow.locator('button:has-text("Cancel")').click();
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
    await expect(warnings).toContainText('Extra consecutive blank line');

    await mainWindow.locator('button:has-text("Cancel")').click();
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
    await expect(warnings).toContainText('leading blank line');

    await mainWindow.locator('button:has-text("Cancel")').click();
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

    await mainWindow.locator('button:has-text("Cancel")').click();
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

    await mainWindow.locator('button:has-text("Cancel")').click();
  });

  test('valid content with 2-line slides saves successfully', async ({
    mainWindow,
  }) => {
    await openCreateSongDialog(mainWindow);
    await mainWindow.locator('#song-name').fill('Two Line Slide Song');
    await mainWindow.locator('#song-content').fill(
      'Verse\nLine one\nLine two\n\nLine three\nLine four\n---\nVerse',
    );

    await mainWindow.locator('button:has-text("Add Song")').click();
    await expect(mainWindow.locator('text=Add New Song')).not.toBeVisible({
      timeout: 10000,
    });
  });
});
