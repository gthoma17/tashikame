import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { concludeExperiment } from '../../lib/experiments'
import './conclude.css'

interface Props {
  experimentId: string
}

export function ConcludeExperimentForm({ experimentId }: Props) {
  const [measuredValue, setMeasuredValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await concludeExperiment(experimentId, parseFloat(measuredValue))
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="conclude-page">
        <div className="conclude-card">
          <div className="conclude-done">
            <div className="conclude-done-icon">✓</div>
            <div className="conclude-done-title">Experiment concluded</div>
            <div className="conclude-done-body">The result has been recorded. Check the dashboard for the verdict.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="conclude-page">
      <div className="conclude-card">
        <p className="conclude-eyebrow">Conclude experiment</p>
        <h1 className="conclude-title">Enter the measured result</h1>
        <p className="conclude-subtitle">Record the observed metric value to lock in the experiment outcome.</p>

        <form onSubmit={handleSubmit}>
          <div className="conclude-field">
            <label className="conclude-label" htmlFor="measured-value">
              Measured value
              <span className="conclude-hint">numeric</span>
            </label>
            <input
              id="measured-value"
              className="conclude-input"
              type="number"
              step="any"
              placeholder="0.00"
              value={measuredValue}
              onChange={(e) => setMeasuredValue(e.target.value)}
              required
            />
          </div>

          {error && <p className="conclude-error" role="alert">{error}</p>}

          <button className="conclude-btn" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save result'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function ConcludeExperimentPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  return <ConcludeExperimentForm experimentId={id} />
}
