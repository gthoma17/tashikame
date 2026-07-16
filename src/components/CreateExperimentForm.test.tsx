import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { CreateExperimentForm } from './CreateExperimentForm'

vi.mock('../lib/experiments', () => ({
  createExperiment: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

import { createExperiment } from '../lib/experiments'

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
})
