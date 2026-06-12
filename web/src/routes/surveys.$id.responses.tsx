import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import { api, isAuthed } from '../lib/api'
import type { SurveyResponse, SurveyWithQuestions } from '../lib/types'

export const Route = createFileRoute('/surveys/$id/responses')({
  beforeLoad: () => { if (!isAuthed()) throw redirect({ to: '/login' }) },
  component: Responses,
})

function Responses() {
  const { id } = Route.useParams()
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [responses, setResponses] = useState<SurveyResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<number>(0)

  useEffect(() => {
    Promise.all([
      api<SurveyWithQuestions>(`/surveys/${id}`),
      api<SurveyResponse[]>(`/surveys/${id}/responses`),
    ]).then(([s, r]) => { setSurvey(s); setResponses(r) })
      .catch((e) => setError(e.message))
  }, [id])

  const stats = useMemo(() => {
    if (!responses) return null
    return { total: responses.length, last: responses[0]?.submitted_at }
  }, [responses])

  if (!survey || !responses) {
    return <Shell><div className="max-w-5xl mx-auto px-6 py-20 text-ink-muted">{error ?? 'Loading…'}</div></Shell>
  }

  const current = responses[active]

  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        <Link to="/surveys/$id/edit" params={{ id }} className="text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-ink">
          ← Back to builder
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mt-4">
          <div>
            <p className="eyebrow">Responses</p>
            <h1 className="display text-5xl mt-2">{survey.title}</h1>
          </div>
          <div className="text-sm text-ink-muted text-right">
            <div><span className="text-ink text-2xl display">{stats?.total ?? 0}</span> total responses</div>
            {stats?.last && <div>Most recent · {new Date(stats.last).toLocaleString()}</div>}
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="card p-12 text-center mt-10">
            <p className="eyebrow">Nothing yet</p>
            <h2 className="display text-3xl mt-2">No responses have come in.</h2>
            <p className="mt-2 text-ink-muted">Share your survey link to start collecting answers.</p>
            <a href={`/s/${survey.slug}`} target="_blank" className="btn btn-accent mt-6 inline-flex">Open public link</a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 mt-10">
            <aside className="lg:col-span-4">
              <div className="card divide-y divide-line max-h-[70vh] overflow-auto">
                {responses.map((r, i) => (
                  <button key={r.id}
                    onClick={() => setActive(i)}
                    className={`w-full text-left p-4 hover:bg-paper-2 transition ${active === i ? 'bg-paper-2' : ''}`}>
                    <div className="text-xs text-ink-muted tabular-nums">#{String(responses.length - i).padStart(3, '0')}</div>
                    <div className="text-sm mt-1">{new Date(r.submitted_at).toLocaleString()}</div>
                    <div className="text-xs text-ink-muted mt-1">{r.answers.length} answers</div>
                  </button>
                ))}
              </div>
            </aside>
            <div className="lg:col-span-8">
              {current && (
                <div className="card p-6">
                  <p className="eyebrow">
                    Response · {new Date(current.submitted_at).toLocaleString()}
                  </p>
                  <div className="mt-5 divide-y divide-dashed divide-line">
                    {current.answers.map((a) => (
                      <div key={a.id} className="py-4">
                        <div className="text-xs text-ink-muted">{a.question_type.replace('_', ' ')}</div>
                        <div className="display text-lg mt-1">{a.question_label}</div>
                        <div className="mt-2 text-ink whitespace-pre-wrap">{a.value || <span className="text-ink-muted italic">— skipped</span>}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </Shell>
  )
}
