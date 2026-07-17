import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { computeVerdict, overrideThreshold, writeVerdictBack } from '../lib/experiments'
import './Dashboard.css'

type ThresholdOverride = {
  old_value: number
  new_value: number
  created_at: string
}

type Experiment = {
  id: string
  test_name: string | null
  hypothesis: string
  status: 'running' | 'concluded'
  locked_threshold: number | null
  measured_value: number | null
  experiment_threshold_overrides: ThresholdOverride[]
}

type WriteBackState = 'idle' | 'loading' | 'done' | 'error'

const STATUS_LABEL: Record<string, string> = {
  running: 'Running',
  concluded: 'Concluded',
}

async function fetchExperiments(): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select(
      'id, test_name, hypothesis, status, locked_threshold, measured_value, experiment_threshold_overrides(old_value, new_value, created_at)',
    )
  if (error) throw error
  return data ?? []
}

export function Dashboard() {
  const queryClient = useQueryClient()
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: fetchExperiments,
  })
  const [writeBackStates, setWriteBackStates] = useState<Record<string, WriteBackState>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')

  async function handleWriteBack(experimentId: string) {
    setWriteBackStates((s) => ({ ...s, [experimentId]: 'loading' }))
    try {
      await writeVerdictBack(experimentId)
      setWriteBackStates((s) => ({ ...s, [experimentId]: 'done' }))
    } catch {
      setWriteBackStates((s) => ({ ...s, [experimentId]: 'error' }))
    }
  }

  function startEditing(id: string, current: number) {
    setEditingId(id)
    setEditingValue(String(current))
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingValue('')
  }

  async function saveOverride(id: string) {
    const parsed = Number(editingValue)
    if (!Number.isFinite(parsed)) return
    await overrideThreshold(id, parsed)
    cancelEditing()
    queryClient.invalidateQueries({ queryKey: ['experiments'] })
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
            <th>Experiment</th>
            <th>Status</th>
            <th>Threshold</th>
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
            const overrides = exp.experiment_threshold_overrides ?? []
            const latestOverride = overrides.length
              ? overrides.reduce((a, b) => (a.created_at > b.created_at ? a : b))
              : null
            return (
              <tr key={exp.id}>
                <td>{exp.test_name ?? exp.hypothesis}</td>
                <td>
                  <span className={`status status--${exp.status}`}>
                    {STATUS_LABEL[exp.status] ?? exp.status}
                  </span>
                </td>
                <td>
                  {exp.locked_threshold != null && (
                    <span className="threshold">
                      {editingId === exp.id ? (
                        <>
                          <input
                            type="number"
                            aria-label="New threshold"
                            className="threshold-input"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                          />
                          <button className="threshold-save-btn" onClick={() => saveOverride(exp.id)}>
                            Save
                          </button>
                          <button className="threshold-cancel-btn" onClick={cancelEditing}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="threshold-value">{exp.locked_threshold}</span>
                          {latestOverride && (
                            <span className="threshold-override" title={`Overridden ${overrides.length}×`}>
                              overridden — was {latestOverride.old_value}
                            </span>
                          )}
                          {exp.status === 'running' && (
                            <button
                              className="threshold-override-btn"
                              onClick={() => startEditing(exp.id, exp.locked_threshold as number)}
                            >
                              Override
                            </button>
                          )}
                        </>
                      )}
                    </span>
                  )}
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
