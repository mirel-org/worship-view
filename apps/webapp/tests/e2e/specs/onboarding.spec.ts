import { test, expect, setupOnboardingTest } from '../fixtures/browser-fixture';

test.describe('Onboarding Gates', () => {
  test('shows API key setup screen when API key is missing', async ({ onboardingPage }) => {
    await setupOnboardingTest(onboardingPage, { skipApiKey: true });

    // The API key gate should show Romanian setup heading
    const heading = onboardingPage.locator('h1:has-text("Configurare necesară")');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Should show API key specific instructions
    const description = onboardingPage.locator('text=cheia API Jazz Cloud');
    await expect(description).toBeVisible();

    // Tabs should NOT be visible (app not rendered)
    const tabs = onboardingPage.locator('[role="tab"]');
    await expect(tabs).toHaveCount(0);
  });

  test('shows auth screen when not authenticated', async ({ onboardingPage }) => {
    await setupOnboardingTest(onboardingPage, { skipAuth: true });

    // The auth gate should show Romanian setup heading
    const heading = onboardingPage.locator('h1:has-text("Configurare necesară")');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Should show authentication-related text
    const description = onboardingPage.locator(
      'text=Vă rugăm să vă autentificați pentru a utiliza această aplicație.',
    );
    await expect(description).toBeVisible();

    // Tabs should NOT be visible (app not rendered)
    const tabs = onboardingPage.locator('[role="tab"]');
    await expect(tabs).toHaveCount(0);
  });

  test('shows organization setup when no organization exists', async ({ onboardingPage }) => {
    await setupOnboardingTest(onboardingPage, { skipOrganization: true });

    // The organization gate should show Romanian heading
    const heading = onboardingPage.locator('h1:has-text("Organizație necesară")');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // The OrganizationSetupModal should be rendered with action buttons
    const createButton = onboardingPage.locator('button:has-text("Creează organizație nouă")');
    await expect(createButton).toBeVisible({ timeout: 10000 });

    const acceptButton = onboardingPage.locator('button:has-text("Acceptă invitația")');
    await expect(acceptButton).toBeVisible();

    // Tabs should NOT be visible (app not rendered)
    const tabs = onboardingPage.locator('[role="tab"]');
    await expect(tabs).toHaveCount(0);
  });

  test('renders full app when all onboarding gates pass', async ({ onboardingPage }) => {
    // No flags = all gates pass (default behavior)
    await setupOnboardingTest(onboardingPage, {});

    // Tabs should be visible (app fully rendered)
    const tabs = onboardingPage.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 30000 });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Settings button should be visible
    const settingsButton = onboardingPage.locator('[data-testid="settings-button"]');
    await expect(settingsButton).toBeVisible();

    // No onboarding headings should be visible
    const setupRequired = onboardingPage.locator('h1:has-text("Configurare necesară")');
    await expect(setupRequired).toHaveCount(0);

    const orgRequired = onboardingPage.locator('h1:has-text("Organizație necesară")');
    await expect(orgRequired).toHaveCount(0);
  });
});
