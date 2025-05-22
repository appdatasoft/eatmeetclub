import { test, expect } from '@playwright/test';
import { setupLoggedInUser, cleanupTestUser, TestUser } from './helpers/auth';

test.describe('Authentication flow', () => {
  let testUser: TestUser;

  test.afterEach(async () => {
    if (testUser?.id) {
      await cleanupTestUser(testUser.id);
    }
  });

  test('should create user via admin API and login via UI', async ({ page }) => {
    // Create test user and log in
    testUser = await setupLoggedInUser(page);

    // Verify successful redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Open user menu (avatar button)
    await page.click('button.relative.h-8.w-8.rounded-full');

    // ✅ Use first match to avoid strict mode violation from duplicate elements
    await expect(page.locator('text=My Account').first()).toBeVisible();

    // Alternatively (if you want a better selector and your HTML supports it):
    // await expect(page.getByRole('menuitem', { name: 'My Account' })).toBeVisible();

    // Logout
    await page.click('text=Logout');

    // Confirm logout and redirect to homepage
    await expect(page).toHaveURL(/\/$/);
  });
});
