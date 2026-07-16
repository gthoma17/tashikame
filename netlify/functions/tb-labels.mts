import type { Config } from '@netlify/functions'

export default async (_req: Request) => {
  const apiKey = Netlify.env.get('TB_API_KEY')
  const projectId = Netlify.env.get('VITE_TB_PROJECT_ID')

  const res = await fetch('https://trackerboot.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: 'query Labels($projectId: ID!) { labels(projectId: $projectId) { id name } }',
      variables: { projectId },
    }),
  })

  if (!res.ok) {
    return Response.json({ error: `TB API HTTP error: ${res.status}` }, { status: 502 })
  }

  const json = await res.json() as { data?: { labels: unknown[] }; errors?: unknown[] }

  if (json.errors?.length) {
    return Response.json({ error: 'TB API error', details: json.errors }, { status: 502 })
  }

  return Response.json(json.data?.labels ?? [])
}

export const config: Config = {
  path: '/api/tb-labels',
}
