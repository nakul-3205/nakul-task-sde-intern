import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { parseOptions, type Question, type SurveyWithQuestions } from '../lib/types'

export const Route = createFileRoute('/s/$slug')({ component: PublicSurvey })

function PublicSurvey() {
  const { slug } = Route.useParams()
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setError(null)
    setSurvey(null)
    setDone(false)
    api<SurveyWithQuestions>(`/s/${slug}`, { auth: false })
      .then((data) => {
        setSurvey(data)
        setAnswers({})
      })
      .catch((e) => setError(e.message))
  }, [slug])

  const brand = survey?.brand_color || '#1a1714'
  // const logo = survey?.brand_logo_url
  const logo = survey?.brand_logo_url
  ? getLogoUrl(survey.brand_logo_url)
  : ''

  const brandAccent = useMemo(() => ({ backgroundColor: brand }), [brand])
  function getLogoUrl(input: string) {
    if (!input) return ''
  
    try {
      const domain = new URL(
        input.startsWith('http')
          ? input
          : `https://${input}`,
      ).hostname
  
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch {
      return ''
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!survey) return

    const missing = survey.questions.filter((q) => q.required && !(answers[q.id] || '').trim())
    if (missing.length) {
      setError(`Please answer: ${missing.map((q) => q.label).join(', ')}`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await api(`/s/${slug}/respond`, {
        method: 'POST', auth: false,
        body: {
          answers: survey.questions
            .filter((q) => (answers[q.id] || '').length > 0)
            .map((q) => ({ question_id: q.id, value: answers[q.id] })),
        },
      })
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <div className="grain absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24 text-center">
          <div className="max-w-xl rounded-3xl border border-line bg-white/95 px-8 py-16 shadow-[0_40px_120px_-60px_rgba(26,23,20,0.25)]">
            <p className="eyebrow">Public survey</p>
            <h1 className="display text-4xl mt-4">Loading survey…</h1>
            <p className="mt-4 text-sm text-ink-muted">{error ?? 'Please wait while we fetch your survey.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grain absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <header className="border-b border-line bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-3xl text-white" style={brandAccent}>
                {logo ? <span className="text-sm font-semibold">✓</span> : <span className="text-2xl font-semibold">F</span>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">Survey preview</p>
                <p className="text-sm font-medium text-ink">{survey.title}</p>
              </div>
            </div>
            <a href="/" className="btn btn-ghost">Back to home</a>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-line bg-white p-8 shadow-[0_30px_70px_-40px_rgba(26,23,20,0.15)]">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow">{survey.title}</p>
                    <h1 className="display text-5xl leading-tight mt-3">{survey.title}</h1>
                    {survey.description && (
                      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{survey.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl border border-line bg-paper px-4 py-3">
                    <div className="h-11 w-11 rounded-3xl bg-white" style={brandAccent}>
                      {logo ? <img src={logo} alt="Brand logo" className="h-full w-full rounded-3xl object-cover" /> : null}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Brand color</p>
                      <p className="font-medium" style={{ color: brand }}>{brand}</p>
                    </div>
                  </div>
                </div>
              </div>

              {done ? (
                <div className="rounded-[2rem] border border-line bg-white p-10 text-center shadow-[0_30px_70px_-40px_rgba(26,23,20,0.15)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white" style={brandAccent}>✓</div>
                  <h2 className="display text-3xl mt-6">Thank you for your response!</h2>
                  <p className="mt-4 text-ink-muted">Your answers were submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-6">
                  {survey.questions.map((question, index) => {
                    const opts = parseOptions(question.options)
                    const answer = answers[question.id] || ''
                    const setAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [question.id]: value }))

                    return (
                      <fieldset key={question.id} className="rounded-[1.5rem] border border-line bg-white p-6">
                        <legend className="flex items-center justify-between gap-4 text-sm text-ink-muted">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          {question.required ? <span className="chip">Required</span> : <span className="chip">Optional</span>}
                        </legend>
                        <p className="display text-2xl mt-4">{question.label}</p>

                        <div className="mt-5 space-y-4">
                          {question.type === 'short_text' && (
                            <input
                              type="text"
                              className="input"
                              value={answer}
                              onChange={(event) => setAnswer(event.target.value)}
                              placeholder="Write your answer here"
                            />
                          )}

                          {question.type === 'long_text' && (
                            <textarea
                              rows={5}
                              className="textarea"
                              value={answer}
                              onChange={(event) => setAnswer(event.target.value)}
                              placeholder="Write your answer here"
                            />
                          )}

                          {question.type === 'multiple_choice' && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {opts.map((option) => (
                                <button
                                  type="button"
                                  key={option}
                                  onClick={() => setAnswer(option)}
                                  className={`rounded-3xl border px-4 py-3 text-left transition ${answer === option ? 'border-transparent bg-[brand] text-white' : 'border-line bg-paper hover:bg-paper-2'}`}
                                  style={answer === option ? { backgroundColor: brand, color: '#fff' } : {}}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}

                          {question.type === 'rating' && (
                            <div className="flex flex-wrap gap-3">
                              {[1, 2, 3, 4, 5].map((rating) => {
                                const selected = String(rating) === answer
                                return (
                                  <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setAnswer(String(rating))}
                                    className={`h-14 w-14 rounded-3xl border text-lg font-semibold transition ${selected ? 'border-transparent text-white' : 'border-line bg-white hover:bg-paper-2'}`}
                                    style={selected ? { backgroundColor: brand } : {}}
                                  >
                                    {rating}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </fieldset>
                    )
                  })}

                  {error && <p className="text-sm text-accent">{error}</p>}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-ink-muted">All responses are private and secure.</p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-accent w-full sm:w-auto disabled:opacity-60"
                    >
                      {submitting ? 'Submitting…' : 'Submit response'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_30px_70px_-40px_rgba(26,23,20,0.15)]">
                <p className="eyebrow">Survey details</p>
                <div className="mt-5 space-y-3 text-sm text-ink-muted">
                  <div>
                    <span className="font-medium text-ink">Link</span>
                    <p className="break-all">{window.location.href}</p>
                  </div>
                  <div>
                    <span className="font-medium text-ink">Questions</span>
                    <p>{survey.questions.length}</p>
                  </div>
                  <div>
                    <span className="font-medium text-ink">Required replies</span>
                    <p>{survey.questions.filter((q) => q.required).length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_30px_70px_-40px_rgba(26,23,20,0.15)]">
                <p className="eyebrow">Brand preview</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-3xl" style={brandAccent} />
                  <div>
                    <p className="font-medium">Primary color</p>
                    <p className="text-sm text-ink-muted">{brand}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
