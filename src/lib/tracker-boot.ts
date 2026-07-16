export type TBLabel = { id: string; name: string }
export type TBStory = { id: string; title: string }

export async function fetchLabels(): Promise<TBLabel[]> {
  const res = await fetch('/api/tb-labels')
  if (!res.ok) throw new Error(`Failed to fetch labels: ${res.status}`)
  return res.json() as Promise<TBLabel[]>
}

export async function fetchStoriesByLabel(labelId: string): Promise<TBStory[]> {
  const res = await fetch(`/api/tb-stories?labelId=${encodeURIComponent(labelId)}`)
  if (!res.ok) throw new Error(`Failed to fetch stories: ${res.status}`)
  return res.json() as Promise<TBStory[]>
}
