// Bedrock (not direct Anthropic API) — PM's BKL AWS sandbox pays for it.
// Don't "fix" this toward api.anthropic.com.
import type { Config } from '@netlify/functions'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

type TBStory = { id: string; title: string }

async function fetchStoriesForLabel(labelId: string): Promise<TBStory[]> {
  const apiKey = Netlify.env.get('TB_API_KEY')
  const projectId = Netlify.env.get('TB_PROJECT_ID') ?? '100000277'

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
  if (!res.ok) throw new Error(`Tracker Boot fetch failed: ${res.status}`)
  const json = (await res.json()) as { data?: { stories: TBStory[] }; errors?: unknown[] }
  if (json.errors?.length) throw new Error('Tracker Boot returned errors')
  return json.data?.stories ?? []
}

function buildPrompt(labelName: string, stories: TBStory[]): string {
  const list = stories.length
    ? stories.map((s) => `- ${s.title}`).join('\n')
    : '(no stories under this label yet)'
  return `You are helping a product manager stress-test a proposed feature by surfacing its single riskiest belief — the one that, if wrong, sinks the feature.

Feature label: "${labelName}"
User stories under this label:
${list}

Write ONE assumption statement in the form "We believe that <specific, testable claim about users or their behavior>." Keep it under 25 words, concrete, and falsifiable. Return only the sentence — no preamble, no commentary.`
}

async function invokeClaudeOnBedrock(prompt: string): Promise<string> {
  const modelId = Netlify.env.get('BEDROCK_MODEL_ID')
  if (!modelId) throw new Error('BEDROCK_MODEL_ID is not configured')

  // Region is required by the SDK; AWS creds come from the standard AWS_* env vars.
  const client = new BedrockRuntimeClient({ region: Netlify.env.get('AWS_REGION') })

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const response = await client.send(command)
  const payload = JSON.parse(new TextDecoder().decode(response.body)) as {
    content?: { type: string; text: string }[]
  }
  const text = payload.content?.find((c) => c.type === 'text')?.text?.trim()
  if (!text) throw new Error('Bedrock returned no text content')
  return text
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { labelId?: string; labelName?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { labelId, labelName } = body
  if (!labelId || !labelName) {
    return Response.json({ error: 'labelId and labelName are required' }, { status: 400 })
  }

  try {
    const stories = await fetchStoriesForLabel(labelId)
    const assumption = await invokeClaudeOnBedrock(buildPrompt(labelName, stories))
    return Response.json({ assumption })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Failed to surface assumption: ${message}` }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/surface-assumption',
}
