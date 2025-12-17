import { test, expect } from '@playwright/test'

test('search finds tasks', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Open app')

  // create a task
  await page.fill('input[placeholder="Add a task"]', 'Searchable task')
  await page.click('text=Add')
  await expect(page.locator('text=Searchable task')).toBeVisible()

  // use search
  await page.fill('input[placeholder="Search tasks"]', 'Searchable')
  await expect(page.locator('text=Searchable task')).toBeVisible()
})
