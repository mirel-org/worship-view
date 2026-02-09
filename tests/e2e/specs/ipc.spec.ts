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

  test('myAPI.getMediaItems() returns an array', async ({ mainWindow }) => {
    const mediaItems = await mainWindow.evaluate(async () => {
      return await (window as any).myAPI.getMediaItems();
    });

    expect(Array.isArray(mediaItems)).toBe(true);

    // If there are media items, check their structure
    if (mediaItems.length > 0) {
      const firstItem = mediaItems[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('type');
      expect(firstItem).toHaveProperty('path');
    }
  });
});
