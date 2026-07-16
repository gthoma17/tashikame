import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { IndexPage } from './routes/index'
import { CreatePage } from './routes/create'
import { ConcludeExperimentPage } from './routes/experiments/conclude'
import { SiteHeader } from './components/SiteHeader'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <SiteHeader />
      <Outlet />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

const createExperimentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePage,
})

const concludeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/experiments/$id/conclude',
  component: ConcludeExperimentPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  createExperimentRoute,
  concludeRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
