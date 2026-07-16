import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { surfaceRiskiestAssumption } from './llm'

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
