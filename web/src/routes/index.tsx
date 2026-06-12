import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Shell } from '../components/Shell'
import { isAuthed } from '../lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (isAuthed()) throw redirect({ to: '/dashboard' })
  },
  component: Landing,
})

function Landing() {
  return (
    <Shell>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow">A survey studio for people who care</p>
          <h1 className="display text-6xl md:text-7xl leading-[1.02] mt-5">
            Ask better<br />
            <em className="text-accent not-italic">questions.</em><br />
            Wear your brand.
          </h1>
          <p className="mt-6 text-lg text-ink-muted max-w-xl">
            Folio is a small, opinionated builder for surveys you'd actually want
            to fill out. Compose a questionnaire, dress it in your color, and
            share a single link.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn btn-accent">Create your first survey →</Link>
            <Link to="/login" className="btn btn-ghost">I already have an account</Link>
          </div>
        </div>
        <aside className="lg:col-span-5">
          <DemoCard />
        </aside>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-px bg-line border-y border-line">
        {[
          { n: '01', t: 'Compose', d: 'Drag-ordered questions in four shapes: short text, long text, multiple choice, rating.' },
          { n: '02', t: 'Brand', d: 'A primary color and a logo URL. That\u2019s the whole knob.' },
          { n: '03', t: 'Listen', d: 'A clean response feed per survey. Read every answer in context.' },
        ].map((b) => (
          <div key={b.n} className="bg-paper p-8">
            <div className="text-xs tracking-[0.2em] text-ink-muted">{b.n}</div>
            <h3 className="display text-2xl mt-3">{b.t}</h3>
            <p className="mt-2 text-sm text-ink-muted">{b.d}</p>
          </div>
        ))}
      </section>
    </Shell>
  )
}

function DemoCard() {
  return (
    <div className="card p-6 shadow-[0_30px_60px_-30px_rgba(26,23,20,0.25)]">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-medium">A</div>
        <div>
          <div className="text-sm font-medium">Aperture Coffee</div>
          <div className="text-xs text-ink-muted">Customer satisfaction · 3 min</div>
        </div>
      </div>
      <div className="pt-5 space-y-5">
        <div>
          <div className="text-xs text-ink-muted">01 / 03</div>
          <div className="display text-xl mt-1">How was your last visit?</div>
          <div className="mt-3 flex gap-2">
            {[1,2,3,4,5].map((n) => (
              <div key={n} className={`w-9 h-9 rounded border flex items-center justify-center text-sm ${n===4 ? 'bg-accent text-white border-transparent' : 'bg-white border-line'}`}>{n}</div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-dashed border-line">
          <div className="text-xs text-ink-muted">02 / 03</div>
          <div className="display text-xl mt-1">What did you order?</div>
          <div className="mt-3 space-y-2">
            {['Cortado','Filter','Pastry'].map((o,i) => (
              <div key={o} className="px-3 py-2 rounded border border-line bg-white text-sm flex items-center justify-between">
                <span>{o}</span>
                <span className={`w-4 h-4 rounded-full border ${i===0 ? 'bg-accent border-transparent' : 'border-line'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
