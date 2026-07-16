import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from './supabase'
import { concludeExperiment, computeVerdict } from './experiments'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>

describe('concludeExperiment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates status to concluded with the measured value', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await concludeExperiment('exp-123', 42.5)

    expect(mockFrom).toHaveBeenCalledWith('experiments')
    expect(mockUpdate).toHaveBeenCalledWith({ measured_value: 42.5, status: 'concluded' })
    expect(mockEq).toHaveBeenCalledWith('id', 'exp-123')
  })

  it('throws when supabase returns an error', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: new Error('db error') })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await expect(concludeExperiment('exp-123', 42.5)).rejects.toThrow('db error')
  })
})

describe('computeVerdict', () => {
  it('returns kill when measured value is below the locked threshold', () => {
    expect(computeVerdict(8, 4.1)).toBe('kill')
  })

  it('returns keep when measured value exceeds the locked threshold', () => {
    expect(computeVerdict(8, 12)).toBe('keep')
  })

  it('returns inconclusive when measured value equals the locked threshold exactly', () => {
    expect(computeVerdict(8, 8)).toBe('inconclusive')
  })
})
