import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

vi.mock('./lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

describe('app boots', () => {
  it('root route renders the dashboard', async () => {
    render(<App />)
    expect(await screen.findByText(/create your first experiment/i)).toBeInTheDocument()
  })
})
