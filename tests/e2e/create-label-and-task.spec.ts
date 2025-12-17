import { test, expect } from '@playwright/test'

test('create label and task', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Open app')
  // create label
  await page.fill('input[placeholder="Label"]', 'Urgent')
  await page.click('text=Add', { timeout: 2000 })
  // wait for label to appear in sidebar
  await expect(page.locator('text=Urgent')).toBeVisible()

  // create task and check label
  await page.fill('input[placeholder="Add a task"]', 'Task with label')
  await page.click('select')
  await page.click('text=Add')
  await expect(page.locator('text=Task with label')).toBeVisible()
})
