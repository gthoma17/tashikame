import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { CreateExperimentForm } from './CreateExperimentForm'

vi.mock('../lib/experiments', () => ({
  createExperiment: vi.fn(),
}))

vi.mock('../lib/llm', () => ({
  surfaceRiskiestAssumption: vi.fn(),
  suggestExperiment: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

import { createExperiment } from '../lib/experiments'
import { surfaceRiskiestAssumption, suggestExperiment } from '../lib/llm'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const fullDraft = {
  test: 'Add a Save button that opens a coming-soon modal',
  metric: 'Save-button click-through rate',
  criteria: 'At least 30% of visitors click Save within one week',
  lockedThreshold: 30,
  critical: 3,
  testCost: 1,
  dataReliability: 2,
  timeRequired: 1,
} as const

async function fillHeader(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/test name/i), 'Recipe save fake-door')
  await user.type(screen.getByLabelText(/deadline/i), '2026-08-01')
}

describe('CreateExperimentForm (Test Card)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(suggestExperiment).mockResolvedValue({ ...fullDraft })
  })

  it('saves a full Test Card experiment scoped to the picked label and navigates to the dashboard', async () => {
    const user = userEvent.setup()
    vi.mocked(createExperiment).mockResolvedValue(undefined)

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await fillHeader(user)
    await user.type(screen.getByLabelText(/we believe that/i), 'Users will save 3+ recipes per week')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))
    await screen.findByLabelText(/to verify that, we will/i)

    // The LLM draft populates the threshold from the criteria — no manual entry needed.
    expect(screen.getByLabelText(/^locked threshold/i)).toHaveValue(30)

    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(createExperiment).toHaveBeenCalledWith({
      labelId: 'label-7',
      testName: 'Recipe save fake-door',
      deadline: '2026-08-01',
      hypothesis: 'Users will save 3+ recipes per week',
      test: fullDraft.test,
      metric: fullDraft.metric,
      criteria: fullDraft.criteria,
      lockedThreshold: 30,
      critical: 3,
      testCost: 1,
      dataReliability: 2,
      timeRequired: 1,
    })
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  it('disables Create until the Test Card has been drafted', async () => {
    const user = userEvent.setup()

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled()
    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled()
    expect(createExperiment).not.toHaveBeenCalled()
  })

  it('shows a validation error when a required Test Card field has been cleared before saving', async () => {
    const user = userEvent.setup()

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await fillHeader(user)
    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))
    const testField = await screen.findByLabelText(/to verify that, we will/i)
    await user.clear(testField)
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/complete every field/i)
    expect(createExperiment).not.toHaveBeenCalled()
  })

  it('disables submit when no label is picked', () => {
    render(<CreateExperimentForm labelId={null} labelName={null} />, {
      wrapper: makeWrapper(),
    })

    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled()
  })

  it('shows the picked label as the scope target', () => {
    render(
      <CreateExperimentForm labelId="label-7" labelName="profile" />,
      { wrapper: makeWrapper() },
    )

    expect(screen.getByText(/scoped to/i)).toHaveTextContent('profile')
  })

  it('surfaces a Claude-proposed assumption into the editable hypothesis field', async () => {
    const user = userEvent.setup()
    vi.mocked(surfaceRiskiestAssumption).mockResolvedValue({
      assumption: 'Users will save 3+ recipes per week',
    })

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /surface the riskiest assumption/i }))

    const hypothesis = await screen.findByLabelText(/we believe that/i)
    await vi.waitFor(() => {
      expect(hypothesis).toHaveValue('Users will save 3+ recipes per week')
    })
    expect(surfaceRiskiestAssumption).toHaveBeenCalledWith({
      labelId: 'label-7',
      labelName: 'profile',
    })
  })

  it('shows an error and preserves user input when Surface is unavailable, allowing retry', async () => {
    const user = userEvent.setup()
    vi.mocked(surfaceRiskiestAssumption).mockRejectedValueOnce(new Error('upstream down'))

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/we believe that/i), 'manual draft')
    await user.click(screen.getByRole('button', { name: /surface the riskiest assumption/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/could not surface/i)
    expect(screen.getByLabelText(/we believe that/i)).toHaveValue('manual draft')

    vi.mocked(surfaceRiskiestAssumption).mockResolvedValueOnce({ assumption: 'Retry worked' })
    await user.click(screen.getByRole('button', { name: /surface the riskiest assumption/i }))

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/we believe that/i)).toHaveValue('Retry worked')
    })
  })

  it('disables the surface button until a label is picked', () => {
    render(<CreateExperimentForm labelId={null} labelName={null} />, {
      wrapper: makeWrapper(),
    })

    expect(screen.getByRole('button', { name: /surface the riskiest assumption/i })).toBeDisabled()
  })

  it('drafts the rest of the Test Card (test/metric/criteria/duration + ratings) from the current hypothesis', async () => {
    const user = userEvent.setup()

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/we believe that/i), 'Users will save 3+ recipes per week')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/to verify that, we will/i)).toHaveValue(fullDraft.test)
    })
    expect(screen.getByLabelText(/and measure/i)).toHaveValue(fullDraft.metric)
    expect(screen.getByLabelText(/we are right if/i)).toHaveValue(fullDraft.criteria)
    expect(screen.getByLabelText(/^locked threshold/i)).toHaveValue(30)
    expect(suggestExperiment).toHaveBeenCalledWith({
      hypothesis: 'Users will save 3+ recipes per week',
    })
  })

  it('lets the user edit the suggested criteria and stores the edit on save', async () => {
    const user = userEvent.setup()
    vi.mocked(createExperiment).mockResolvedValue(undefined)

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await fillHeader(user)
    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))
    const criteria = await screen.findByLabelText(/we are right if/i)
    await user.clear(criteria)
    await user.type(criteria, 'Save rate exceeds 40% within one week')
    // Threshold was prefilled by the LLM; user overrides it to match the edited criteria
    const thresholdField = screen.getByLabelText(/^locked threshold/i)
    await user.clear(thresholdField)
    await user.type(thresholdField, '40')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(createExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        criteria: 'Save rate exceeds 40% within one week',
        lockedThreshold: 40,
      }),
    )
  })

  it('shows an error and preserves inputs when the draft LLM is unavailable, allowing retry', async () => {
    const user = userEvent.setup()
    vi.mocked(suggestExperiment).mockRejectedValueOnce(new Error('upstream down'))

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/we believe that/i), 'Users save recipes')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/could not draft/i)
    expect(screen.getByLabelText(/we believe that/i)).toHaveValue('Users save recipes')

    vi.mocked(suggestExperiment).mockResolvedValueOnce({ ...fullDraft, test: 'Manually save recipes for 5 users' })
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/to verify that, we will/i)).toHaveValue('Manually save recipes for 5 users')
    })
    expect(screen.getByLabelText(/we believe that/i)).toHaveValue('Users save recipes')
  })

  it('disables the draft button until a hypothesis is entered', () => {
    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, {
      wrapper: makeWrapper(),
    })

    expect(screen.getByRole('button', { name: /draft the rest of the test card/i })).toBeDisabled()
  })

  it('passes trimmed custom verdict labels to createExperiment when provided', async () => {
    const user = userEvent.setup()
    vi.mocked(createExperiment).mockResolvedValue(undefined)

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await fillHeader(user)
    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))
    await screen.findByLabelText(/kill label/i)
    await user.type(screen.getByLabelText(/kill label/i), '  cut ')
    await user.type(screen.getByLabelText(/keep label/i), 'ship it')
    await user.type(screen.getByLabelText(/inconclusive label/i), 'unclear')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(createExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        verdictLabels: { kill: 'cut', keep: 'ship it', inconclusive: 'unclear' },
      }),
    )
  })

  it('omits verdictLabels when the label-name fields are left empty or whitespace', async () => {
    const user = userEvent.setup()
    vi.mocked(createExperiment).mockResolvedValue(undefined)

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await fillHeader(user)
    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))
    const kill = await screen.findByLabelText(/kill label/i)
    await user.type(kill, '   ')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    const call = vi.mocked(createExperiment).mock.calls[0][0]
    expect(call).not.toHaveProperty('verdictLabels')
  })

  it('shows the default labels as placeholders on the custom-label inputs', async () => {
    const user = userEvent.setup()

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.type(screen.getByLabelText(/we believe that/i), 'H')
    await user.click(screen.getByRole('button', { name: /draft the rest of the test card/i }))

    expect(await screen.findByLabelText(/kill label/i)).toHaveAttribute('placeholder', 'killed')
    expect(screen.getByLabelText(/keep label/i)).toHaveAttribute('placeholder', 'kept')
    expect(screen.getByLabelText(/inconclusive label/i)).toHaveAttribute('placeholder', 'inconclusive')
  })
})
