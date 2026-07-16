const TB_API_BASE = 'https://trackerboot.com/graphql'

export class TrackerBootClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async query<T = unknown>(
    gql: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(TB_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ query: gql, variables }),
    })

    if (!res.ok) {
      throw new Error(`TrackerBoot request failed: ${res.status}`)
    }

    const json = (await res.json()) as { data: T; errors?: unknown[] }

    if (json.errors?.length) {
      throw new Error(`TrackerBoot GraphQL error: ${JSON.stringify(json.errors)}`)
    }

    return json.data
  }
}

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
