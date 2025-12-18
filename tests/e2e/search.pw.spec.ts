if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test');

  test('search finds tasks', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Open app');
    await page.waitForSelector('input[placeholder="Search tasks"]', { timeout: 15000 });
    // ensure seeded task is present in the list (give extra time in CI)
    await page.waitForSelector('text=Welcome to Todo Raptor', { timeout: 15000 });
    await page.fill('input[placeholder="Search tasks"]', 'Welcome');
    await expect(page.locator('text=Welcome to Todo Raptor')).toBeVisible({ timeout: 15000 });
  });
}
