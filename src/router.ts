import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { IndexPage } from './routes/index'
import { ConcludeExperimentPage } from './routes/experiments/conclude'

const rootRoute = createRootRoute({
  component: Outlet,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

const concludeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/experiments/$id/conclude',
  component: ConcludeExperimentPage,
})

const routeTree = rootRoute.addChildren([indexRoute, concludeRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
