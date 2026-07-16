import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchLabels, fetchStoriesByLabel } from '../lib/tracker-boot'
import './LabelScopeSelector.css'

export function LabelScopeSelector() {
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)

  const { data: labels, isError: labelsError } = useQuery({
    queryKey: ['tb-labels'],
    queryFn: fetchLabels,
  })

  const { data: stories, isError: storiesError } = useQuery({
    queryKey: ['tb-stories', selectedLabelId],
    queryFn: () => fetchStoriesByLabel(selectedLabelId!),
    enabled: selectedLabelId !== null,
  })

  if (labelsError) {
    return <p className="label-scope__error">Could not load labels from Tracker Boot.</p>
  }

  return (
    <div className="label-scope">
      <select
        className="label-scope__select"
        value={selectedLabelId ?? ''}
        onChange={(e) => setSelectedLabelId(e.target.value || null)}
      >
        <option value="">Select a label…</option>
        {labels?.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>

      {storiesError && (
        <p className="label-scope__error">Could not load stories for this label.</p>
      )}

      {selectedLabelId !== null && stories !== undefined && !storiesError && (
        stories.length === 0 ? (
          <p className="label-scope__empty">This feature has no stories to experiment on.</p>
        ) : (
          <ul className="label-scope__stories">
            {stories.map((story) => (
              <li key={story.id}>{story.name}</li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
