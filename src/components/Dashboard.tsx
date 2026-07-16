import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { computeVerdict } from '../lib/experiments'
import './Dashboard.css'

type Experiment = {
  id: string
  hypothesis: string
  status: 'draft' | 'running' | 'concluded'
  locked_threshold: number | null
  measured_value: number | null
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Proposed',
  running: 'Running',
  concluded: 'Concluded',
}

async function fetchExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('id, hypothesis, status, locked_threshold, measured_value')
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
      <div className="dashboard-empty">
        <p>No experiments yet. Create your first experiment to get started.</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Experiments</h1>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Hypothesis</th>
            <th>Status</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp) => {
            const verdict =
              exp.status === 'concluded' &&
              exp.locked_threshold != null &&
              exp.measured_value != null
                ? computeVerdict(exp.locked_threshold, exp.measured_value)
                : null
            return (
              <tr key={exp.id}>
                <td>{exp.hypothesis}</td>
                <td>
                  <span className={`status status--${exp.status}`}>
                    {STATUS_LABEL[exp.status] ?? exp.status}
                  </span>
                </td>
                <td>
                  {verdict && <span className={`verdict verdict--${verdict}`}>{verdict}</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
