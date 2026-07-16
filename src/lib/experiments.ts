import { supabase } from './supabase'

export async function createExperiment(input: {
  storyId: string
  hypothesis: string
  lockedThreshold: number
}) {
  const { error } = await supabase.from('experiments').insert({
    story_id: input.storyId,
    hypothesis: input.hypothesis,
    locked_threshold: input.lockedThreshold,
  })
  if (error) throw error
}

export async function concludeExperiment(id: string, measuredValue: number) {
  const { error } = await supabase
    .from('experiments')
    .update({ measured_value: measuredValue, status: 'concluded' })
    .eq('id', id)
  if (error) throw error
}

export function computeVerdict(
  lockedThreshold: number,
  measuredValue: number,
): 'kill' | 'keep' | 'inconclusive' {
  if (measuredValue < lockedThreshold) return 'kill'
  if (measuredValue > lockedThreshold) return 'keep'
  return 'inconclusive'
}
