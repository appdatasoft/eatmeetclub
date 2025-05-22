
import { Page } from '@playwright/test';
import { createTestUser, deleteTestUser } from './supabaseAdmin';

export type TestUser = {
  id: string;
  email: string;
  password: string;
};

/**
 * Create a test user and log in through the UI
 */
export async function setupLoggedInUser(page: Page, testUserData?: Partial<TestUser>): Promise<TestUser> {
  // Create random test user credentials
  const timestamp = Date.now();
  const email = testUserData?.email || `test-user-${timestamp}@example.com`;
  const password = testUserData?.password || `Test123!${timestamp}`;
  
  // Create user via Admin API
  const user = await createTestUser(email, password);
  
  if (!user || !user.id) {
    throw new Error('Failed to create test user via Supabase Admin API');
  }
  
  // Log in through the UI
  await loginViaUI(page, email, password);
  
  return {
    id: user.id,
    email,
    password
  };
}

/**
 * Login via the UI
 */
export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Wait for login form to be ready
  await page.waitForSelector('input[type="email"]');
  
  // Fill in credentials and submit
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation or success indicator
  await page.waitForSelector('text=Welcome back');
  
  // Validate that login was successful
  const isLoggedIn = await page.evaluate(() => {
    return localStorage.getItem('sb-wocfwpedauuhlrfugxuu-auth-token') !== null;
  });
  
  if (!isLoggedIn) {
    throw new Error('Login failed - no auth token found in localStorage');
  }
}

/**
 * Clean up a test user
 */
export async function cleanupTestUser(userId: string) {
  if (userId) {
    await deleteTestUser(userId);
  }
}
