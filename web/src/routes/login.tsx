import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Shell } from '../components/Shell'
import { api, tokens } from '../lib/api'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  return <Shell><AuthForm mode="login" /></Shell>
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLogin = mode === 'login'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const path = isLogin ? '/auth/login' : '/auth/signup'
      const data = await api<{ accessToken: string; refreshToken: string }>(
        path, { method: 'POST', body: { email, password }, auth: false },
      )
      tokens.set(data.accessToken, data.refreshToken)
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-6 py-20">
      <p className="eyebrow">{isLogin ? 'Welcome back' : 'A new account'}</p>
      <h1 className="display text-4xl mt-3">
        {isLogin ? 'Sign in to Folio' : 'Make something worth answering'}
      </h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input"
            value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} className="input"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
          {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-sm text-ink-muted">
        {isLogin ? (
          <>New here? <Link to="/signup" className="underline underline-offset-4">Create an account</Link></>
        ) : (
          <>Already have one? <Link to="/login" className="underline underline-offset-4">Sign in instead</Link></>
        )}
      </p>
    </section>
  )
}
