import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TB_API = 'https://api.trackerboot.com/graphql'
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

const LABELS_QUERY = `query Labels($projectId: ID!) { labels(projectId: $projectId) { id name } }`

const EXECUTE_COMMAND = `
  mutation Cmd($input: CommandInput!) {
    executeCommand(input: $input) {
      version
      type
      data { ... on Label { id name } }
    }
  }
`

async function getOrCreateLabel(
  labelName: string,
  projectId: string,
  token: string,
): Promise<string> {
  const { labels } = await tbRequest<{ labels: Array<{ id: string; name: string }> }>(
    LABELS_QUERY,
    { projectId },
    token,
  )
  const existing = labels.find((l) => l.name === labelName)
  if (existing) return existing.id

  const result = await tbRequest<{
    executeCommand: { data: Array<{ id: string; name: string }> }
  }>(
    EXECUTE_COMMAND,
    {
      input: {
        projectId,
        commandId: crypto.randomUUID(),
        type: 'LABEL_CREATE',
        parameters: { name: labelName },
      },
    },
    token,
  )
  const created = result.executeCommand?.data?.[0]
  if (!created?.id) throw new Error(`Failed to create label "${labelName}"`)
  return created.id
}

async function addLabelToStory(
  storyId: string,
  labelId: string,
  projectId: string,
  token: string,
): Promise<void> {
  await tbRequest(
    EXECUTE_COMMAND,
    {
      input: {
        projectId,
        commandId: crypto.randomUUID(),
        type: 'STORY_MULTI_LABEL_ADD',
        // parameters shape assumed from TB command convention — verify against TB backend if needed
        parameters: { storyIds: [storyId], labelId },
      },
    },
    token,
  )
}

Deno.serve(async (req) => {
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

    const labelId = await getOrCreateLabel(label, TB_PROJECT_ID, tbToken)
    await addLabelToStory(exp.story_id, labelId, TB_PROJECT_ID, tbToken)

    return new Response(JSON.stringify({ storyId: exp.story_id, label }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
