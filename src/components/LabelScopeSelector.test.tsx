import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { LabelScopeSelector } from './LabelScopeSelector'

vi.mock('../lib/tracker-boot', () => ({
  fetchLabels: vi.fn(),
}))

import { fetchLabels } from '../lib/tracker-boot'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('LabelScopeSelector', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists labels from Tracker Boot as options', async () => {
    vi.mocked(fetchLabels).mockResolvedValue([
      { id: '1', name: 'profile' },
      { id: '2', name: 'onboarding' },
    ])

    render(<LabelScopeSelector />, { wrapper: makeWrapper() })

    expect(await screen.findByRole('option', { name: 'profile' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'onboarding' })).toBeInTheDocument()
  })

  it('calls onLabelPick when a label is selected', async () => {
    const user = userEvent.setup()
    const onLabelPick = vi.fn()
    vi.mocked(fetchLabels).mockResolvedValue([
      { id: '1', name: 'profile' },
      { id: '2', name: 'onboarding' },
    ])

    render(<LabelScopeSelector onLabelPick={onLabelPick} />, { wrapper: makeWrapper() })

    await screen.findByRole('option', { name: 'profile' })
    await user.selectOptions(screen.getByRole('combobox'), 'profile')

    expect(onLabelPick).toHaveBeenCalledWith({ id: '1', name: 'profile' })
  })

  it('shows an error message when labels cannot be loaded', async () => {
    vi.mocked(fetchLabels).mockRejectedValue(new Error('boom'))

    render(<LabelScopeSelector />, { wrapper: makeWrapper() })

    expect(
      await screen.findByText(/could not load labels/i),
    ).toBeInTheDocument()
  })
})
