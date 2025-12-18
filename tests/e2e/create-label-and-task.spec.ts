if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test');

  test('create label and task', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Open app');
    // create label
    // create label (click the form-local Add button)
    await page.fill('input[placeholder="Label"]', 'Urgent');
    await page.click('form:has(input[placeholder="Label"]) >> button');
    // wait for label to appear in sidebar
    await expect(page.locator('text=Urgent')).toBeVisible({ timeout: 5000 });

    // create task and check label
    await page.fill('input[placeholder="Add a task"]', 'Task with label');
    // ensure lists and labels fetched
    await page.waitForSelector('select option', { timeout: 5000 });
    const taskForm = page.locator('form:has(input[placeholder="Add a task"])');
    await taskForm.locator('button[type="submit"]').click();
    await expect(page.locator('text=Task with label')).toBeVisible({ timeout: 5000 });
  });
}
