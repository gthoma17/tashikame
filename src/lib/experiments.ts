import { supabase } from './supabase'

export type VerdictLabelInput = {
  kill?: string
  keep?: string
  inconclusive?: string
}

export async function createExperiment(input: {
  labelId: string
  hypothesis: string
  lockedThreshold: number
  verdictLabels?: VerdictLabelInput
}) {
  const row: Record<string, unknown> = {
    label_id: input.labelId,
    hypothesis: input.hypothesis,
    locked_threshold: input.lockedThreshold,
    status: 'running',
  }
  const labels = input.verdictLabels
  if (labels?.kill) row.verdict_label_kill = labels.kill
  if (labels?.keep) row.verdict_label_keep = labels.keep
  if (labels?.inconclusive) row.verdict_label_inconclusive = labels.inconclusive

  const { error } = await supabase.from('experiments').insert(row)
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

export type VerdictLabelOverrides = {
  kill: string | null
  keep: string | null
  inconclusive: string | null
}

const DEFAULT_VERDICT_LABELS: Record<'kill' | 'keep' | 'inconclusive', string> = {
  kill: 'killed',
  keep: 'kept',
  inconclusive: 'inconclusive',
}

export function computeVerdictLabel(
  verdict: 'kill' | 'keep' | 'inconclusive',
  overrides?: VerdictLabelOverrides,
): string {
  return overrides?.[verdict] ?? DEFAULT_VERDICT_LABELS[verdict]
}

export async function writeVerdictBack(experimentId: string): Promise<{ storyIds: string[]; label: string }> {
  const { data, error } = await supabase.functions.invoke('write-verdict-back', {
    body: { experimentId },
  })
  if (error) throw error
  return data as { storyIds: string[]; label: string }
}
