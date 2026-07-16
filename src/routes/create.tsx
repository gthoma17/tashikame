import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LabelScopeSelector } from '../components/LabelScopeSelector'
import { CreateExperimentForm } from '../components/CreateExperimentForm'

export function CreatePage() {
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        ← Back
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 'var(--space-6) 0', color: 'var(--color-text-primary)' }}>
        New Experiment
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', fontSize: '0.9rem' }}>
        Choose a label (feature area) to scope this experiment. The verdict will be written back to every story under that label.
      </p>
      <LabelScopeSelector onLabelPick={setPicked} />
      <CreateExperimentForm labelId={picked?.id ?? null} labelName={picked?.name ?? null} />
    </div>
  )
}
