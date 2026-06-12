import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import { api, isAuthed } from '../lib/api'
import {
  QUESTION_TYPE_LABELS,
  parseOptions,
  type Question,
  type QuestionType,
  type SurveyWithQuestions,
} from '../lib/types'

export const Route = createFileRoute('/surveys/$id/edit')({
  beforeLoad: () => { if (!isAuthed()) throw redirect({ to: '/login' }) },
  component: EditSurvey,
})

function EditSurvey() {
  const { id } = Route.useParams()
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingMeta, setSavingMeta] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  async function load() {
    try { setSurvey(await api<SurveyWithQuestions>(`/surveys/${id}`)) }
    catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load() }, [id])

  async function saveMeta(patch: Partial<SurveyWithQuestions>) {
    if (!survey) return
    setSurvey({ ...survey, ...patch })
    setSavingMeta(true)
    try {
      const updated = await api<SurveyWithQuestions>(`/surveys/${id}`, {
        method: 'PUT', body: patch,
      })
      setSurvey((cur) => cur ? { ...cur, ...updated } : cur)
      setSavedAt(Date.now())
    } catch (e: any) { setError(e.message) }
    finally { setSavingMeta(false) }
  }

  async function addQuestion(type: QuestionType) {
    if (!survey) return
    try {
      const q = await api<Question>(`/surveys/${id}/questions`, {
        method: 'POST',
        body: {
          type, label: 'Untitled question',
          options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : [],
          required: false,
        },
      })
      setSurvey({ ...survey, questions: [...survey.questions, q] })
    } catch (e: any) { setError(e.message) }
  }

  async function updateQuestion(q: Question, patch: Partial<Question> & { options?: string[] | string }) {
    if (!survey) return
    const optimistic = survey.questions.map((x) => x.id === q.id ? { ...x, ...patch } as Question : x)
    setSurvey({ ...survey, questions: optimistic })
    try {
      await api(`/questions/${q.id}`, {
        method: 'PUT',
        body: {
          label: patch.label,
          required: typeof patch.required === 'number' ? !!patch.required : patch.required,
          options: Array.isArray(patch.options) ? patch.options : undefined,
        },
      })
    } catch (e: any) { setError(e.message); load() }
  }

  async function deleteQuestion(q: Question) {
    if (!survey) return
    if (!confirm('Delete this question?')) return
    setSurvey({ ...survey, questions: survey.questions.filter((x) => x.id !== q.id) })
    try { await api(`/questions/${q.id}`, { method: 'DELETE' }) }
    catch (e: any) { setError(e.message); load() }
  }

  async function move(q: Question, dir: -1 | 1) {
    if (!survey) return
    const idx = survey.questions.findIndex((x) => x.id === q.id)
    const next = idx + dir
    if (next < 0 || next >= survey.questions.length) return
    const reordered = [...survey.questions]
    const [it] = reordered.splice(idx, 1)
    reordered.splice(next, 0, it)
    setSurvey({ ...survey, questions: reordered })
    try {
      await api(`/surveys/${id}/questions/reorder`, {
        method: 'PUT', body: { order: reordered.map((x) => x.id) },
      })
    } catch (e: any) { setError(e.message); load() }
  }

  const shareUrl = useMemo(
    () => survey ? `${window.location.origin}/s/${survey.slug}` : '',
    [survey?.slug],
  )

  async function copyShare() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  if (!survey) {
    return <Shell><div className="max-w-5xl mx-auto px-6 py-20 text-ink-muted">{error ?? 'Loading…'}</div></Shell>
  }

  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Link to="/dashboard" className="text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-ink">
            ← Dashboard
          </Link>

          <input
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
            onBlur={(e) => saveMeta({ title: e.target.value })}
            className="display text-5xl mt-4 w-full bg-transparent outline-none border-b border-transparent focus:border-line py-2"
          />
          <textarea
            value={survey.description}
            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
            onBlur={(e) => saveMeta({ description: e.target.value })}
            placeholder="A short description for respondents…"
            rows={2}
            className="mt-3 w-full bg-transparent outline-none text-ink-muted resize-none border-b border-transparent focus:border-line py-2"
          />

          <div className="mt-8 space-y-4">
            {survey.questions.length === 0 && (
              <div className="card p-10 text-center">
                <p className="eyebrow">No questions yet</p>
                <p className="display text-2xl mt-2">Add your first question below.</p>
              </div>
            )}
            {survey.questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                q={q}
                index={i}
                total={survey.questions.length}
                onChange={(patch) => updateQuestion(q, patch)}
                onDelete={() => deleteQuestion(q)}
                onMove={(d) => move(q, d)}
              />
            ))}
          </div>

          <div className="mt-8 card p-5">
            <p className="eyebrow">Add a question</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                <button key={t} className="btn btn-ghost" onClick={() => addQuestion(t)}>
                  + {QUESTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-6 self-start space-y-5">
          <div className="card p-5">
            <p className="eyebrow">Status</p>
            <p className="mt-1 text-sm">
              {savingMeta ? 'Saving…' : savedAt ? `Saved ${timeAgo(savedAt)}` : 'All changes saved'}
            </p>
          </div>

          <div className="card p-5">
            <p className="eyebrow">Brand</p>
            <div className="mt-4">
              <label className="label">Primary color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={survey.brand_color}
                  onChange={(e) => setSurvey({ ...survey, brand_color: e.target.value })}
                  onBlur={(e) => saveMeta({ brand_color: e.target.value })}
                  className="w-10 h-10 rounded border border-line bg-white" />
                <input className="input" value={survey.brand_color}
                  onChange={(e) => setSurvey({ ...survey, brand_color: e.target.value })}
                  onBlur={(e) => saveMeta({ brand_color: e.target.value })} />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Logo URL</label>
              <input className="input" placeholder="https://…/logo.png"
                value={survey.brand_logo_url}
                onChange={(e) => setSurvey({ ...survey, brand_logo_url: e.target.value })}
                onBlur={(e) => saveMeta({ brand_logo_url: e.target.value })} />
              {survey.brand_logo_url && (
                <img src={survey.brand_logo_url} alt="" className="mt-3 h-10 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              )}
            </div>
          </div>

          <div className="card p-5">
            <p className="eyebrow">Share</p>
            <p className="text-sm mt-2 break-all text-ink-muted">{shareUrl}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={copyShare} className="btn btn-primary">{copied ? 'Copied ✓' : 'Copy link'}</button>
              <a href={`/s/${survey.slug}`} target="_blank" className="btn btn-ghost">Preview</a>
            </div>
          </div>

          <Link to="/surveys/$id/responses" params={{ id: survey.id }} className="btn btn-ghost w-full">
            View responses →
          </Link>
        </aside>
      </section>

      {error && <p className="max-w-6xl mx-auto px-6 text-sm text-accent">{error}</p>}
    </Shell>
  )
}

function QuestionEditor({
  q, index, total, onChange, onDelete, onMove,
}: {
  q: Question
  index: number
  total: number
  onChange: (patch: Partial<Question> & { options?: string | string[] }) => void
  onDelete: () => void
  onMove: (d: -1 | 1) => void
}) {
  const opts = parseOptions(q.options as any)
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="text-xs text-ink-muted w-10 pt-2 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="chip">{QUESTION_TYPE_LABELS[q.type]}</span>
            <div className="flex gap-1 text-xs">
              <button className="btn btn-ghost !py-1 !px-2" onClick={() => onMove(-1)} disabled={index === 0}>↑</button>
              <button className="btn btn-ghost !py-1 !px-2" onClick={() => onMove(1)} disabled={index === total - 1}>↓</button>
              <button className="btn btn-danger !py-1 !px-2" onClick={onDelete}>Remove</button>
            </div>
          </div>
          <input
            value={q.label}
            onChange={(e) => onChange({ label: e.target.value })}
            onBlur={(e) => onChange({ label: e.target.value })}
            className="mt-3 w-full bg-transparent outline-none display text-xl border-b border-transparent focus:border-line py-1"
            placeholder="Type the question…"
          />

          {q.type === 'multiple_choice' && (
            <div className="mt-4 space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    value={o}
                    onChange={(e) => {
                      const next = [...opts]; next[i] = e.target.value
                      onChange({ options: next })
                    }}
                  />
                  <button className="btn btn-ghost"
                    onClick={() => onChange({ options: opts.filter((_, j) => j !== i) })}>
                    ×
                  </button>
                </div>
              ))}
              <button className="btn btn-ghost"
                onClick={() => onChange({ options: [...opts, `Option ${opts.length + 1}`] })}>
                + Add option
              </button>
            </div>
          )}

          {q.type === 'rating' && (
            <div className="mt-4 flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <div key={n} className="w-10 h-10 rounded border border-line bg-white flex items-center justify-center text-sm">{n}</div>
              ))}
            </div>
          )}

          <label className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={!!q.required}
              onChange={(e) => onChange({ required: e.target.checked ? 1 : 0 })} />
            Required
          </label>
        </div>
      </div>
    </div>
  )
}

function timeAgo(t: number) {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.round(s / 60)}m ago`
}
