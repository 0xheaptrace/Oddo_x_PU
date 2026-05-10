import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  LineChart,
  Map as MapIcon,
  Shield,
  Sparkles,
  Users,
  Moon,
  Sun,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'

const features = [
  {
    title: 'Multi-city itineraries',
    desc: 'Drag-and-drop stops, precise timelines, and transport notes in one calm workspace.',
    icon: Globe2,
  },
  {
    title: 'Budget intelligence',
    desc: 'Category-aware charts with gentle alerts before spend drifts off course.',
    icon: LineChart,
  },
  {
    title: 'Collaborative sharing',
    desc: 'Publish read-only itineraries with copy-to-trip for friends and family.',
    icon: Users,
  },
  {
    title: 'Packing & journal',
    desc: 'Templates for essentials plus markdown-friendly notes tied to each day.',
    icon: Sparkles,
  },
]

const steps = [
  { title: 'Shape the route', body: 'Create a trip, upload a cover, set dates and destinations.' },
  { title: 'Layer activities', body: 'Pull from curated experiences or craft your own timeline blocks.' },
  { title: 'Share confidently', body: 'Flip on public mode, share the link, invite collaborators.' },
]

export function LandingPage() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 font-display text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
              T
            </div>
            <span className="font-display text-lg font-bold text-[color:var(--text)]">Traveloop</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--muted)] md:flex">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
            <Link to="/login" className="hover:text-slate-900">
              Login
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold hover:opacity-95 border-[color:var(--panel-border)] bg-[color:var(--panel-solid)] text-[color:var(--text)]"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <Link to="/signup">
              <Button variant="primary" className="!py-2 !text-sm">
                Sign up
              </Button>
            </Link>
          </nav>
          <div className="flex md:hidden">
            <Link to="/login">
              <Button variant="ghost" className="!py-2">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.2),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
              <Shield className="h-3.5 w-3.5" /> Privacy-first planning
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-[color:var(--text)] md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Personalized travel planning, orchestrated like a premium SaaS suite.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[color:var(--muted)]">
              Traveloop connects itineraries, budgets, packing lists, and shared trips into one cohesive journey OS —
              polished enough for funded startups, friendly enough for weekend explorers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="primary" className="gap-2 px-6 py-3 text-base">
                  Start planning <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="gap-2 px-6 py-3 text-base">
                  Explore trips
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 text-sm text-[color:var(--muted)]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Glass UI kit included
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Maps + analytics ready
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="relative"
          >
            <div className="glass-panel relative overflow-hidden rounded-[28px] p-6 shadow-[var(--shadow-float)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Upcoming</p>
                    <p className="font-display text-xl font-bold text-slate-900">Coastal Japan Sprint</p>
                  </div>
                  <MapIcon className="h-10 w-10 text-sky-500" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-medium text-slate-600">
                  <div className="rounded-2xl py-3 shadow-inner bg-white/70 dark:bg-white/5">
                    <p className="text-lg font-bold text-slate-900">9</p> days
                  </div>
                  <div className="rounded-2xl py-3 shadow-inner bg-white/70 dark:bg-white/5">
                    <p className="text-lg font-bold text-slate-900">3</p> cities
                  </div>
                  <div className="rounded-2xl py-3 shadow-inner bg-white/70 dark:bg-white/5">
                    <p className="text-lg font-bold text-slate-900">₹4.2L</p> budget
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-[color:var(--muted)]">
                  Traveloop keeps cards, maps, and charts visually aligned — no random accent colors between screens.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-[color:var(--text)]">Everything feels connected</h2>
          <p className="mt-3 text-[color:var(--muted)]">One ecosystem for logistics, storytelling, and collaboration.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full">
                <f.icon className="h-8 w-8 text-indigo-600" />
                <h3 className="mt-4 font-display text-lg font-semibold text-[color:var(--text)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white/60 py-20 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-[color:var(--text)]">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[color:var(--text)]">{s.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="text-center font-display text-3xl font-bold text-[color:var(--text)]">What Indian travelers say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                'Used it to plan Jaipur → Udaipur → Jodhpur. The drag-drop stops + budget charts made it feel like a real product, not a spreadsheet.',
              who: 'Aarav Mehta',
              role: 'Mumbai · 3-city Rajasthan trip',
            },
            {
              quote:
                'The packing templates and day-wise journal saved me during a Kerala monsoon trip. Everything stayed in one clean workspace.',
              who: 'Ananya Iyer',
              role: 'Bengaluru · Kerala itinerary',
            },
            {
              quote:
                'Shared my Ladakh plan with friends, they copied it and edited their own version. The public itinerary view looks premium.',
              who: 'Kabir Singh',
              role: 'Delhi · Ladakh planning crew',
            },
          ].map((t) => (
            <Card key={t.who}>
              <p className="text-sm leading-relaxed text-[color:var(--muted)]">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-[color:var(--text)]">{t.who}</p>
              <p className="text-xs text-[color:var(--muted)]">{t.role}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-gradient-to-br from-indigo-700 via-sky-600 to-indigo-800 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 className="font-display text-3xl font-bold">Pricing that scales with your wanderlust</h2>
          <p className="mt-4 text-indigo-100">
            Starter workspaces are free during the hackathon window — upgrade paths mirror modern SaaS tiers when you ship
            to production.
          </p>
          <div className="mt-10 rounded-3xl bg-white/10 p-8 backdrop-blur-xl ring-1 ring-white/30">
            <p className="text-sm uppercase tracking-widest text-indigo-100">Early access</p>
            <p className="mt-4 font-display text-5xl font-bold">$0</p>
            <p className="mt-2 text-indigo-100">Includes automation-ready API + analytics-ready schema.</p>
            <Link to="/signup" className="mt-8 inline-block">
              <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Create your workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-[color:var(--muted)] md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-xs font-bold text-white">
              T
            </div>
            Traveloop © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:opacity-90">
              Features
            </a>
            <Link to="/login" className="hover:opacity-90">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
