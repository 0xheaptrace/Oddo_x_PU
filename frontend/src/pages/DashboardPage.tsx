import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { PageTransition } from '@/components/PageTransition'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Destination, TripListItem } from '@/lib/types'
import { formatMoney } from '@/lib/utils'
import { CalendarClock, Sparkles, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'

type Summary = {
  stats: {
    tripCount: number
    upcomingCount: number
    totalBudgetTracked: number
    citiesPlanned: number
  }
  upcomingTrips: TripListItem[]
  recentTrips: TripListItem[]
  recommendedDestinations: Destination[]
}

export function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: res } = await api.get<Summary>('/dashboard/summary')
        setData(res)
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  const checklist = {
    createTrip: data.stats.tripCount > 0,
    addStops: (data.upcomingTrips[0]?.cityCount ?? 0) > 0 || data.stats.citiesPlanned > 0,
    addBudget: data.stats.totalBudgetTracked > 0,
    shareTrip: data.recentTrips.some((t) => t.isPublic && t.shareSlug),
  }
  const done = Object.values(checklist).filter(Boolean).length

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-600">Your calm command center for upcoming adventures.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trips</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data.stats.tripCount}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming</p>
            <p className="mt-2 text-3xl font-bold text-indigo-700">{data.stats.upcomingCount}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget tracked</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{formatMoney(data.stats.totalBudgetTracked)}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cities planned</p>
            <p className="mt-2 text-3xl font-bold text-sky-700">{data.stats.citiesPlanned}</p>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Getting started</CardTitle>
            <span className="text-xs font-semibold text-slate-500">{done}/4 complete</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ChecklistRow ok={checklist.createTrip} label="Create a trip" />
            <ChecklistRow ok={checklist.addStops} label="Add city stops" />
            <ChecklistRow ok={checklist.addBudget} label="Track your first budget line" />
            <ChecklistRow ok={checklist.shareTrip} label="Publish a share link" />
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-indigo-600" />
                Upcoming trips
              </CardTitle>
              <Link to="/dashboard/trips/new">
                <Button variant="primary" className="text-xs">
                  New trip
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.upcomingTrips.length === 0 && (
                <p className="text-sm text-slate-500">No upcoming trips yet — craft your first itinerary.</p>
              )}
              {data.upcomingTrips.map((t) => (
                <Link
                  key={t.id}
                  to={`/dashboard/trips/${t.id}`}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3 transition hover:shadow-md border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.destination}</p>
                  </div>
                  <span className="text-xs font-medium text-indigo-600">Open</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Quick actions
            </CardTitle>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/dashboard/trips/new">
                <Button variant="primary" className="w-full justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Create new trip
                </Button>
              </Link>
              <Link to="/dashboard/explore/cities">
                <Button variant="secondary" className="w-full justify-center">
                  Explore cities
                </Button>
              </Link>
              <Link to="/dashboard/trips">
                <Button variant="secondary" className="w-full justify-center">
                  View packing lists
                </Button>
              </Link>
              <Link to="/dashboard/shared">
                <Button variant="secondary" className="w-full justify-center gap-2">
                  <Wallet className="h-4 w-4" /> Shared trips
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Recommended destinations</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recommendedDestinations.map((d) => (
              <Card key={d.id} className="overflow-hidden p-0">
                <div
                  className="h-28 bg-cover bg-center"
                  style={{
                    backgroundImage: d.imageUrl
                      ? `linear-gradient(180deg,rgba(15,23,42,.2),rgba(15,23,42,.55)), url(${d.imageUrl})`
                      : 'linear-gradient(135deg,#6366f1,#0ea5e9)',
                  }}
                />
                <div className="p-4">
                  <p className="font-semibold text-slate-900">
                    {d.name}, {d.country}
                  </p>
                  <p className="text-xs text-slate-500">{d.weatherSummary}</p>
                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    From {d.avgCostPerDay ? formatMoney(d.avgCostPerDay) : '—'} / day
                  </p>
                  <Link to="/dashboard/explore/cities" className="mt-3 inline-block text-xs font-semibold text-indigo-600">
                    Explore catalog →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardTitle>Recent activity</CardTitle>
          <div className="mt-4 space-y-3">
            {data.recentTrips.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]"
              >
                <div>
                  <p className="font-medium text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.status}</p>
                </div>
                <Link to={`/dashboard/trips/${t.id}`} className="text-xs font-semibold text-indigo-600">
                  View
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
        ok
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/10'
          : 'border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]'
      }`}
    >
      <span className={ok ? 'font-medium text-emerald-900' : 'text-slate-700'}>{label}</span>
      <CheckCircle2 className={`h-5 w-5 ${ok ? 'text-emerald-600' : 'text-slate-300'}`} />
    </div>
  )
}
