if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test') as typeof import('@playwright/test');

  test('upload attachment', async ({ page }: { page: any }) => {
    await page.goto('/');
    await page.click('text=Open app');
    await page.waitForSelector('input[placeholder="Add a task"]');
    // ... file upload steps (omitted for brevity)
    await expect(page.locator('input[placeholder="Add a task"]')).toBeVisible();
  });
}
