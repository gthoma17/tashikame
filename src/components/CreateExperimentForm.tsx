import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createExperiment } from '../lib/experiments'
import { surfaceRiskiestAssumption } from '../lib/llm'
import './CreateExperimentForm.css'

type Props = {
  labelId: string | null
  labelName: string | null
}

export function CreateExperimentForm({ labelId, labelName }: Props) {
  const navigate = useNavigate()
  const [hypothesis, setHypothesis] = useState('')
  const [threshold, setThreshold] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (input: { labelId: string; hypothesis: string; lockedThreshold: number }) =>
      createExperiment(input),
    onSuccess: () => navigate({ to: '/' }),
  })

  const surfaceMutation = useMutation({
    mutationFn: (input: { labelId: string; labelName: string }) => surfaceRiskiestAssumption(input),
    onSuccess: (data) => setHypothesis(data.assumption),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!hypothesis.trim() || !threshold.trim()) {
      setError('Please enter both a hypothesis and a threshold.')
      return
    }
    setError(null)
    createMutation.mutate({
      labelId: labelId!,
      hypothesis: hypothesis.trim(),
      lockedThreshold: Number(threshold),
    })
  }

  function handleSurface() {
    if (!labelId || !labelName) return
    surfaceMutation.mutate({ labelId, labelName })
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      {labelName && (
        <p className="create-form__scope">
          Scoped to: <strong>{labelName}</strong>
        </p>
      )}
      <button
        type="button"
        className="create-form__surface"
        onClick={handleSurface}
        disabled={labelId === null || surfaceMutation.isPending}
      >
        {surfaceMutation.isPending ? 'Surfacing…' : 'Surface the riskiest assumption'}
      </button>
      {surfaceMutation.isError && (
        <p role="alert" className="create-form__error">
          Could not surface an assumption. Please try again.
        </p>
      )}
      <label className="create-form__field">
        <span className="create-form__label">Hypothesis</span>
        <textarea
          className="create-form__input"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          rows={3}
        />
      </label>
      <label className="create-form__field">
        <span className="create-form__label">Locked threshold</span>
        <input
          className="create-form__input"
          type="number"
          step="any"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="create-form__error">
          {error}
        </p>
      )}
      {createMutation.isError && (
        <p role="alert" className="create-form__error">
          Could not save the experiment. Please try again.
        </p>
      )}
      <button
        type="submit"
        className="create-form__submit"
        disabled={labelId === null || createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating…' : 'Create'}
      </button>
    </form>
  )
}
