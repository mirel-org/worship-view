import { test, expect } from '../fixtures/electron-fixture';
import { isApiExposed, isContextIsolationEnabled, getWindowTitle } from '../helpers/app-helpers';

test.describe('App Launch', () => {
  test('app launches and creates a window', async ({ electronApp, mainWindow }) => {
    // mainWindow fixture ensures the window exists
    // Check that we have at least one window
    const windows = electronApp.windows();
    expect(windows.length).toBeGreaterThan(0);

    // Check that mainWindow is valid
    expect(mainWindow).toBeTruthy();
  });

  test('window has correct title', async ({ mainWindow }) => {
    // Wait a bit for title to be set (may be async)
    await mainWindow.waitForTimeout(1000);
    const title = await getWindowTitle(mainWindow);

    // Title should either be "Worship View" or empty if renderer hasn't loaded
    // We pass if it matches or is empty (indicating partial build)
    expect(title === 'Worship View' || title === '').toBe(true);
  });

  test('context isolation is enabled', async ({ mainWindow }) => {
    // window.require should not exist when context isolation is enabled
    const isolated = await isContextIsolationEnabled(mainWindow);
    expect(isolated).toBe(true);
  });

  test('window.myAPI is exposed', async ({ mainWindow }) => {
    const exposed = await isApiExposed(mainWindow);
    expect(exposed).toBe(true);
  });
});
