import { supabase } from './supabase'

export async function createExperiment(input: {
  labelId: string
  hypothesis: string
  lockedThreshold: number
}) {
  const { error } = await supabase.from('experiments').insert({
    label_id: input.labelId,
    hypothesis: input.hypothesis,
    locked_threshold: input.lockedThreshold,
    status: 'running',
  })
  if (error) throw error
}

export async function overrideThreshold(id: string, newValue: number) {
  const { error } = await supabase
    .from('experiments')
    .update({ locked_threshold: newValue })
    .eq('id', id)
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

export function computeVerdictLabel(verdict: 'kill' | 'keep' | 'inconclusive'): string {
  if (verdict === 'kill') return 'killed'
  if (verdict === 'keep') return 'kept'
  return 'inconclusive'
}

export async function writeVerdictBack(experimentId: string): Promise<{ storyIds: string[]; label: string }> {
  const { data, error } = await supabase.functions.invoke('write-verdict-back', {
    body: { experimentId },
  })
  if (error) throw error
  return data as { storyIds: string[]; label: string }
}
