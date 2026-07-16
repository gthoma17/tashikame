const TB_API_BASE = 'https://api.trackerboot.com/graphql'

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
export type TBStory = { id: string; name: string }

const client = new TrackerBootClient(
  (import.meta.env.VITE_TB_API_KEY as string) ?? '',
)
const PROJECT_ID = (import.meta.env.VITE_TB_PROJECT_ID as string) ?? ''

export async function fetchLabels(): Promise<TBLabel[]> {
  const data = await client.query<{ project: { labels: TBLabel[] } }>(`
    query {
      project(id: "${PROJECT_ID}") {
        labels { id name }
      }
    }
  `)
  return data.project.labels
}

export async function fetchStoriesByLabel(labelId: string): Promise<TBStory[]> {
  const data = await client.query<{ project: { stories: TBStory[] } }>(`
    query StoriesByLabel($projectId: ID!, $labelId: ID!) {
      project(id: $projectId) {
        stories(labelId: $labelId) { id name }
      }
    }
  `, { projectId: PROJECT_ID, labelId })
  return data.project.stories
}
