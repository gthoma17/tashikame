import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter, createRootRoute, createRoute, RouterProvider, Outlet } from '@tanstack/react-router'
import { SiteHeader } from './SiteHeader'

function renderWithRouter(ui: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => <><SiteHeader /><Outlet /></> })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <>{ui}</> })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('SiteHeader', () => {
  it('renders the Tashikani wordmark', async () => {
    renderWithRouter(<div>page</div>)
    expect(await screen.findByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('Tashikani')).toBeInTheDocument()
  })

  it('renders the mascot as an accessible image next to the wordmark', async () => {
    renderWithRouter(<div>page</div>)
    const mascot = await screen.findByRole('img', { name: /tashikani mascot/i })
    expect(mascot).toBeInTheDocument()
  })
})
