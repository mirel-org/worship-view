import { test, expect } from '../fixtures/electron-fixture';

test.describe('IPC Communication', () => {
  test('myAPI.getDisplays() returns an array of displays', async ({ mainWindow }) => {
    const displays = await mainWindow.evaluate(async () => {
      return await (window as any).myAPI.getDisplays();
    });

    expect(Array.isArray(displays)).toBe(true);
    expect(displays.length).toBeGreaterThan(0);

    // Each display should have expected properties
    const firstDisplay = displays[0];
    expect(firstDisplay).toHaveProperty('id');
    expect(firstDisplay).toHaveProperty('bounds');
  });

});
