import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { Dashboard } from './Dashboard'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...(actual as object),
    Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      <a {...props}>{children}</a>,
  }
})

import { supabase } from '../lib/supabase'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders experiments in a table', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Any hypothesis', status: 'running', result: null }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('shows each experiment with its name and status', async () => {
    const experiments = [
      { id: '1', hypothesis: 'Adding banner increases signups', status: 'draft', locked_threshold: null, measured_value: null },
      { id: '2', hypothesis: 'Shorter form reduces drop-off', status: 'running', locked_threshold: null, measured_value: null },
      { id: '3', hypothesis: 'Social proof boosts trust', status: 'concluded', locked_threshold: 8, measured_value: 12 },
    ]
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: experiments, error: null }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByText('Adding banner increases signups')).toBeInTheDocument()
    expect(screen.getByText('Shorter form reduces drop-off')).toBeInTheDocument()
    expect(screen.getByText('Social proof boosts trust')).toBeInTheDocument()
  })

  it('shows kill verdict when measured value is below the locked threshold', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 4.1 }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByText('kill')).toBeInTheDocument()
  })

  it('shows keep verdict when measured value exceeds the locked threshold', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 12 }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByText('keep')).toBeInTheDocument()
  })

  it('shows inconclusive verdict when measured value equals the locked threshold', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 8 }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByText('inconclusive')).toBeInTheDocument()
  })

  it('shows no verdict for non-concluded experiments', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'running', locked_threshold: 8, measured_value: null }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    await screen.findByText('Banner test')
    expect(screen.queryByText('kill')).not.toBeInTheDocument()
    expect(screen.queryByText('keep')).not.toBeInTheDocument()
    expect(screen.queryByText('inconclusive')).not.toBeInTheDocument()
  })

  it('shows empty state prompting to create first experiment when no experiments exist', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(
      await screen.findByText(/create your first experiment/i)
    ).toBeInTheDocument()
  })
})
