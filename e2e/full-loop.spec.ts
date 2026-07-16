import { test, expect, type Route } from '@playwright/test'

const SUPABASE_URL = 'https://resqeunzqmmnjqaefjaw.supabase.co'
const TB_LABEL = { id: 'lbl-auth', name: 'Auth' }
const HYPOTHESIS = 'Users will sign up faster with SSO.'
const LOCKED_THRESHOLD = 10
const MEASURED_KILL = 4
const STUB_STORY_IDS = ['200029021', '200029022', '200029023']

type WriteBackCapture = { experimentId: string }

test('full build-measure-learn loop: create → conclude → write back', async ({ page }) => {
  const experiments: Array<Record<string, unknown>> = []
  let writeBackCall: WriteBackCapture | null = null

  await page.route('**/api/tb-labels', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([TB_LABEL]),
    })
  })

  await page.route('**/api/surface-assumption', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ assumption: HYPOTHESIS }),
    })
  })

  await page.route('**/api/suggest-experiment', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        test: 'Add an SSO button to the sign-up page and route it to Google OAuth.',
        metric: 'signup completion rate (%)',
        criteria: 'At least a 10-percentage-point uplift versus the current baseline.',
        lockedThreshold: LOCKED_THRESHOLD,
        critical: 3,
        testCost: 2,
        dataReliability: 3,
        timeRequired: 2,
      }),
    })
  })

  await page.route(`${SUPABASE_URL}/rest/v1/experiments*`, async (route: Route) => {
    const method = route.request().method()
    if (method === 'GET') {
      const projection = experiments.map((exp) => ({
        ...exp,
        experiment_threshold_overrides: [],
      }))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(projection),
      })
      return
    }
    if (method === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      const created = { id: 'e2e-exp-1', measured_value: null, ...body }
      experiments.push(created)
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([created]),
      })
      return
    }
    if (method === 'PATCH') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      for (let i = 0; i < experiments.length; i++) {
        experiments[i] = { ...experiments[i], ...body }
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(experiments),
      })
      return
    }
    await route.fallback()
  })

  await page.route(`${SUPABASE_URL}/functions/v1/write-verdict-back`, async (route) => {
    const body = route.request().postDataJSON() as { experimentId: string }
    writeBackCall = { experimentId: body.experimentId }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ storyIds: STUB_STORY_IDS, label: 'killed' }),
    })
  })

  // --- Create ---
  await page.goto('/create')
  await page.getByRole('combobox').selectOption(TB_LABEL.id)
  await page.getByRole('button', { name: /surface the riskiest assumption/i }).click()
  await expect(page.locator('textarea').first()).toHaveValue(HYPOTHESIS)
  await page.getByRole('button', { name: /draft the rest of the test card/i }).click()
  await expect(page.getByRole('spinbutton', { name: /locked threshold/i })).toHaveValue(
    String(LOCKED_THRESHOLD),
  )
  await page.getByLabel('Test Name').fill('SSO signup test')
  await page.getByLabel('Deadline').fill('2026-08-01')
  await page.getByRole('button', { name: /^create$/i }).click()

  // --- Dashboard shows the new running experiment ---
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText(HYPOTHESIS)).toBeVisible()
  await expect(page.getByText('Running')).toBeVisible()

  // --- Conclude with a measured value that trips kill ---
  await page.getByRole('link', { name: /conclude/i }).click()
  await page.getByLabel(/measured value/i).fill(String(MEASURED_KILL))
  await page.getByRole('button', { name: /save result/i }).click()
  await expect(page.getByText(/experiment concluded/i)).toBeVisible()

  // --- Back to dashboard: verdict is "kill" ---
  await page.goto('/')
  await expect(page.getByText('kill')).toBeVisible()

  // --- Write back ---
  await page.getByRole('button', { name: /write back/i }).click()
  await expect(page.getByText(/written/i)).toBeVisible()

  // --- Assert the stub captured the write-back call ---
  expect(writeBackCall).not.toBeNull()
  expect(writeBackCall!.experimentId).toBe('e2e-exp-1')
})
