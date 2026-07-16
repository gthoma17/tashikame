import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createExperiment } from '../lib/experiments'
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

  const mutation = useMutation({
    mutationFn: (input: { labelId: string; hypothesis: string; lockedThreshold: number }) =>
      createExperiment(input),
    onSuccess: () => navigate({ to: '/' }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!hypothesis.trim() || !threshold.trim()) {
      setError('Please enter both a hypothesis and a threshold.')
      return
    }
    setError(null)
    mutation.mutate({
      labelId: labelId!,
      hypothesis: hypothesis.trim(),
      lockedThreshold: Number(threshold),
    })
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      {labelName && (
        <p className="create-form__scope">
          Scoped to: <strong>{labelName}</strong>
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
      {mutation.isError && (
        <p role="alert" className="create-form__error">
          Could not save the experiment. Please try again.
        </p>
      )}
      <button
        type="submit"
        className="create-form__submit"
        disabled={labelId === null || mutation.isPending}
      >
        {mutation.isPending ? 'Creating…' : 'Create'}
      </button>
    </form>
  )
}
