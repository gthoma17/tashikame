export type SurfaceAssumptionInput = {
  labelId: string
  labelName: string
}

export async function surfaceRiskiestAssumption(
  input: SurfaceAssumptionInput,
): Promise<{ assumption: string }> {
  const res = await fetch('/api/surface-assumption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(`Failed to surface assumption: ${res.status}`)
  }
  return (await res.json()) as { assumption: string }
}
