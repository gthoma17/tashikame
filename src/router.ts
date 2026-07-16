import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { IndexPage } from './routes/index'
import { CreatePage } from './routes/create'

const rootRoute = createRootRoute({
  component: Outlet,
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

const routeTree = rootRoute.addChildren([indexRoute, createExperimentRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
