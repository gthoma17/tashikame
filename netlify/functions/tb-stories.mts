import type { Config } from '@netlify/functions'

export default async (req: Request) => {
  const url = new URL(req.url)
  const labelId = url.searchParams.get('labelId')

  if (!labelId) {
    return Response.json({ error: 'labelId is required' }, { status: 400 })
  }

  const apiKey = Netlify.env.get('TB_API_KEY')
  const projectId = Netlify.env.get('VITE_TB_PROJECT_ID')

  const res = await fetch('https://trackerboot.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: 'query Stories($projectId: ID!, $labelId: ID!) { stories(projectId: $projectId, labelId: $labelId) { id title } }',
      variables: { projectId, labelId },
    }),
  })

  if (!res.ok) {
    return Response.json({ error: `TB API HTTP error: ${res.status}` }, { status: 502 })
  }

  const json = await res.json() as { data?: { stories: unknown[] }; errors?: unknown[] }

  if (json.errors?.length) {
    return Response.json({ error: 'TB API error', details: json.errors }, { status: 502 })
  }

  return Response.json(json.data?.stories ?? [])
}

export const config: Config = {
  path: '/api/tb-stories',
}
