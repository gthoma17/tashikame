import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  createExperiment,
  type CreateExperimentInput,
  type TestCardRating,
} from '../lib/experiments'
import { surfaceRiskiestAssumption, suggestExperiment } from '../lib/llm'
import './CreateExperimentForm.css'

type Props = {
  labelId: string | null
  labelName: string | null
}

// The three-level Test Card ratings render as three filled/empty pips.
function RatingPicker({
  legend,
  value,
  onChange,
}: {
  legend: string
  value: TestCardRating
  onChange: (v: TestCardRating) => void
}) {
  return (
    <fieldset className="tc-rating">
      <legend className="tc-rating__legend">{legend}</legend>
      {[1, 2, 3].map((n) => (
        <label key={n} className="tc-rating__opt">
          <input
            type="radio"
            name={legend}
            checked={value === n}
            onChange={() => onChange(n as TestCardRating)}
          />
          <span aria-hidden="true">{'●'.repeat(n) + '○'.repeat(3 - n)}</span>
          <span className="tc-rating__num">{n}</span>
        </label>
      ))}
    </fieldset>
  )
}

export function CreateExperimentForm({ labelId, labelName }: Props) {
  const navigate = useNavigate()
  const [testName, setTestName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [test, setTest] = useState('')
  const [metric, setMetric] = useState('')
  const [criteria, setCriteria] = useState('')
  const [threshold, setThreshold] = useState('')
  const [critical, setCritical] = useState<TestCardRating>(2)
  const [testCost, setTestCost] = useState<TestCardRating>(2)
  const [dataReliability, setDataReliability] = useState<TestCardRating>(2)
  const [timeRequired, setTimeRequired] = useState<TestCardRating>(2)
  const [killLabel, setKillLabel] = useState('')
  const [keepLabel, setKeepLabel] = useState('')
  const [inconclusiveLabel, setInconclusiveLabel] = useState('')
  const [hasDraft, setHasDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (input: CreateExperimentInput) => createExperiment(input),
    onSuccess: () => navigate({ to: '/' }),
  })

  const surfaceMutation = useMutation({
    mutationFn: (input: { labelId: string; labelName: string }) => surfaceRiskiestAssumption(input),
    onSuccess: (data) => setHypothesis(data.assumption),
  })

  const suggestMutation = useMutation({
    mutationFn: (input: { hypothesis: string }) => suggestExperiment(input),
    onSuccess: (data) => {
      setTest(data.test)
      setMetric(data.metric)
      setCriteria(data.criteria)
      setThreshold(String(data.lockedThreshold))
      setCritical(data.critical)
      setTestCost(data.testCost)
      setDataReliability(data.dataReliability)
      setTimeRequired(data.timeRequired)
      setHasDraft(true)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !testName.trim() ||
      !deadline.trim() ||
      !hypothesis.trim() ||
      !test.trim() ||
      !metric.trim() ||
      !criteria.trim() ||
      !threshold.trim()
    ) {
      setError('Please complete every field on the Test Card, plus the machine-checkable threshold.')
      return
    }
    setError(null)
    const verdictLabels: { kill?: string; keep?: string; inconclusive?: string } = {}
    if (killLabel.trim()) verdictLabels.kill = killLabel.trim()
    if (keepLabel.trim()) verdictLabels.keep = keepLabel.trim()
    if (inconclusiveLabel.trim()) verdictLabels.inconclusive = inconclusiveLabel.trim()
    createMutation.mutate({
      labelId: labelId!,
      testName: testName.trim(),
      deadline: deadline.trim(),
      hypothesis: hypothesis.trim(),
      test: test.trim(),
      metric: metric.trim(),
      criteria: criteria.trim(),
      lockedThreshold: Number(threshold),
      critical,
      testCost,
      dataReliability,
      timeRequired,
      ...(Object.keys(verdictLabels).length > 0 ? { verdictLabels } : {}),
    })
  }

  function handleSurface() {
    if (!labelId || !labelName) return
    surfaceMutation.mutate({ labelId, labelName })
  }

  function handleSuggest() {
    const trimmed = hypothesis.trim()
    if (!labelId || !trimmed) return
    suggestMutation.mutate({ hypothesis: trimmed })
  }

  const noLabel = labelId === null

  return (
    <form className="test-card" onSubmit={handleSubmit}>
      <header className="test-card__header">
        <h2 className="test-card__title">Test Card</h2>
        <p className="test-card__attribution">
          This Test Card follows the{' '}
          <a
            href="https://labspractices.com/practices/lean-experiments/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lean Experiments practice
          </a>{' '}
          from labspractices.com
        </p>
        {labelName ? (
          <p className="test-card__scope">
            Scoped to: <strong>{labelName}</strong>
          </p>
        ) : (
          <p className="test-card__hint">Pick a label above to enable the assistant.</p>
        )}
        <div className="test-card__meta">
          <label className="tc-field">
            <span className="tc-field__label">Test Name</span>
            <input
              className="tc-field__input"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </label>
          <label className="tc-field">
            <span className="tc-field__label">Deadline</span>
            <input
              className="tc-field__input"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
        </div>
      </header>

      <button
        type="button"
        className="tc-btn tc-btn--secondary"
        onClick={handleSurface}
        disabled={noLabel || surfaceMutation.isPending}
      >
        {surfaceMutation.isPending ? 'Surfacing…' : 'Surface the riskiest assumption'}
      </button>
      {surfaceMutation.isError && (
        <p role="alert" className="tc-error">
          Could not surface an assumption. Please try again.
        </p>
      )}

      <section className="tc-step">
        <h3 className="tc-step__title">Step 1: Hypothesis</h3>
        <label className="tc-field">
          <span className="tc-field__label">We believe that</span>
          <textarea
            className="tc-field__input"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            rows={2}
          />
        </label>
        <RatingPicker legend="Critical" value={critical} onChange={setCritical} />
      </section>

      <button
        type="button"
        className="tc-btn tc-btn--secondary"
        onClick={handleSuggest}
        disabled={noLabel || !hypothesis.trim() || suggestMutation.isPending}
      >
        {suggestMutation.isPending ? 'Drafting…' : 'Draft the rest of the Test Card'}
      </button>
      {suggestMutation.isError && (
        <p role="alert" className="tc-error">
          Could not draft the Test Card. Please try again.
        </p>
      )}

      {hasDraft && (
        <>
          <section className="tc-step">
            <h3 className="tc-step__title">Step 2: Test</h3>
            <label className="tc-field">
              <span className="tc-field__label">To verify that, we will</span>
              <textarea
                className="tc-field__input"
                value={test}
                onChange={(e) => setTest(e.target.value)}
                rows={2}
              />
            </label>
            <div className="tc-step__ratings">
              <RatingPicker legend="Test Cost" value={testCost} onChange={setTestCost} />
              <RatingPicker
                legend="Data Reliability"
                value={dataReliability}
                onChange={setDataReliability}
              />
            </div>
          </section>

          <section className="tc-step">
            <h3 className="tc-step__title">Step 3: Metric</h3>
            <label className="tc-field">
              <span className="tc-field__label">And measure</span>
              <input
                className="tc-field__input"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              />
            </label>
            <RatingPicker
              legend="Time Required"
              value={timeRequired}
              onChange={setTimeRequired}
            />
          </section>

          <section className="tc-step">
            <h3 className="tc-step__title">Step 4: Criteria</h3>
            <label className="tc-field">
              <span className="tc-field__label">We are right if</span>
              <textarea
                className="tc-field__input"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={2}
              />
            </label>
            <label className="tc-field">
              <span className="tc-field__label">
                Locked threshold <span className="tc-field__note">(machine-checkable value implied by the criteria)</span>
              </span>
              <input
                className="tc-field__input"
                type="number"
                step="any"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </label>
            <div className="tc-step__ratings">
              <label className="tc-field">
                <span className="tc-field__label">
                  Kill label <span className="tc-field__note">(optional)</span>
                </span>
                <input
                  className="tc-field__input"
                  type="text"
                  placeholder="killed"
                  value={killLabel}
                  onChange={(e) => setKillLabel(e.target.value)}
                />
              </label>
              <label className="tc-field">
                <span className="tc-field__label">
                  Keep label <span className="tc-field__note">(optional)</span>
                </span>
                <input
                  className="tc-field__input"
                  type="text"
                  placeholder="kept"
                  value={keepLabel}
                  onChange={(e) => setKeepLabel(e.target.value)}
                />
              </label>
              <label className="tc-field">
                <span className="tc-field__label">
                  Inconclusive label <span className="tc-field__note">(optional)</span>
                </span>
                <input
                  className="tc-field__input"
                  type="text"
                  placeholder="inconclusive"
                  value={inconclusiveLabel}
                  onChange={(e) => setInconclusiveLabel(e.target.value)}
                />
              </label>
            </div>
          </section>
        </>
      )}

      {error && (
        <p role="alert" className="tc-error">
          {error}
        </p>
      )}
      {createMutation.isError && (
        <p role="alert" className="tc-error">
          Could not save the experiment. Please try again.
        </p>
      )}
      <button
        type="submit"
        className="tc-btn tc-btn--primary"
        disabled={noLabel || !hasDraft || createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating…' : 'Create'}
      </button>
    </form>
  )
}
