import { test, expect } from '@playwright/test'

test('dashboard page loads without runtime error', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('pageerror', (err) => consoleErrors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto('/')

  const empty = page.getByText(/no experiments yet/i)
  const table = page.getByRole('columnheader', { name: /hypothesis/i })
  await expect(empty.or(table).first()).toBeVisible({ timeout: 15_000 })

  await expect(page.getByRole('link', { name: /new experiment/i })).toBeVisible()

  expect(consoleErrors, `page errors: ${consoleErrors.join(' | ')}`).toEqual([])
})
