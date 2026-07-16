async function postJson<TBody, TResponse>(
  path: string,
  body: TBody,
  errorLabel: string,
): Promise<TResponse> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Failed to ${errorLabel}: ${res.status}`)
  }
  return (await res.json()) as TResponse
}

export type SurfaceAssumptionInput = {
  labelId: string
  labelName: string
}

export async function surfaceRiskiestAssumption(
  input: SurfaceAssumptionInput,
): Promise<{ assumption: string }> {
  return postJson('/api/surface-assumption', input, 'surface assumption')
}

export type SuggestExperimentInput = {
  hypothesis: string
}

export type TestCardRating = 1 | 2 | 3

export type ExperimentDraft = {
  test: string
  metric: string
  criteria: string
  lockedThreshold: number
  critical: TestCardRating
  testCost: TestCardRating
  dataReliability: TestCardRating
  timeRequired: TestCardRating
}

export async function suggestExperiment(
  input: SuggestExperimentInput,
): Promise<ExperimentDraft> {
  return postJson('/api/suggest-experiment', input, 'suggest experiment')
}
