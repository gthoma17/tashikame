import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}))

import { supabase } from './supabase'
import { concludeExperiment, computeVerdict, computeVerdictLabel, createExperiment, writeVerdictBack } from './experiments'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>
const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>

describe('createExperiment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a running experiment scoped to the picked label', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await createExperiment({
      labelId: 'label-7',
      hypothesis: 'Users will save 3 recipes per week',
      lockedThreshold: 3,
    })

    expect(mockFrom).toHaveBeenCalledWith('experiments')
    expect(mockInsert).toHaveBeenCalledWith({
      label_id: 'label-7',
      hypothesis: 'Users will save 3 recipes per week',
      locked_threshold: 3,
      status: 'running',
    })
  })

  it('throws when supabase returns an error', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: new Error('insert failed') })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await expect(
      createExperiment({ labelId: 'l', hypothesis: 'h', lockedThreshold: 1 }),
    ).rejects.toThrow('insert failed')
  })
})

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

describe('computeVerdictLabel', () => {
  it('maps kill to "killed"', () => {
    expect(computeVerdictLabel('kill')).toBe('killed')
  })

  it('maps keep to "kept"', () => {
    expect(computeVerdictLabel('keep')).toBe('kept')
  })

  it('maps inconclusive to "inconclusive"', () => {
    expect(computeVerdictLabel('inconclusive')).toBe('inconclusive')
  })
})

describe('writeVerdictBack', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invokes the edge function and returns the list of labeled story ids', async () => {
    mockInvoke.mockResolvedValue({
      data: { storyIds: ['200029021', '200029022', '200029023'], label: 'killed' },
      error: null,
    })

    const result = await writeVerdictBack('exp-123')

    expect(mockInvoke).toHaveBeenCalledWith('write-verdict-back', { body: { experimentId: 'exp-123' } })
    expect(result).toEqual({ storyIds: ['200029021', '200029022', '200029023'], label: 'killed' })
  })

  it('throws when the edge function returns an error', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error('TB unavailable') })

    await expect(writeVerdictBack('exp-123')).rejects.toThrow('TB unavailable')
  })
})
