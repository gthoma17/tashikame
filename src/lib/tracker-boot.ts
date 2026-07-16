export type TBLabel = { id: string; name: string }

export async function fetchLabels(): Promise<TBLabel[]> {
  const res = await fetch('/api/tb-labels')
  if (!res.ok) throw new Error(`Failed to fetch labels: ${res.status}`)
  return res.json() as Promise<TBLabel[]>
}
