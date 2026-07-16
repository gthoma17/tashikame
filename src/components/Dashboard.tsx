import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { computeVerdict, writeVerdictBack } from '../lib/experiments'
import './Dashboard.css'

type Experiment = {
  id: string
  hypothesis: string
  status: 'draft' | 'running' | 'concluded'
  locked_threshold: number | null
  measured_value: number | null
}

type WriteBackState = 'idle' | 'loading' | 'done' | 'error'

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
  const [writeBackStates, setWriteBackStates] = useState<Record<string, WriteBackState>>({})

  async function handleWriteBack(experimentId: string) {
    setWriteBackStates((s) => ({ ...s, [experimentId]: 'loading' }))
    try {
      await writeVerdictBack(experimentId)
      setWriteBackStates((s) => ({ ...s, [experimentId]: 'done' }))
    } catch {
      setWriteBackStates((s) => ({ ...s, [experimentId]: 'error' }))
    }
  }

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
            <th>Consequence</th>
            <th></th>
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
            const wbState = writeBackStates[exp.id] ?? 'idle'
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
                <td>
                  {verdict && (
                    wbState === 'idle' ? (
                      <button className="writeback-btn" onClick={() => handleWriteBack(exp.id)}>
                        Write back
                      </button>
                    ) : wbState === 'loading' ? (
                      <span className="writeback-loading">Writing…</span>
                    ) : wbState === 'done' ? (
                      <span className="writeback-done">Written ✓</span>
                    ) : (
                      <>
                        <span className="writeback-error">Error</span>
                        <button className="writeback-btn" onClick={() => handleWriteBack(exp.id)}>
                          Retry
                        </button>
                      </>
                    )
                  )}
                </td>
                <td>
                  {exp.status === 'running' && (
                    <Link
                      to="/experiments/$id/conclude"
                      params={{ id: exp.id }}
                      className="dashboard-conclude-link"
                    >
                      Conclude
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
