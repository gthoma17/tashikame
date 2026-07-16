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
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

import { createExperiment } from '../lib/experiments'
import { surfaceRiskiestAssumption } from '../lib/llm'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('CreateExperimentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the experiment scoped to the picked label and navigates to the dashboard', async () => {
    const user = userEvent.setup()
    vi.mocked(createExperiment).mockResolvedValue(undefined)

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.type(
      screen.getByLabelText(/hypothesis/i),
      'Users save 3 recipes per week',
    )
    await user.type(screen.getByLabelText(/threshold/i), '3')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(createExperiment).toHaveBeenCalledWith({
      labelId: 'label-7',
      hypothesis: 'Users save 3 recipes per week',
      lockedThreshold: 3,
    })
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  it('shows a validation error and does not submit when fields are empty', async () => {
    const user = userEvent.setup()

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/hypothesis.*threshold/i)
    expect(createExperiment).not.toHaveBeenCalled()
  })

  it('disables submit when no label is picked', () => {
    render(<CreateExperimentForm labelId={null} labelName={null} />, {
      wrapper: makeWrapper(),
    })

    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
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

    const hypothesis = await screen.findByLabelText(/hypothesis/i)
    await vi.waitFor(() => {
      expect(hypothesis).toHaveValue('Users will save 3+ recipes per week')
    })
    expect(surfaceRiskiestAssumption).toHaveBeenCalledWith({
      labelId: 'label-7',
      labelName: 'profile',
    })

    // Editable: user can amend and save
    await user.type(hypothesis, ' (revised)')
    await user.type(screen.getByLabelText(/threshold/i), '3')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(createExperiment).toHaveBeenCalledWith({
      labelId: 'label-7',
      hypothesis: 'Users will save 3+ recipes per week (revised)',
      lockedThreshold: 3,
    })
  })

  it('shows an error and preserves user input when the LLM is unavailable, allowing retry', async () => {
    const user = userEvent.setup()
    vi.mocked(surfaceRiskiestAssumption).mockRejectedValueOnce(new Error('upstream down'))

    render(<CreateExperimentForm labelId="label-7" labelName="profile" />, { wrapper: makeWrapper() })

    // User has already typed a threshold before trying to surface — must not lose it
    await user.type(screen.getByLabelText(/threshold/i), '5')
    await user.click(screen.getByRole('button', { name: /surface the riskiest assumption/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/could not surface/i)
    expect(screen.getByLabelText(/threshold/i)).toHaveValue(5)

    // Retry succeeds
    vi.mocked(surfaceRiskiestAssumption).mockResolvedValueOnce({ assumption: 'Retry worked' })
    await user.click(screen.getByRole('button', { name: /surface the riskiest assumption/i }))

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/hypothesis/i)).toHaveValue('Retry worked')
    })
    expect(screen.getByLabelText(/threshold/i)).toHaveValue(5)
  })

  it('disables the surface button until a label is picked', () => {
    render(<CreateExperimentForm labelId={null} labelName={null} />, {
      wrapper: makeWrapper(),
    })

    expect(screen.getByRole('button', { name: /surface the riskiest assumption/i })).toBeDisabled()
  })
})
