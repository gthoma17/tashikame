import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}))

import { supabase } from './supabase'
import { concludeExperiment, computeVerdict, computeVerdictLabel, createExperiment, overrideThreshold, writeVerdictBack } from './experiments'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>
const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>

describe('createExperiment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a running experiment as a full Test Card scoped to the picked label', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await createExperiment({
      labelId: 'label-7',
      testName: 'Recipe save fake-door',
      deadline: '2026-08-01',
      hypothesis: 'Users will save 3 recipes per week',
      test: 'Add a Save button that opens a coming-soon modal',
      metric: 'Save-button click-through rate',
      criteria: 'At least 30% of visitors click Save within one week',
      lockedThreshold: 30,
      critical: 3,
      testCost: 1,
      dataReliability: 2,
      timeRequired: 1,
    })

    expect(mockFrom).toHaveBeenCalledWith('experiments')
    expect(mockInsert).toHaveBeenCalledWith({
      label_id: 'label-7',
      test_name: 'Recipe save fake-door',
      deadline: '2026-08-01',
      hypothesis: 'Users will save 3 recipes per week',
      test: 'Add a Save button that opens a coming-soon modal',
      metric: 'Save-button click-through rate',
      criteria: 'At least 30% of visitors click Save within one week',
      locked_threshold: 30,
      critical: 3,
      test_cost: 1,
      data_reliability: 2,
      time_required: 1,
      status: 'running',
    })
  })

  it('throws when supabase returns an error', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: new Error('insert failed') })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await expect(
      createExperiment({
        labelId: 'l',
        testName: 't',
        deadline: '2026-01-01',
        hypothesis: 'h',
        test: 't',
        metric: 'm',
        criteria: 'c',
        lockedThreshold: 1,
        critical: 1,
        testCost: 1,
        dataReliability: 1,
        timeRequired: 1,
      }),
    ).rejects.toThrow('insert failed')
  })

  it('persists custom verdict labels when provided', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await createExperiment({
      labelId: 'label-7',
      testName: 'x',
      deadline: '2026-08-01',
      hypothesis: 'h',
      test: 't',
      metric: 'm',
      criteria: 'c',
      lockedThreshold: 3,
      critical: 1,
      testCost: 1,
      dataReliability: 1,
      timeRequired: 1,
      verdictLabels: { kill: 'cut', keep: 'ship it', inconclusive: 'unclear' },
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        verdict_label_kill: 'cut',
        verdict_label_keep: 'ship it',
        verdict_label_inconclusive: 'unclear',
      }),
    )
  })

  it('omits verdict-label columns when no custom labels are provided', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await createExperiment({
      labelId: 'label-7',
      testName: 'x',
      deadline: '2026-08-01',
      hypothesis: 'h',
      test: 't',
      metric: 'm',
      criteria: 'c',
      lockedThreshold: 3,
      critical: 1,
      testCost: 1,
      dataReliability: 1,
      timeRequired: 1,
    })

    const arg = mockInsert.mock.calls[0][0]
    expect(arg).not.toHaveProperty('verdict_label_kill')
    expect(arg).not.toHaveProperty('verdict_label_keep')
    expect(arg).not.toHaveProperty('verdict_label_inconclusive')
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

describe('overrideThreshold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates locked_threshold on the target experiment', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await overrideThreshold('exp-123', 12)

    expect(mockFrom).toHaveBeenCalledWith('experiments')
    expect(mockUpdate).toHaveBeenCalledWith({ locked_threshold: 12 })
    expect(mockEq).toHaveBeenCalledWith('id', 'exp-123')
  })

  it('throws when supabase returns an error', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: new Error('update failed') })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await expect(overrideThreshold('exp-123', 12)).rejects.toThrow('update failed')
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

  it('prefers the experiment override when present', () => {
    expect(
      computeVerdictLabel('kill', { kill: 'cut', keep: 'ship it', inconclusive: 'unclear' }),
    ).toBe('cut')
    expect(
      computeVerdictLabel('keep', { kill: 'cut', keep: 'ship it', inconclusive: 'unclear' }),
    ).toBe('ship it')
    expect(
      computeVerdictLabel('inconclusive', { kill: 'cut', keep: 'ship it', inconclusive: 'unclear' }),
    ).toBe('unclear')
  })

  it('falls back to the default when the matching override is null', () => {
    expect(computeVerdictLabel('kill', { kill: null, keep: 'ship it', inconclusive: null })).toBe(
      'killed',
    )
    expect(
      computeVerdictLabel('inconclusive', { kill: null, keep: null, inconclusive: null }),
    ).toBe('inconclusive')
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
