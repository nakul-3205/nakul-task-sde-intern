import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Shell } from '../components/Shell'
import { api} from '../lib/api'
import type { Survey } from '../lib/types'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    try {
      await api('/auth/me')
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    try { setSurveys(await api<Survey[]>('/surveys')) }
    catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const s = await api<Survey>('/surveys', { method: 'POST', body: { title } })
      navigate({ to: '/surveys/$id/edit', params: { id: s.id } })
    } catch (e: any) { setError(e.message); setBusy(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this survey and all its responses?')) return
    try { await api(`/surveys/${id}`, { method: 'DELETE' }); load() }
    catch (e: any) { setError(e.message) }
  }

  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="eyebrow">Your studio</p>
            <h1 className="display text-5xl mt-2">Surveys</h1>
          </div>
          <button className="btn btn-accent" onClick={() => setShowNew((v) => !v)}>
            {showNew ? 'Close' : 'New survey'}
          </button>
        </div>

        {showNew && (
          <form onSubmit={create} className="card mt-8 p-5 flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="label">Working title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
                required autoFocus placeholder="e.g. Q4 customer pulse" />
            </div>
            <button disabled={busy || !title.trim()} className="btn btn-primary disabled:opacity-60">
              {busy ? 'Creating…' : 'Create & edit'}
            </button>
          </form>
        )}

        {error && <p className="mt-6 text-sm text-accent">{error}</p>}

        <div className="mt-10">
          {surveys === null ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : surveys.length === 0 ? (
            <EmptyState onNew={() => setShowNew(true)} />
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {surveys.map((s) => (
                <li key={s.id} className="card p-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="chip">Survey</span>
                    <span className="w-3 h-3 rounded-full border border-line"
                      style={{ background: s.brand_color }} />
                  </div>
                  <h3 className="display text-2xl mt-3 leading-tight">{s.title}</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Updated {new Date(s.updated_at).toLocaleDateString()}
                  </p>
                  <div className="mt-5 flex gap-2 flex-wrap text-sm">
                    <Link to="/surveys/$id/edit" params={{ id: s.id }} className="btn btn-ghost">Edit</Link>
                    <Link to="/surveys/$id/responses" params={{ id: s.id }} className="btn btn-ghost">Responses</Link>
                    <button className="btn btn-danger ml-auto" onClick={() => remove(s.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Shell>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="card p-12 text-center">
      <p className="eyebrow">No surveys yet</p>
      <h2 className="display text-3xl mt-2">A clean desk.</h2>
      <p className="mt-2 text-ink-muted max-w-md mx-auto">
        Make your first survey — give it a title and add a few questions. You can brand it later.
      </p>
      <button className="btn btn-accent mt-6" onClick={onNew}>Create a survey</button>
    </div>
  )
}
