import { Page } from '@playwright/test';
import { createTestUser, deleteTestUser } from './supabaseAdmin';

export type TestUser = {
  id: string;
  email: string;
  password: string;
};

/**
 * Creates a test user with metadata and logs in via the UI
 */
export async function setupLoggedInUser(page: Page): Promise<TestUser> {
  const timestamp = Date.now();
  const email = `test-user-${timestamp}@example.com`;
  const password = `Test123!${timestamp}`;

  // ✅ Pass metadata as an object — NOT a string
  const user = await createTestUser(email, password, { role: 'ambassador' });

  await loginViaUI(page, email, password);

  return {
    id: user.id,
    email,
    password,
  };
}

/**
 * Login via UI using email and password
 */
export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|\/$/);
}

/**
 * Deletes the test user via Supabase Admin API
 */
export async function cleanupTestUser(userId: string) {
  if (userId) {
    await deleteTestUser(userId);
  }
}
