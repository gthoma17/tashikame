import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LabelScopeSelector } from '../components/LabelScopeSelector'
import { CreateExperimentForm } from '../components/CreateExperimentForm'

export function CreatePage() {
  const [picked, setPicked] = useState<{ id: string; title: string } | null>(null)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        ← Back
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 'var(--space-6) 0', color: 'var(--color-text-primary)' }}>
        New Experiment
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', fontSize: '0.9rem' }}>
        Choose a label to scope this experiment to a feature area, then pick a story.
      </p>
      <LabelScopeSelector onStoryPick={setPicked} />
      <CreateExperimentForm storyId={picked?.id ?? null} storyTitle={picked?.title ?? null} />
    </div>
  )
}
