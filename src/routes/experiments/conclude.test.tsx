import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/experiments', () => ({
  concludeExperiment: vi.fn().mockResolvedValue(undefined),
}))

import { ConcludeExperimentForm } from './conclude'
import { concludeExperiment } from '../../lib/experiments'

const mockConclude = concludeExperiment as ReturnType<typeof vi.fn>

describe('ConcludeExperimentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a numeric input and save button', () => {
    render(<ConcludeExperimentForm experimentId="exp-123" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls concludeExperiment with entered value on submit', async () => {
    render(<ConcludeExperimentForm experimentId="exp-123" />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42.5' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(mockConclude).toHaveBeenCalledWith('exp-123', 42.5)
    })
  })

  it('disables the button while submitting', async () => {
    let resolve!: () => void
    mockConclude.mockReturnValue(new Promise<void>((r) => { resolve = r }))

    render(<ConcludeExperimentForm experimentId="exp-123" />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })

    await act(async () => { resolve() })
  })
})
