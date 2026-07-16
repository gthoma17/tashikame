import { useQuery } from '@tanstack/react-query'
import { fetchLabels } from '../lib/tracker-boot'
import './LabelScopeSelector.css'

type Props = {
  onLabelPick?: (label: { id: string; name: string }) => void
}

export function LabelScopeSelector({ onLabelPick }: Props = {}) {
  const { data: labels, isError: labelsError } = useQuery({
    queryKey: ['tb-labels'],
    queryFn: fetchLabels,
  })

  if (labelsError) {
    return <p className="label-scope__error">Could not load labels from Tracker Boot.</p>
  }

  return (
    <div className="label-scope">
      <select
        className="label-scope__select"
        defaultValue=""
        onChange={(e) => {
          const picked = labels?.find((l) => l.id === e.target.value)
          if (picked) onLabelPick?.(picked)
        }}
      >
        <option value="" disabled>Select a label…</option>
        {labels?.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
    </div>
  )
}
