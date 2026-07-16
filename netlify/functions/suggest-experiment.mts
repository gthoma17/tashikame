// Bedrock (not direct Anthropic API) — see surface-assumption.mts for the
// reason we go through BKL_-prefixed AWS env vars.
import type { Config } from '@netlify/functions'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// Drafts the Strategyzer Test Card — https://labspractices.com/practices/lean-experiments/
// Steps 2/3/4 + duration + the four 1–3 ratings. Step 1 (hypothesis) is the input.
function buildPrompt(hypothesis: string): string {
  return `You are helping a product manager fill in a Strategyzer Test Card (from labspractices.com/practices/lean-experiments/) to validate ONE belief with the cheapest, fastest lean experiment.

Hypothesis (Step 1, already fixed): "${hypothesis}"

Draft the remaining Test Card fields as JSON with EXACTLY these keys:

- "test":            Step 2 — "To verify that, we will ___". One sentence describing the concrete procedure the team will run. Start with a verb.
- "metric":          Step 3 — "And measure ___". ONLY the name of the single signal, as a noun phrase. NO target value, NO threshold, NO percentage, NO comparison. The threshold lives in a separate field, not here.
- "criteria":        Step 4 — "We are right if ___". A single, testable success statement that names the metric AND its threshold (e.g. "at least 30% of recipe-page visitors click Save within a week").
- "lockedThreshold": The numeric threshold implied by "criteria". Must be the same number that appears in the criteria statement, as a plain JSON number (e.g. 30 for "30%", 0.4 for "40%" only if you also express the metric as a fraction). Choose whichever form (percentage as 30, or fraction as 0.3) the metric text most naturally reads in — but be internally consistent between "criteria" and "lockedThreshold".
- "critical":        Integer 1–3. How critical is validating this hypothesis to the feature's success? 3 = if this is wrong the feature sinks.
- "testCost":        Integer 1–3. Cost of running the test. 1 = cheap/free, 3 = expensive.
- "dataReliability": Integer 1–3. How trustworthy the resulting data is. 3 = highly reliable (real user behavior at scale), 1 = weak signal (small sample, opinions).
- "timeRequired":    Integer 1–3. How long the test takes. 1 = fast, 3 = slow.

Good "metric" (noun-only, no threshold): "save-button click-through rate", "week-2 retention rate", "recipes saved per active user per week".
Bad "metric" (contains a threshold — do NOT do this): "≥70% of visitors click save", "click-through rate above 30%".

Good "criteria" (statement including the threshold): "At least 30% of recipe-page visitors click Save within a week", "Week-2 retention rate is at least 40%".

Return ONLY the JSON object — no preamble, no code fences, no commentary.`
}

async function invokeClaudeOnBedrock(prompt: string): Promise<string> {
  const modelId = Netlify.env.get('BEDROCK_MODEL_ID')
  if (!modelId) throw new Error('BEDROCK_MODEL_ID is not configured')

  const accessKeyId = Netlify.env.get('BKL_AWS_ACCESS_KEY_ID')
  const secretAccessKey = Netlify.env.get('BKL_AWS_SECRET_ACCESS_KEY')
  const sessionToken = Netlify.env.get('BKL_AWS_SESSION_TOKEN')
  const region = Netlify.env.get('BKL_AWS_REGION')
  if (!accessKeyId || !secretAccessKey || !sessionToken || !region) {
    throw new Error('BKL_AWS_* credentials are not fully configured')
  }

  const client = new BedrockRuntimeClient({
    region,
    credentials: { accessKeyId, secretAccessKey, sessionToken },
  })

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 800,
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

function clampRating(v: unknown): 1 | 2 | 3 {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) throw new Error('rating must be a number')
  const rounded = Math.round(n)
  if (rounded <= 1) return 1
  if (rounded >= 3) return 3
  return 2
}

type Draft = {
  test: string
  metric: string
  criteria: string
  lockedThreshold: number
  critical: 1 | 2 | 3
  testCost: 1 | 2 | 3
  dataReliability: 1 | 2 | 3
  timeRequired: 1 | 2 | 3
}

function parseDraft(raw: string): Draft {
  const parsed = JSON.parse(raw) as Record<string, unknown>
  const str = (k: string) => {
    const v = parsed[k]
    if (typeof v !== 'string' || !v.trim()) throw new Error(`missing string field: ${k}`)
    return v.trim()
  }
  const rawThreshold = parsed.lockedThreshold
  const lockedThreshold =
    typeof rawThreshold === 'number' ? rawThreshold : Number(rawThreshold)
  if (!Number.isFinite(lockedThreshold)) {
    throw new Error('lockedThreshold must be a finite number')
  }
  return {
    test: str('test'),
    metric: str('metric'),
    criteria: str('criteria'),
    lockedThreshold,
    critical: clampRating(parsed.critical),
    testCost: clampRating(parsed.testCost),
    dataReliability: clampRating(parsed.dataReliability),
    timeRequired: clampRating(parsed.timeRequired),
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { hypothesis?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { hypothesis } = body
  if (!hypothesis || !hypothesis.trim()) {
    return Response.json({ error: 'hypothesis is required' }, { status: 400 })
  }

  try {
    const raw = await invokeClaudeOnBedrock(buildPrompt(hypothesis))
    const draft = parseDraft(raw)
    return Response.json(draft)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Failed to suggest experiment: ${message}` }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/suggest-experiment',
}
