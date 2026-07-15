import { describe, it, expect } from 'vitest'
import { supabase } from './supabase'

describe('data spine — experiments schema', () => {
  it('experiments table is readable with no error', async () => {
    const { error } = await supabase.from('experiments').select('id').limit(1)
    expect(error).toBeNull()
  })
})
