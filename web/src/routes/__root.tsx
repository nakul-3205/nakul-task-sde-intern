import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AuthProvider } from '../lib/auth'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="display text-5xl mt-3">Page not found</h1>
        <p className="text-ink-muted mt-3">The page you were looking for has wandered off.</p>
        <a href="/" className="btn btn-primary mt-6 inline-flex">Back home</a>
      </div>
    </div>
  ),
})
