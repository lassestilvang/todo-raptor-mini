import { test, expect } from '@playwright/test'

test('create a task via UI', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Open app')
  await page.fill('input[placeholder="Add a task"]', 'E2E task')
  await page.click('text=Add')
  await expect(page.locator('text=E2E task')).toBeVisible()
})
