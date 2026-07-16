import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { LabelScopeSelector } from './LabelScopeSelector'

vi.mock('../lib/tracker-boot', () => ({
  fetchLabels: vi.fn(),
  fetchStoriesByLabel: vi.fn(),
}))

import { fetchLabels, fetchStoriesByLabel } from '../lib/tracker-boot'

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

  it('shows stories for the selected label', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchLabels).mockResolvedValue([
      { id: '1', name: 'profile' },
      { id: '2', name: 'onboarding' },
    ])
    vi.mocked(fetchStoriesByLabel).mockResolvedValue([
      { id: '101', title: 'User can edit profile' },
      { id: '102', title: 'User can upload avatar' },
    ])

    render(<LabelScopeSelector />, { wrapper: makeWrapper() })

    await screen.findByRole('option', { name: 'profile' })
    await user.selectOptions(screen.getByRole('combobox'), 'profile')

    expect(await screen.findByText('User can edit profile')).toBeInTheDocument()
    expect(screen.getByText('User can upload avatar')).toBeInTheDocument()
  })

  it('shows empty message when selected label has no stories', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchLabels).mockResolvedValue([{ id: '1', name: 'legacy' }])
    vi.mocked(fetchStoriesByLabel).mockResolvedValue([])

    render(<LabelScopeSelector />, { wrapper: makeWrapper() })

    await screen.findByRole('option', { name: 'legacy' })
    await user.selectOptions(screen.getByRole('combobox'), 'legacy')

    expect(
      await screen.findByText(/no stories to experiment on/i)
    ).toBeInTheDocument()
  })
})
