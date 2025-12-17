if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test')

  test('search finds tasks', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Open app')
    await page.fill('input[placeholder="Search"]', 'Welcome')
    await expect(page.locator('text=Welcome to Todo Raptor')).toBeVisible()
  })
}
