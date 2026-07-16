import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

type Experiment = {
  id: string
  hypothesis: string
  status: 'draft' | 'running' | 'concluded'
  result: 'validated' | 'invalidated' | null
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Proposed',
  running: 'Running',
  concluded: 'Concluded',
}

async function fetchExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('id, hypothesis, status, result')
  if (error) throw error
  return data ?? []
}

export function Dashboard() {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: fetchExperiments,
  })

  if (isLoading) return null

  if (!experiments?.length) {
    return (
      <div>
        <p>No experiments yet. Create your first experiment to get started.</p>
      </div>
    )
  }

  return (
    <ul>
      {experiments.map((exp) => (
        <li key={exp.id}>
          <span>{exp.hypothesis}</span>
          <span>{STATUS_LABEL[exp.status] ?? exp.status}</span>
          {exp.result && <span>{exp.result}</span>}
        </li>
      ))}
    </ul>
  )
}
