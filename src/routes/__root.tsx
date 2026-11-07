import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NotFound, RouteError } from '@/ui/RouteFallbacks'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
})

function RootLayout() {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  )
}
