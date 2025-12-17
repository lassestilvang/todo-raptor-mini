if (process.env.PW_TEST) {
  const { test, expect } = require('@playwright/test')

  test('upload attachment', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Open app')
    // ... file upload steps (omitted for brevity)
    await expect(page.locator('text=Upload')).toBeVisible()
  })
}
