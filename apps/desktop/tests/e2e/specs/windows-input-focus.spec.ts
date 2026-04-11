import { test, expect } from '../fixtures/electron-fixture';

async function blurAndRefocusMainWindow(
  electronApp: import('@playwright/test').ElectronApplication,
) {
  await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.blur();
    win.focus();
  });
}

async function expectInputWorksAfterAlt(
  electronApp: import('@playwright/test').ElectronApplication,
  mainWindow: import('@playwright/test').Page,
  inputSelector: string,
  replacementText: string,
) {
  const input = mainWindow.locator(inputSelector);

  await input.click();
  await expect(input).toBeFocused();
  await input.fill('initial text');
  await mainWindow.keyboard.press('Alt');

  await blurAndRefocusMainWindow(electronApp);

  await input.click();
  await expect(input).toBeFocused();
  await input.pressSequentially(replacementText);
  await expect(input).toHaveValue(replacementText);
}

test.describe('Windows Input Focus Regression', () => {
  test.skip(process.platform !== 'win32', 'Windows-only regression coverage');

  test('song and bible inputs keep accepting keyboard input after Alt and window refocus', async ({ electronApp, mainWindow }) => {
    await expectInputWorksAfterAlt(
      electronApp,
      mainWindow,
      '#search-song',
      'songs refocused',
    );

    await mainWindow.locator('[role="tab"]:has-text("Biblie")').click();

    await expectInputWorksAfterAlt(
      electronApp,
      mainWindow,
      '#search-verse',
      'bible refocused',
    );
  });
});
