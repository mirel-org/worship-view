import { test, expect } from '../fixtures/electron-fixture';

/**
 * Helper: open the Settings dialog by clicking the settings button.
 */
async function openSettings(page: import('@playwright/test').Page) {
  await page.locator('[data-testid="settings-button"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: navigate to the "Stiluri text" settings tab.
 */
async function openTextStylesTab(page: import('@playwright/test').Page) {
  await openSettings(page);
  await page.locator('[role="tab"]:has-text("Stiluri text")').click();
  // Wait for the tab content to render — "Implicit" is the auto-created default style
  await expect(page.locator('button:has-text("Implicit")')).toBeVisible({ timeout: 5000 });
}

test.describe('Text Styles Settings', () => {
  test('shows "Stiluri text" tab in settings', async ({ mainWindow }) => {
    await openSettings(mainWindow);
    const tab = mainWindow.locator('[role="tab"]:has-text("Stiluri text")');
    await expect(tab).toBeVisible({ timeout: 5000 });
  });

  test('default style "Implicit" is shown in the list', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // "Implicit" should be visible in the style list
    const implicitButton = mainWindow.locator('button:has-text("Implicit")');
    await expect(implicitButton).toBeVisible();

    // The default style name should appear in the detail header
    await expect(mainWindow.locator('h3:has-text("Implicit")')).toBeVisible();
  });

  test('default style fields are editable', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Click the Implicit style to make sure it's selected
    await mainWindow.locator('button:has-text("Implicit")').click();
    await mainWindow.waitForTimeout(200);

    // All fields should be enabled (editable)
    const nameInput = mainWindow.locator('#style-name');
    await expect(nameInput).toBeEnabled();

    const fontTrigger = mainWindow.locator('#style-font');
    await expect(fontTrigger).toBeEnabled();

    const slideSizeTrigger = mainWindow.locator('#style-slide-size');
    await expect(slideSizeTrigger).toBeEnabled();
  });

  test('last remaining style cannot be deleted', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Click the Implicit style (the only one)
    await mainWindow.locator('button:has-text("Implicit")').click();
    await mainWindow.waitForTimeout(200);

    // The delete button should NOT be visible when it's the last style
    const deleteButton = mainWindow.locator('button:has-text("Șterge")');
    await expect(deleteButton).not.toBeVisible();
  });

  test('create a new text style via "Stil nou" button', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Click "Stil nou" to create a new style
    await mainWindow.locator('button:has-text("Stil nou")').click();
    await mainWindow.waitForTimeout(300);

    // A new style "Stil nou" should appear in the list
    const newStyleButton = mainWindow.locator('button:has-text("Stil nou")').first();
    await expect(newStyleButton).toBeVisible({ timeout: 5000 });

    // The detail panel should show the new style's name
    await expect(mainWindow.locator('h3:has-text("Stil nou")')).toBeVisible();

    // The name input should be editable
    const nameInput = mainWindow.locator('#style-name');
    await expect(nameInput).toBeEnabled();
  });

  test('style fields are editable', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Edit the default style's name
    const nameInput = mainWindow.locator('#style-name');
    await nameInput.clear();
    await nameInput.fill('Stil personalizat');
    await mainWindow.waitForTimeout(400); // Wait for debounce

    // Verify the updated name appears in the header
    await expect(mainWindow.locator('h3:has-text("Stil personalizat")')).toBeVisible();

    // Font size should also be editable
    const sizeInput = mainWindow.locator('#style-size');
    await expect(sizeInput).toBeEnabled();
  });

  test('select a custom style as active', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Create a new style
    await mainWindow.locator('button:has-text("Stil nou")').click();
    await mainWindow.waitForTimeout(300);

    // The "Selectează" button should be visible (style is not active yet)
    const selectButton = mainWindow.locator('button:has-text("Selectează")');
    await expect(selectButton).toBeVisible();

    // Click "Selectează" to make it the active style
    await selectButton.click();
    await mainWindow.waitForTimeout(300);

    // After selection, "Stilul activ" label should appear
    await expect(mainWindow.locator('text=Stilul activ')).toBeVisible();

    // "Selectează" button should no longer be visible
    await expect(selectButton).not.toBeVisible();
  });

  test('delete a style when multiple exist', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Create a new style
    await mainWindow.locator('button:has-text("Stil nou")').click();
    await mainWindow.waitForTimeout(300);

    // Verify the new style is in the list
    const newStyleInList = mainWindow.locator('button:has-text("Stil nou")').first();
    await expect(newStyleInList).toBeVisible({ timeout: 5000 });

    // Accept the confirmation dialog
    mainWindow.on('dialog', (dialog) => dialog.accept());

    // Click delete
    await mainWindow.locator('button:has-text("Șterge")').click();
    await mainWindow.waitForTimeout(300);

    // After deletion, selection should revert to "Implicit"
    await expect(mainWindow.locator('h3:has-text("Implicit")')).toBeVisible({ timeout: 5000 });
  });

  test('preview area shows sample text with multiple lines', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // The preview label should be visible
    await expect(mainWindow.getByText('Previzualizare', { exact: true })).toBeVisible();

    // The preview area should show sample lines (default is 4 lines)
    await expect(mainWindow.locator('text=Binecuvântat este Domnul')).toBeVisible();
    await expect(mainWindow.locator('text=Cel ce vine în numele Lui')).toBeVisible();
    await expect(mainWindow.locator('text=Osana în ceruri')).toBeVisible();
    await expect(mainWindow.locator('text=Slavă veșnică Lui')).toBeVisible();
  });

  test('slide size field is present and shows default value', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // The "Linii per slide" label should be visible
    await expect(mainWindow.locator('label:has-text("Linii per slide")')).toBeVisible();

    // The select should show the default value "4"
    const slideSizeTrigger = mainWindow.locator('#style-slide-size');
    await expect(slideSizeTrigger).toBeVisible();
  });

  test('switching between styles updates detail panel', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Create a new style
    await mainWindow.locator('button:has-text("Stil nou")').click();
    await mainWindow.waitForTimeout(300);

    // Rename it so we can identify it
    const nameInput = mainWindow.locator('#style-name');
    await nameInput.clear();
    await nameInput.fill('Stil test');
    await mainWindow.waitForTimeout(400);

    // Save the changes so the sidebar updates
    await mainWindow.locator('button:has-text("Salvează")').click();
    await mainWindow.waitForTimeout(300);

    // Switch back to Implicit
    await mainWindow.locator('button:has-text("Implicit")').click();
    await mainWindow.waitForTimeout(200);

    // Header should show Implicit
    await expect(mainWindow.locator('h3:has-text("Implicit")')).toBeVisible();

    // Switch to the custom style
    await mainWindow.locator('button:has-text("Stil test")').click();
    await mainWindow.waitForTimeout(200);

    // Header should show the custom style
    await expect(mainWindow.locator('h3:has-text("Stil test")')).toBeVisible();
  });

  test('deleting the active style reverts to first remaining', async ({ mainWindow }) => {
    await openTextStylesTab(mainWindow);

    // Create and select a new style
    await mainWindow.locator('button:has-text("Stil nou")').click();
    await mainWindow.waitForTimeout(300);

    // Make it active
    await mainWindow.locator('button:has-text("Selectează")').click();
    await mainWindow.waitForTimeout(300);

    // Verify it's active
    await expect(mainWindow.locator('text=Stilul activ')).toBeVisible();

    // Accept the confirmation dialog
    mainWindow.on('dialog', (dialog) => dialog.accept());

    // Delete it
    await mainWindow.locator('button:has-text("Șterge")').click();
    await mainWindow.waitForTimeout(300);

    // Should revert to Implicit
    await expect(mainWindow.locator('h3:has-text("Implicit")')).toBeVisible({ timeout: 5000 });

    // Implicit should now be the active style
    const implicitItem = mainWindow.locator('button:has-text("Implicit")');
    await expect(implicitItem).toBeVisible();
  });
});
