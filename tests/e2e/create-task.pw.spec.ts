if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test');

  test('create a task via UI', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Open app');
    await page.waitForSelector('input[placeholder="Add a task"]');
    await page.fill('input[placeholder="Add a task"]', 'E2E task');
    // click the form submit button scoped under the main content to avoid ambiguous Add buttons
    const submitBtn = page.locator('main form button[type="submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForSelector('text=E2E task');
    await expect(page.locator('text=E2E task')).toBeVisible();
  });
}
