import { render, screen, fireEvent } from '@testing-library/react'
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

vi.mock('../lib/experiments', async () => {
  const actual = await vi.importActual<typeof import('../lib/experiments')>('../lib/experiments')
  return { ...actual, writeVerdictBack: vi.fn() }
})

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...(actual as object),
    Link: ({
      children,
      to,
      params,
      ...rest
    }: {
      children?: React.ReactNode
      to?: string
      params?: Record<string, string>
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const href = to && params
        ? Object.entries(params).reduce(
            (acc, [k, v]) => acc.replace(`$${k}`, v),
            to,
          )
        : to
      return <a href={href} {...rest}>{children}</a>
    },
  }
})

import { supabase } from '../lib/supabase'
import { writeVerdictBack } from '../lib/experiments'

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
      { id: '1', hypothesis: 'Adding banner increases signups', status: 'running', locked_threshold: null, measured_value: null },
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

  it('shows a write-back button for concluded experiments with a verdict', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 4.1 }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByRole('button', { name: /write back/i })).toBeInTheDocument()
  })

  it('does not show a write-back button for non-concluded experiments', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', hypothesis: 'Banner test', status: 'running', locked_threshold: 8, measured_value: null }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    await screen.findByText('Banner test')
    expect(screen.queryByRole('button', { name: /write back/i })).not.toBeInTheDocument()
  })

  it('calls writeVerdictBack with the experiment id when write-back button is clicked', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'exp-1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 4.1 }],
        error: null,
      }),
    } as any)
    vi.mocked(writeVerdictBack).mockResolvedValue({ storyIds: ['200029021'], label: 'killed' })

    render(<Dashboard />, { wrapper: makeWrapper() })

    const btn = await screen.findByRole('button', { name: /write back/i })
    fireEvent.click(btn)

    expect(writeVerdictBack).toHaveBeenCalledWith('exp-1')
  })

  it('shows success state after a successful write-back', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'exp-1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 4.1 }],
        error: null,
      }),
    } as any)
    vi.mocked(writeVerdictBack).mockResolvedValue({ storyIds: ['200029021'], label: 'killed' })

    render(<Dashboard />, { wrapper: makeWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /write back/i }))

    expect(await screen.findByText(/written/i)).toBeInTheDocument()
  })

  it('shows a Conclude action linking to the conclude form for running experiments', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'run-1', hypothesis: 'Running one', status: 'running', locked_threshold: 8, measured_value: null }],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    const link = await screen.findByRole('link', { name: /conclude/i })
    expect(link).toHaveAttribute('href', '/experiments/run-1/conclude')
  })

  it('does not show a Conclude action on concluded rows', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { id: 'done-1', hypothesis: 'Concluded one', status: 'concluded', locked_threshold: 8, measured_value: 12 },
        ],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    await screen.findByText('Concluded one')
    expect(screen.queryByRole('link', { name: /conclude/i })).not.toBeInTheDocument()
  })

  it('shows the locked threshold value on each row', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            hypothesis: 'Banner test',
            status: 'running',
            locked_threshold: 8,
            measured_value: null,
            experiment_threshold_overrides: [],
          },
        ],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    expect(await screen.findByText('8')).toBeInTheDocument()
  })

  it('marks the threshold as overridden when the override log has entries', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            hypothesis: 'Banner test',
            status: 'running',
            locked_threshold: 12,
            measured_value: null,
            experiment_threshold_overrides: [
              { old_value: 8, new_value: 12, created_at: '2026-07-17T00:00:00Z' },
            ],
          },
        ],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    await screen.findByText('Banner test')
    expect(screen.getByText(/overridden/i)).toBeInTheDocument()
    expect(screen.getByText(/was 8/i)).toBeInTheDocument()
  })

  it('does not mark the threshold as overridden when no override entries exist', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            hypothesis: 'Banner test',
            status: 'running',
            locked_threshold: 8,
            measured_value: null,
            experiment_threshold_overrides: [],
          },
        ],
        error: null,
      }),
    } as any)

    render(<Dashboard />, { wrapper: makeWrapper() })

    await screen.findByText('Banner test')
    expect(screen.queryByText(/overridden/i)).not.toBeInTheDocument()
  })

  it('shows error and retry button when write-back fails', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'exp-1', hypothesis: 'Banner test', status: 'concluded', locked_threshold: 8, measured_value: 4.1 }],
        error: null,
      }),
    } as any)
    vi.mocked(writeVerdictBack).mockRejectedValue(new Error('TB unavailable'))

    render(<Dashboard />, { wrapper: makeWrapper() })

    fireEvent.click(await screen.findByRole('button', { name: /write back/i }))

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
