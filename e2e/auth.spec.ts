
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
    // Setup test user and log in
    testUser = await setupLoggedInUser(page);
    
    // Verify we're logged in and redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify user menu is visible
    await page.click('button.relative.h-8.w-8.rounded-full');
    await expect(page.locator('text=My Account')).toBeVisible();
    
    // Log out to verify the process
    await page.click('text=Logout');
    
    // Verify we're logged out and redirected to home
    await expect(page).toHaveURL(/\/$/);
  });
});
