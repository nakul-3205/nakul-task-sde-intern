import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'

export function Shell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth()

  return (
    <div className="grain min-h-screen relative">
      <header className="relative z-10 border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="display text-2xl">Folio</span>
            <span className="text-xs uppercase tracking-[0.18em] text-ink-muted">
              survey studio
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {isLoading ? (
              <span className="text-xs text-ink-muted">Loading…</span>
            ) : isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
                <button
                  onClick={logout}
                  className="btn btn-ghost"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/signup" className="btn btn-primary">Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 mt-24 border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-ink-muted flex justify-between">
          <span>Folio — a small survey studio.</span>
          <span>Built on Hono · Workers · D1.</span>
        </div>
      </footer>
    </div>
  )
}
