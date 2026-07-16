import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

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
      <div className="dashboard-empty">
        <p>No experiments yet. Create your first experiment to get started.</p>
        <Link to="/create" className="dashboard-new-btn">New Experiment</Link>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Experiments</h1>
        <Link to="/create" className="dashboard-new-btn">New Experiment</Link>
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Hypothesis</th>
            <th>Status</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.hypothesis}</td>
              <td>
                <span className={`status status--${exp.status}`}>
                  {STATUS_LABEL[exp.status] ?? exp.status}
                </span>
              </td>
              <td>
                {exp.result && (
                  <span className={`verdict verdict--${exp.result}`}>
                    {exp.result}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
