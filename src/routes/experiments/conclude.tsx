import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { concludeExperiment } from '../../lib/experiments'

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

  if (done) return <p>Experiment concluded.</p>

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Measured value
        <input
          type="number"
          step="any"
          value={measuredValue}
          onChange={(e) => setMeasuredValue(e.target.value)}
          required
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        Save
      </button>
    </form>
  )
}

export function ConcludeExperimentPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  return <ConcludeExperimentForm experimentId={id} />
}
