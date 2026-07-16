import { test, expect } from '@playwright/test'

const CONCLUDED_KILL_EXPERIMENT = [
  {
    id: 'e2e-exp-1',
    hypothesis: 'Profile feature increases retention',
    status: 'concluded',
    locked_threshold: 8,
    measured_value: 4.1,
  },
]

const SUPABASE_URL = 'https://resqeunzqmmnjqaefjaw.supabase.co'

test.beforeEach(async ({ page }) => {
  await page.route(`${SUPABASE_URL}/rest/v1/experiments*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CONCLUDED_KILL_EXPERIMENT),
    })
  })
})

test('write-back button is shown for a concluded experiment with a verdict', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Profile feature increases retention')).toBeVisible()
  await expect(page.getByText('kill')).toBeVisible()
  await expect(page.getByRole('button', { name: /write back/i })).toBeVisible()
})

test('successful write-back shows "Written" confirmation', async ({ page }) => {
  await page.route(`${SUPABASE_URL}/functions/v1/write-verdict-back`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ storyIds: ['200029021', '200029022'], label: 'killed' }),
    })
  })

  await page.goto('/')
  await page.getByRole('button', { name: /write back/i }).click()
  await expect(page.getByText(/written/i)).toBeVisible()
})

test('failed write-back shows error and retry button without losing the verdict', async ({ page }) => {
  await page.route(`${SUPABASE_URL}/functions/v1/write-verdict-back`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'TrackerBoot API unavailable' }),
    })
  })

  await page.goto('/')
  await page.getByRole('button', { name: /write back/i }).click()

  // verdict is still visible — not lost
  await expect(page.getByText('kill')).toBeVisible()
  // error state and retry shown
  await expect(page.getByText(/error/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
})
