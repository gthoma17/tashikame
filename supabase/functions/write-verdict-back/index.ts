import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TB_API = 'https://trackerboot.com/graphql'
const TB_PROJECT_ID = Deno.env.get('TB_PROJECT_ID') ?? '100000282'

function computeVerdict(threshold: number, measured: number): 'kill' | 'keep' | 'inconclusive' {
  if (measured < threshold) return 'kill'
  if (measured > threshold) return 'keep'
  return 'inconclusive'
}

function verdictLabel(verdict: 'kill' | 'keep' | 'inconclusive'): string {
  if (verdict === 'kill') return 'killed'
  if (verdict === 'keep') return 'kept'
  return 'inconclusive'
}

async function tbRequest<T>(
  gql: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T> {
  const res = await fetch(TB_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: gql, variables }),
  })
  if (!res.ok) throw new Error(`TrackerBoot request failed: ${res.status}`)
  const json = await res.json() as { data: T; errors?: unknown[] }
  if (json.errors?.length) throw new Error(`TrackerBoot error: ${JSON.stringify(json.errors)}`)
  return json.data
}

// Mirrors backend/applications/mcp-app/.../graphql-documents/addStoryLabel.graphql —
// version: 1 is required (without it, TB returns INTERNAL_ERROR).
const ADD_STORY_LABEL = `
  mutation AddStoryLabel($projectId: ID!, $commandId: ID!, $parameters: JSON!) {
    executeCommand(input: {
      projectId: $projectId
      version: 1
      commandId: $commandId
      type: STORY_MULTI_LABEL_ADD
      parameters: $parameters
    }) {
      version
      type
      data {
        __typename
        ... on Label { id name count }
      }
    }
  }
`

async function addLabelToStory(
  storyId: string,
  labelName: string,
  projectId: string,
  token: string,
): Promise<void> {
  await tbRequest(
    ADD_STORY_LABEL,
    {
      projectId,
      commandId: crypto.randomUUID(),
      parameters: {
        storyIds: [storyId],
        label: { id: '-1', name: labelName },
      },
    },
    token,
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { experimentId } = await req.json() as { experimentId: string }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: exp, error: dbErr } = await supabase
      .from('experiments')
      .select('story_id, locked_threshold, measured_value')
      .eq('id', experimentId)
      .single()

    if (dbErr || !exp) throw new Error(dbErr?.message ?? 'Experiment not found')
    if (!exp.story_id || exp.locked_threshold == null || exp.measured_value == null) {
      throw new Error('Experiment is not concluded or missing story_id')
    }

    const tbToken = Deno.env.get('TB_API_KEY')
    if (!tbToken) throw new Error('TB_API_KEY not configured')

    const verdict = computeVerdict(Number(exp.locked_threshold), Number(exp.measured_value))
    const label = verdictLabel(verdict)

    await addLabelToStory(exp.story_id, label, TB_PROJECT_ID, tbToken)

    return new Response(JSON.stringify({ storyId: exp.story_id, label }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
