import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { surfaceRiskiestAssumption, suggestExperiment } from './llm'

describe('surfaceRiskiestAssumption', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs label context to /api/surface-assumption and returns the proposed assumption', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ assumption: 'Users will save at least 3 recipes per week' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await surfaceRiskiestAssumption({
      labelId: 'label-7',
      labelName: 'recipe-save',
    })

    expect(result).toEqual({ assumption: 'Users will save at least 3 recipes per week' })
    expect(fetch).toHaveBeenCalledWith(
      '/api/surface-assumption',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ labelId: 'label-7', labelName: 'recipe-save' }),
      }),
    )
  })

  it('throws when the endpoint responds with an error status', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'upstream failure' }), { status: 502 }),
    )

    await expect(
      surfaceRiskiestAssumption({ labelId: 'x', labelName: 'x' }),
    ).rejects.toThrow(/surface.*assumption/i)
  })
})

describe('suggestExperiment', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs the hypothesis to /api/suggest-experiment and returns a full Test Card draft (incl. proposed threshold)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          test: 'Add a Save button that opens a coming-soon modal on the recipe page',
          metric: 'Save-button click-through rate',
          criteria: 'At least 30% of recipe-page visitors click Save within a week',
          lockedThreshold: 30,
          critical: 3,
          testCost: 1,
          dataReliability: 2,
          timeRequired: 1,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await suggestExperiment({
      hypothesis: 'Users will save at least 3 recipes per week',
    })

    expect(result).toEqual({
      test: 'Add a Save button that opens a coming-soon modal on the recipe page',
      metric: 'Save-button click-through rate',
      criteria: 'At least 30% of recipe-page visitors click Save within a week',
      lockedThreshold: 30,
      critical: 3,
      testCost: 1,
      dataReliability: 2,
      timeRequired: 1,
    })
    expect(fetch).toHaveBeenCalledWith(
      '/api/suggest-experiment',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ hypothesis: 'Users will save at least 3 recipes per week' }),
      }),
    )
  })

  it('throws when the endpoint responds with an error status', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'upstream failure' }), { status: 502 }),
    )

    await expect(
      suggestExperiment({ hypothesis: 'x' }),
    ).rejects.toThrow(/suggest.*experiment/i)
  })
})
